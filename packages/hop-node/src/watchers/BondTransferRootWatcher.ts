import BaseWatcher from './classes/BaseWatcher.js'
import MerkleTree from '#utils/MerkleTree.js'
import contracts from '#contracts/index.js'
import getTransferRootId from '#utils/getTransferRootId.js'
import { BondTransferRootDelayBufferSeconds, TxError } from '#constants/index.js'
import { PossibleReorgDetected, RedundantProviderOutOfSync } from '#types/index.js'
import { chainSlugToId } from '#utils/chainSlugToId.js'
import type L1Bridge from './classes/L1Bridge.js'
import type { BigNumber, providers } from 'ethers'
import { ChainSlug } from '@hop-protocol/sdk'
import type {
  L1_Bridge as L1BridgeContract,
  L2_Bridge as L2BridgeContract
} from '@hop-protocol/sdk'
import type { TransferRoot } from '#db/TransferRootsDb.js'
import { config as globalConfig } from '#config/index.js'

type Config = {
  chainSlug: string
  tokenSymbol: string
  bridgeContract: L1BridgeContract | L2BridgeContract
  dryMode?: boolean
}

export type SendBondTransferRootTxParams = {
  transferRootId: string
  transferRootHash: string
  destinationChainId: number
  totalAmount: BigNumber
  transferIds: string[]
  rootCommittedAt: number
}

class BondTransferRootWatcher extends BaseWatcher {
  override siblingWatchers!: { [chainId: string]: BondTransferRootWatcher }

  constructor (config: Config) {
    super({
      chainSlug: config.chainSlug,
      tokenSymbol: config.tokenSymbol,
      logColor: 'cyan',
      bridgeContract: config.bridgeContract,
      dryMode: config.dryMode
    })
  }

  override async pollHandler () {
    await this.checkTransfersCommittedFromDb()
  }

  async checkTransfersCommittedFromDb () {
    const dbTransferRoots = await this.db.transferRoots.getUnbondedTransferRoots(await this.getFilterRoute())
    if (!dbTransferRoots.length) {
      this.logger.debug('no unbonded transfer root db items to check')
      return
    }

    this.logger.info(
        `checking ${dbTransferRoots.length} unbonded transfer roots db items`
    )

    const promises: Array<Promise<any>> = []
    for (const dbTransferRoot of dbTransferRoots) {
      const {
        transferRootId,
        transferRootHash,
        totalAmount,
        destinationChainId,
        committedAt,
        sourceChainId,
        transferIds
      } = dbTransferRoot
      const logger = this.logger.create({ root: transferRootId })

      const bondChainId = chainSlugToId(ChainSlug.Ethereum)
      const availableCredit = this.getAvailableCreditForBond(bondChainId)
      const notEnoughCredit = availableCredit.lt(totalAmount)
      if (notEnoughCredit) {
        logger.debug(
        `not enough credit to bond transferRoot. Have ${this.bridge.formatUnits(
          availableCredit
        )}, need ${this.bridge.formatUnits(totalAmount)}`)
        continue
      }

      promises.push(this.checkTransfersCommitted(
        transferRootId,
        transferRootHash,
        totalAmount,
        destinationChainId,
        committedAt,
        sourceChainId,
        transferIds
      ))
    }

    await Promise.all(promises)
  }

  async checkTransfersCommitted (
    transferRootId: string,
    transferRootHash: string,
    totalAmount: BigNumber,
    destinationChainId: number,
    committedAt: number,
    sourceChainId: number,
    transferIds: string[]
  ) {
    const logger = this.logger.create({ root: transferRootId })
    const l1Bridge = this.getSiblingWatcherByChainSlug(ChainSlug.Ethereum).bridge as L1Bridge

    const minTransferRootBondDelaySeconds = await l1Bridge.getMinTransferRootBondDelaySeconds()
    const delaySeconds = minTransferRootBondDelaySeconds + BondTransferRootDelayBufferSeconds
    const delayMs = delaySeconds * 1000
    const committedAtMs = committedAt * 1000
    const delta = Date.now() - committedAtMs - delayMs
    const shouldBond = delta > 0
    if (!shouldBond) {
      logger.debug(
        `too early to bond. Must wait ${Math.abs(
          delta
        )} milliseconds`
      )
      return
    }

    const isBonded = await l1Bridge.isTransferRootIdBonded(transferRootId)
    if (isBonded) {
      logger.warn('checkTransfersCommitted already bonded. marking item not found.')
      await this.db.transferRoots.update(transferRootId, { isNotFound: true })
      return
    }

    logger.info(`source: ${sourceChainId} transferRootId: ${transferRootId} transferRootHash: ${transferRootHash}`)
    logger.debug('committedAt:', committedAt)
    logger.debug('destinationChainId:', destinationChainId)
    logger.debug('sourceChainId:', sourceChainId)
    logger.debug('transferRootId:', transferRootId)
    logger.debug('transferRootHash:', transferRootHash)
    logger.debug('totalAmount:', this.bridge.formatUnits(totalAmount))

    const pendingTransfers: string[] = transferIds ?? []
    logger.debug('transferRootHash transferIds:', pendingTransfers)
    if (pendingTransfers.length > 0) {
      const tree = new MerkleTree(pendingTransfers)
      const rootHash = tree.getHexRoot()
      logger.debug('calculated transfer root hash:', rootHash)
      if (rootHash !== transferRootHash) {
        logger.error('calculated transfer root hash does not match')
        return
      }
    }

    const bondChainId = chainSlugToId(ChainSlug.Ethereum)
    const bondAmount = await l1Bridge.getBondForTransferAmount(totalAmount)
    const availableCredit = this.getAvailableCreditForBond(bondChainId)
    const notEnoughCredit = availableCredit.lt(bondAmount)
    if (notEnoughCredit) {
      const msg = `not enough credit to bond transferRoot. Have ${this.bridge.formatUnits(
          availableCredit
        )}, need ${this.bridge.formatUnits(bondAmount)}`
      logger.error(msg)
      await this.notifier.error(msg)
      return
    }

    if (this.dryMode || globalConfig.emergencyDryMode) {
      logger.warn(`dry: ${this.dryMode}, emergencyDryMode: ${globalConfig.emergencyDryMode}, skipping bondTransferRoot`)
      return
    }

    logger.debug(
      `attempting to bond transfer root id ${transferRootId} with destination chain ${destinationChainId}`
    )

    await this.db.transferRoots.update(transferRootId, {
      sentBondTxAt: Date.now()
    })

    try {
      const tx = await this.sendBondTransferRoot({
        transferRootId,
        transferRootHash,
        destinationChainId,
        totalAmount,
        transferIds,
        rootCommittedAt: committedAt
      })

      const msg = `L1 bondTransferRoot dest ${destinationChainId}, tx ${tx.hash} transferRootHash: ${transferRootHash}`
      logger.info(msg)
      await this.notifier.info(msg)
    } catch (err) {
      logger.error('sendBondTransferRoot error:', err.message)
      const transferRoot = await this.db.transferRoots.getByTransferRootId(transferRootId)
      if (!transferRoot) {
        throw new Error('transferRoot not found in db')
      }

      let { rootBondBackoffIndex } = transferRoot
      if (!rootBondBackoffIndex) {
        rootBondBackoffIndex = 0
      }

      if (err instanceof RedundantProviderOutOfSync) {
        logger.error('redundant provider out of sync. trying again.')
        rootBondBackoffIndex++
        await this.db.transferRoots.update(transferRootId, {
          rootBondTxError: TxError.RedundantRpcOutOfSync,
          rootBondBackoffIndex
        })
        return
      }
      throw err
    }
  }

  async sendBondTransferRoot (params: SendBondTransferRootTxParams): Promise<providers.TransactionResponse> {
    const {
      transferRootId,
      transferRootHash,
      destinationChainId,
      totalAmount
    } = params

    const logger = this.logger.create({ root: transferRootId })

    logger.debug('performing preTransactionValidation')
    await this.preTransactionValidation(params)

    const l1Bridge = this.getSiblingWatcherByChainSlug(ChainSlug.Ethereum).bridge as L1Bridge
    return l1Bridge.bondTransferRoot(
      transferRootHash,
      destinationChainId,
      totalAmount
    )
  }

  getAvailableCreditForBond (destinationChainId: number) {
    const baseAvailableCredit = this.availableLiquidityWatcher.getBaseAvailableCredit(destinationChainId)
    return baseAvailableCredit
  }

  async preTransactionValidation (txParams: SendBondTransferRootTxParams): Promise<void> {
    // Perform this check as late as possible before the transaction is sent
    const calculatedDbTransferRoot = await this.getCalculatedDbTransferRoot(txParams)

    await this.validateDbExistence(txParams, calculatedDbTransferRoot)
    await this.validateDestinationChainId(txParams, calculatedDbTransferRoot)
    await this.validateUniqueness(txParams, calculatedDbTransferRoot)
    await this.validateLogsWithRedundantRpcs(txParams, calculatedDbTransferRoot)
  }

  async validateDbExistence (txParams: SendBondTransferRootTxParams, calculatedDbTransferRoot: TransferRoot): Promise<void> {
    // Validate DB existence with calculated transferRootId
    const logger = this.logger.create({ root: txParams.transferRootId })
    logger.debug('validating db existence')

    if (!calculatedDbTransferRoot?.transferRootId || !txParams?.transferRootId) {
      throw new PossibleReorgDetected(`Calculated transferRootId (${calculatedDbTransferRoot?.transferRootId}) or transferIds (${txParams?.transferRootId}) is missing`)
    }
    if (calculatedDbTransferRoot.transferRootId !== txParams.transferRootId) {
      throw new PossibleReorgDetected(`Calculated calculatedTransferRootId (${calculatedDbTransferRoot.transferRootId}) does not match transferRootId in db`)
    }
  }

  async validateDestinationChainId (txParams: SendBondTransferRootTxParams, calculatedDbTransferRoot: TransferRoot): Promise<void> {
    // Validate that the destination chain id matches the db item
    const logger = this.logger.create({ root: txParams.transferRootId })
    logger.debug('validating destination chain id')
    if (!calculatedDbTransferRoot?.destinationChainId || !txParams?.destinationChainId) {
      throw new PossibleReorgDetected(`Calculated destinationChainId (${calculatedDbTransferRoot?.destinationChainId}) or transferIds (${txParams?.destinationChainId}) is missing`)
    }
    if (calculatedDbTransferRoot.destinationChainId !== txParams.destinationChainId) {
      throw new PossibleReorgDetected(`Calculated destinationChainId (${txParams.destinationChainId}) does not match destinationChainId in db (${calculatedDbTransferRoot.destinationChainId})`)
    }
  }

  async validateUniqueness (txParams: SendBondTransferRootTxParams, calculatedDbTransferRoot: TransferRoot): Promise<void> {
    // Validate uniqueness for redundant reorg protection. A transferId should only exist in one transferRoot per source chain
    const logger = this.logger.create({ root: txParams.transferRootId })
    logger.debug('validating uniqueness')

    // Empty transferIds should only occur during times where event data is missed.
    const txParamTransferIds = txParams?.transferIds ?? []
    if (!txParamTransferIds.length) {
      logger.debug('no transferIds to validate')
      return
    }
    const transferIds = txParamTransferIds.map((x: string) => x.toLowerCase())

    // Only use roots that are not the current root, from the source chain, and have associated transferIds
    const dbTransferRoots: TransferRoot[] = (await this.db.transferRoots.getTransferRootsFromWeek())
      .filter(dbTransferRoot => dbTransferRoot.transferRootId !== txParams.transferRootId)
      .filter(dbTransferRoot => dbTransferRoot.sourceChainId === this.bridge.chainId)
      .filter(dbTransferRoot => dbTransferRoot?.transferIds?.length)
    const dbTransferIds: string[] = dbTransferRoots.flatMap(dbTransferRoot => dbTransferRoot.transferIds!)
    if (dbTransferIds.length === 0) {
      this.logger.debug('The first root for a token route will have any any other transferIds in the db, so this check can be ignored')
      return
    }

    for (const transferId of transferIds) {
      const transferIdCount: string[] = dbTransferIds.filter((dbTransferId: string) => dbTransferId.toLowerCase() === transferId)
      if (transferIdCount.length > 0) {
        const duplicateRoot = dbTransferRoots.find(dbTransferRoot => dbTransferRoot.transferIds?.includes(transferId))
        throw new PossibleReorgDetected(`transferId (${transferId}) exists in multiple transferRoots in db with the duplicateRootId: ${duplicateRoot?.transferRootId}`)
      }
    }
  }

  async validateLogsWithRedundantRpcs (txParams: SendBondTransferRootTxParams, calculatedDbTransferRoot: TransferRoot): Promise<void> {
    const logger = this.logger.create({ root: txParams.transferRootId })
    logger.debug('validating logs with redundant rpcs')

    // Validate logs with redundant RPC endpoint, if it exists
    const blockNumber = calculatedDbTransferRoot?.commitTxBlockNumber
    if (!blockNumber) {
      // This might occur if an event is simply missed or not written to the DB. In this case, this is not necessarily a reorg, so throw a normal error
      throw new Error(`Calculated commitTxBlockNumber (${blockNumber}) is missing`)
    }

    const redundantRpcUrls = globalConfig.networks[this.chainSlug].redundantRpcUrls ?? []
    for (const redundantRpcUrl of redundantRpcUrls) {
      const l2Bridge = contracts.get(this.tokenSymbol, this.chainSlug)?.l2Bridge
      const filter = l2Bridge.filters.TransfersCommitted(
        txParams.destinationChainId,
        txParams.transferRootHash
      )
      const eventParams = await this.getRedundantRpcEventParams(
        logger,
        blockNumber,
        redundantRpcUrl,
        txParams.transferRootHash,
        l2Bridge,
        filter,
        calculatedDbTransferRoot?.rootBondBackoffIndex
      )
      if (!eventParams) {
        continue
      }
      if (
        (Number(eventParams.args.destinationChainId) !== txParams.destinationChainId) ||
        (eventParams.args.rootHash !== txParams.transferRootHash) ||
        (eventParams.args.totalAmount.toString() !== txParams.totalAmount.toString()) ||
        (eventParams.args.rootCommittedAt.toString() !== txParams.rootCommittedAt.toString())
      ) {
        throw new PossibleReorgDetected(`TransfersCommitted event does not match db. eventParams: ${JSON.stringify(eventParams)}, calculatedDbTransfer: ${JSON.stringify(calculatedDbTransferRoot)}, redundantRpcUrl: ${redundantRpcUrl}, query filter: ${JSON.stringify(filter)}, calculatedDbTransfer.rootBondBackoffIndex: ${calculatedDbTransferRoot?.rootBondBackoffIndex}`)
      }
    }
  }

  async getCalculatedDbTransferRoot (txParams: SendBondTransferRootTxParams): Promise<TransferRoot> {
    const { transferRootHash, totalAmount } = txParams
    const calculatedTransferRootId = getTransferRootId(transferRootHash, totalAmount)
    const dbTransferRoot = await this.db.transferRoots.getByTransferRootId(calculatedTransferRootId)
    if (!dbTransferRoot) {
      // This might occur if an event is simply missed or not written to the DB. In this case, this is not necessarily a reorg, so throw a normal error
      throw new Error(`Calculated dbTransferRoot (${calculatedTransferRootId}) not found in db`)
    }
    return dbTransferRoot
  }
}

export default BondTransferRootWatcher
