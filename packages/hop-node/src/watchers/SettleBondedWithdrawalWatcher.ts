import BaseWatcher from './classes/BaseWatcher.js'
import MerkleTree from '#utils/MerkleTree.js'
import { wallets } from '#wallets/index.js'
import { ChainSlug, TokenSymbol, getChainSlug } from '@hop-protocol/sdk'
import { Contract } from 'ethers'
import { type WithdrawalProofData, getWithdrawalProofData } from '#utils/getWithdrawalProofData.js'
import { config as globalConfig } from '#config/index.js'
import type { BigNumber, providers } from 'ethers'
import type { L1_Bridge as L1BridgeContract } from '@hop-protocol/sdk/contracts'
import type { L2_Bridge as L2BridgeContract } from '@hop-protocol/sdk/contracts'

export class BatchExecuteError extends Error {}

type Config = {
  chainSlug: string
  tokenSymbol: string
  bridgeContract: L1BridgeContract | L2BridgeContract
  dryMode?: boolean
  minThresholdPercent: number
}

class SettleBondedWithdrawalWatcher extends BaseWatcher {
  override siblingWatchers!: { [chainId: string]: SettleBondedWithdrawalWatcher }

  constructor (config: Config) {
    super({
      chainSlug: config.chainSlug,
      tokenSymbol: config.tokenSymbol,
      logColor: 'magenta',
      bridgeContract: config.bridgeContract,
      dryMode: config.dryMode
    })
  }

  override async pollHandler () {
    await this.checkUnsettledTransferRootsFromDb()
  }

  async checkUnsettledTransferRootsFromDb () {
    const dbTransferRoots = await this.db.transferRoots.getUnsettledTransferRoots(await this.getFilterRoute())
    if (!dbTransferRoots.length) {
      this.logger.debug('no unsettled db transfer roots to check')
    }
    this.logger.info(`total unsettled transfer roots db items: ${dbTransferRoots.length}`)
    const promises: Array<Promise<any>> = []
    for (const dbTransferRoot of dbTransferRoots) {
      promises.push(this.checkTransferRootId(dbTransferRoot.transferRootId))
    }
    await Promise.all(promises)
  }

  async checkTransferRootId (transferRootId: string, bonder?: string) {
    const logger = this.logger.create({ root: transferRootId })
    const dbTransferRoot = await this.db.transferRoots.getByTransferRootId(
      transferRootId
    )
    if (!dbTransferRoot) {
      this.logger.error('db transfer root not found')
      return
    }
    const {
      transferRootHash,
      sourceChainId,
      destinationChainId,
      totalAmount,
      transferIds
    } = dbTransferRoot
    if (!Array.isArray(transferIds)) {
      throw new Error('transferIds expected to be array')
    }

    if (!destinationChainId || !totalAmount) {
      logger.error('destinationChainId or totalAmount not found')
      return
    }

    const destBridge = this.getSiblingWatcherByChainId(destinationChainId)
      .bridge
    bonder = bonder ?? await destBridge.getBonderAddress()
    logger.debug(`transferRootId: ${transferRootId}`)

    const tree = new MerkleTree(transferIds)
    const calculatedTransferRootHash = tree.getHexRoot()
    if (calculatedTransferRootHash !== transferRootHash) {
      logger.debug('transferIds:', JSON.stringify(transferIds))
      logger.error(
        `transfers computed transfer root hash doesn't match. Expected ${transferRootHash}, got ${calculatedTransferRootHash}`
      )
      await this.db.transferRoots.update(transferRootId, {
        transferIds: []
      })
      return
    }

    logger.debug('sourceChainId:', sourceChainId)
    logger.debug('destinationChainId:', destinationChainId)
    logger.debug('computed transferRootHash:', transferRootHash)
    logger.debug('bonder:', bonder)
    logger.debug('totalAmount:', this.bridge.formatUnits(totalAmount))
    logger.debug('transferIds', JSON.stringify(transferIds))

    const {
      total: onChainTotalAmount,
      amountWithdrawn: onChainAmountWithdrawn
    } = await destBridge.getTransferRoot(transferRootHash, totalAmount)
    if (onChainTotalAmount.eq(0)) {
      logger.debug('onChainTotalAmount is 0. Skipping')
      return
    }
    if (onChainTotalAmount.eq(onChainAmountWithdrawn)) {
      logger.debug(`transfer root amountWithdrawn (${this.bridge.formatUnits(onChainAmountWithdrawn)}) matches total. Marking as not found`)
      await this.db.transferRoots.update(transferRootId, {
        isNotFound: true
      })
      return
    }

    if (this.dryMode || globalConfig.emergencyDryMode) {
      logger.warn(`dry: ${this.dryMode}, emergencyDryMode: ${globalConfig.emergencyDryMode}, skipping settleBondedWithdrawals`)
      return
    }

    await this.db.transferRoots.update(transferRootId, {
      withdrawalBondSettleTxSentAt: Date.now()
    })
    logger.debug('sending settle tx')
    try {
      const txs: providers.TransactionResponse[] = await this.#executeSettlement(
        destBridge,
        transferRootHash,
        bonder!,
        transferIds,
        totalAmount
      )

      const txHashes = txs.map(tx => tx.hash)
      const msg = `settleBondedWithdrawals on destinationChainId: txHashes: ${txHashes}, ${destinationChainId} (sourceChainId: ${sourceChainId}), transferRootId: ${transferRootId}, transferRootHash: ${transferRootHash}, totalAmount: ${this.bridge.formatUnits(totalAmount)}, transferIds: ${transferIds.length}`
      logger.info(msg)
    } catch (err) {
      logger.error('settleBondedWithdrawals error:', err.message)

      if (err instanceof BatchExecuteError) {
        await this.db.transferRoots.update(transferRootId, {
          isNotFound: true
        })
      }
      throw err
    }
  }

  async #executeSettlement (
    destBridge: L2BridgeContract,
    rootHash: string,
    bonder: string,
    transferIds: string[],
    totalAmount: BigNumber
  ): Promise<providers.TransactionResponse[]> {
    // Remove this once the Polygon zkSync bridge is updated to use the new settleBondedWithdrawals function

    // This is a temporary workaround for the Polygon zkSync bridge since the prover is limited by the
    // number of keccak operations allowed in a single transaction.
    const {
      maxNumTransferIds,
      settlementAggregatorAddress,
      settlementAggregatorAbi
    } = this.#getExecutionSettlementConfig()

    const destChainId: BigNumber = await destBridge.getChainId()
    if (!destChainId) {
      throw new Error('destChainId not found')
    }

    // If there is no resource constraint, settle all
    const destChainSlug = getChainSlug(destChainId.toString())
    if (
      destChainSlug !== ChainSlug.PolygonZk ||
      transferIds.length <= maxNumTransferIds
    ) {
      const tx: providers.TransactionResponse = await destBridge.settleBondedWithdrawals(
        bonder,
        transferIds,
        totalAmount
      )
      return [tx]
    }

    // Otherwise, split into chunks and settle each chunk
    const transferIdsChunks: string[][] = []
    for (let i = 0; i < transferIds.length; i += maxNumTransferIds) {
      transferIdsChunks.push(transferIds.slice(i, i + maxNumTransferIds))
    }

    const wallet = wallets.get(destChainSlug)
    const settlementAggregatorContract = new Contract(
      settlementAggregatorAddress,
      settlementAggregatorAbi,
      wallet
    )

    const txs: providers.TransactionResponse[] = []
    for (const transferIdsChunk of transferIdsChunks) {
      const dbTransferRoot = await this.db.transferRoots.getByTransferRootHash(rootHash)

      const transferIdTreeIndices: number[] = []
      const siblings: string[][] = []
      let numLeaves
      for (const transferId of transferIdsChunk) {
        let withdrawalData: WithdrawalProofData

        if (!dbTransferRoot?.totalAmount || !dbTransferRoot?.transferIds?.length) {
          throw new BatchExecuteError('db transfer root not found')
        }

        try {
          withdrawalData = getWithdrawalProofData(
            transferId,
            dbTransferRoot?.totalAmount,
            dbTransferRoot?.transferIds
          )
        } catch (err) {
          throw new BatchExecuteError(`getWithdrawalProofData error: ${err.message}`)
        }
        transferIdTreeIndices.push(withdrawalData.transferIndex)
        siblings.push(withdrawalData.proof)

        // This value is the same for all withdrawals in the chunk
        numLeaves = numLeaves ?? withdrawalData.numLeaves
      }

      const tx: providers.TransactionResponse = await settlementAggregatorContract.settleBondedWithdrawal(
        bonder,
        transferIdsChunk,
        rootHash,
        totalAmount,
        transferIdTreeIndices,
        siblings,
        numLeaves
      )
      txs.push(tx)
    }
    return txs
  }

  async checkTransferRootHash (transferRootHash: string, bonder: string) {
    const dbTransferRoot = await this.db.transferRoots.getByTransferRootHash(
      transferRootHash
    )
    if (!dbTransferRoot?.transferRootId) {
      throw new Error('db transfer root not found')
    }
    return this.checkTransferRootId(dbTransferRoot.transferRootId, bonder)
  }

  #getExecutionSettlementConfig (): {
    maxNumTransferIds: number
    settlementAggregatorAddress: string
    settlementAggregatorAbi: string[]
  } {
    // Remove this once the Polygon zkSync bridge is updated to use the new settleBondedWithdrawals function

    // This is a temporary workaround for the Polygon zkSync bridge since the prover is limited by the
    // number of keccak operations allowed in a single transaction.

    const settlementAggregatorAbi = [
      'function settleBondedWithdrawal(address bonder, bytes32[] calldata transferId, bytes32  rootHash, uint256 transferRootTotalAmount, uint256[] calldata transferIdTreeIndex, bytes32[][] calldata siblings, uint256 totalLeaves)'
    ]

    let settlementAggregatorAddresses: Record<string, string>
    if (globalConfig.isMainnet) {
      settlementAggregatorAddresses = {
        [TokenSymbol.ETH]: '0x2ad09850b0CA4c7c1B33f5AcD6cBAbCaB5d6e796',
        [TokenSymbol.HOP]: '0x74fa978EaFFa312bC92e76dF40FcC1bFE7637Aeb'
      }
    } else {
      settlementAggregatorAddresses = {
        [TokenSymbol.ETH]: '0xE670368c529C6B47662838bF039dd41945b57eF3'
      }
    }

    // This value is limited by prover constraints and RPC timeout constraints. Alchemy
    // endpoint has a 20s timeout. When processing more than 10 transferIds, the endpoint
    // may timeout. It can work up to 20 transferIds, but will retry somewhere between
    // 1 to 10 times before working, if at all.
    const maxNumTransferIds = 10

    return {
      maxNumTransferIds,
      settlementAggregatorAddress: settlementAggregatorAddresses[this.tokenSymbol],
      settlementAggregatorAbi
    }
  }
}

export default SettleBondedWithdrawalWatcher
