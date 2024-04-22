import BaseWatcher from './classes/BaseWatcher.js'
import L1Bridge from './classes/L1Bridge.js'
import L1MessengerWrapper from './classes/L1MessengerWrapper.js'
import contracts from '#contracts/index.js'
import getTransferCommitted from '#theGraph/getTransferCommitted.js'
import getTransferRootId from '#utils/getTransferRootId.js'
import { ChallengePeriodMs } from '#constants/index.js'
import { getChainBridge } from '@hop-protocol/hop-node-core/chains'
import { getEnabledNetworks, config as globalConfig } from '#config/index.js'
import type { BigNumber } from 'ethers'
import type { Chain } from '@hop-protocol/hop-node-core/constants'
import type { ExitableTransferRoot } from '#db/TransferRootsDb.js'
import type { IChainBridge } from '@hop-protocol/hop-node-core/chains'
import type { L1_Bridge as L1BridgeContract } from '@hop-protocol/sdk/contracts'
import type { MessengerWrapper as L1MessengerWrapperContract } from '@hop-protocol/sdk/contracts'
import type { L2_Bridge as L2BridgeContract } from '@hop-protocol/sdk/contracts'

type Config = {
  chainSlug: string
  tokenSymbol: string
  bridgeContract: L1BridgeContract | L2BridgeContract
  l1BridgeContract: L1BridgeContract
  dryMode?: boolean
}

export type ConfirmRootsData = {
  rootHashes: string[]
  destinationChainIds: number[]
  totalAmounts: BigNumber[]
  rootCommittedAts: number[]
}

class ConfirmRootsWatcher extends BaseWatcher {
  l1Bridge: L1Bridge
  l1MessengerWrapper: L1MessengerWrapper

  constructor (config: Config) {
    super(config)
    this.logger.debug('starting watcher')

    const l1MessengerWrapperContract: L1MessengerWrapperContract = contracts.get(this.tokenSymbol, this.chainSlug)?.l1MessengerWrapper
    if (!l1MessengerWrapperContract) {
      throw new Error(`Messenger wrapper contract not found for ${this.chainSlug}.${this.tokenSymbol}`)
    }
    this.l1MessengerWrapper = new L1MessengerWrapper(l1MessengerWrapperContract)
    this.l1Bridge = new L1Bridge(config.l1BridgeContract)

    // confirmation watcher is less time sensitive than others
    this.pollIntervalMs = 10 * 60 * 1000
  }

  override async pollHandler () {
    try {
      await Promise.all([
        this.checkExitableTransferRootsFromDb(),
        this.checkConfirmableTransferRootsFromDb()
      ])
      this.logger.debug('confirmRootsWatcher pollHandler completed')
    } catch (err) {
      this.logger.debug(`confirmRootsWatcher pollHandler error ${err.message}`)
    }
  }

  async checkExitableTransferRootsFromDb () {
    const dbTransferRoots = await this.db.transferRoots.getL2ToL1RelayableTransferRoots(await this.getFilterRoute())
    if (!dbTransferRoots.length) {
      return
    }
    this.logger.debug(
      `checking ${dbTransferRoots.length} unexited transfer roots db items`
    )
    for (const { transferRootId } of dbTransferRoots) {
      await this.checkExitableTransferRoots(transferRootId)
    }
  }

  async checkConfirmableTransferRootsFromDb () {
    const dbTransferRoots = await this.db.transferRoots.getConfirmableTransferRoots(await this.getFilterRoute())
    if (!dbTransferRoots.length) {
      return
    }

    this.logger.debug(
      `checking ${dbTransferRoots.length} unconfirmed transfer roots db items`
    )
    for (const { transferRootId } of dbTransferRoots) {
      await this.checkConfirmableTransferRoots(transferRootId)
    }
  }

  async checkExitableTransferRoots (transferRootId: string) {
    const dbTransferRoot = await this.db.transferRoots.getByTransferRootId(transferRootId) as ExitableTransferRoot
    if (!dbTransferRoot) {
      throw new Error(`transfer root db item not found, root id "${transferRootId}"`)
    }

    const { destinationChainId, commitTxHash } = dbTransferRoot

    const logger = this.logger.create({ root: transferRootId })
    const isTransferRootIdConfirmed = await this.l1Bridge.isTransferRootIdConfirmed(
      destinationChainId,
      transferRootId
    )
    if (isTransferRootIdConfirmed) {
      logger.warn('Transfer root already confirmed')
      await this.db.transferRoots.update(transferRootId, {
        confirmed: true
      })
      return
    }

    const enabledNetworks = getEnabledNetworks()
    if (!enabledNetworks.includes(this.chainSlug)) {
      logger.warn(`chain ${this.chainSlug} is not enabled`)
      return
    }
    const chainBridge: IChainBridge = getChainBridge(this.chainSlug as Chain)
    if (!chainBridge) {
      logger.warn(`chainBridge for ${this.chainSlug} is not implemented yet`)
      return
    }

    logger.debug(`handling commit tx hash ${commitTxHash} to ${destinationChainId}`)
    if (this.dryMode || globalConfig.emergencyDryMode) {
      logger.warn(`dry: ${this.dryMode}, emergencyDryMode: ${globalConfig.emergencyDryMode} skipping relayL2ToL1Message`)
      return
    }

    await this.db.transferRoots.update(transferRootId, {
      sentConfirmTxAt: Date.now()
    })

    let tx
    try {
      tx = await chainBridge.relayL2ToL1Message(commitTxHash)
    } catch (err) {
      logger.error('checkExitableTransferRoots error:', err.message)
      throw err
    }

    if (!tx) {
      logger.error('tx relayL2ToL2Message not found')
      throw new Error('tx relayL2ToL2Message tx found')
    }

    const msg = `sent chain ${this.chainSlug} confirmTransferRoot exit tx ${tx.hash}`
    logger.info(msg)
    this.notifier.info(msg)
  }

  async checkConfirmableTransferRoots (transferRootId: string) {
    const dbTransferRoot = await this.db.transferRoots.getByTransferRootId(transferRootId) as ExitableTransferRoot
    if (!dbTransferRoot) {
      throw new Error(`transfer root db item not found, root id "${transferRootId}"`)
    }

    const { transferRootHash, destinationChainId, totalAmount, committedAt } = dbTransferRoot

    const logger = this.logger.create({ root: transferRootId })
    const isTransferRootIdConfirmed = await this.l1Bridge.isTransferRootIdConfirmed(
      destinationChainId,
      transferRootId
    )
    if (isTransferRootIdConfirmed) {
      logger.warn('Transfer root already confirmed')
      await this.db.transferRoots.update(transferRootId, {
        confirmed: true
      })
      return
    }

    if (this.dryMode || globalConfig.emergencyDryMode) {
      logger.warn(`dry: ${this.dryMode}, emergencyDryMode: ${globalConfig.emergencyDryMode}, skipping confirmRootsViaWrapper`)
      return
    }

    await this.db.transferRoots.update(transferRootId, {
      sentConfirmTxAt: Date.now()
    })

    logger.debug(`handling confirmable transfer root ${transferRootHash}, destination ${destinationChainId}, amount ${totalAmount.toString()}, committedAt ${committedAt}`)
    try {
      await this.confirmRootsViaWrapper({
        rootHashes: [transferRootHash],
        destinationChainIds: [destinationChainId],
        totalAmounts: [totalAmount],
        rootCommittedAts: [committedAt]
      })
    } catch (err) {
      logger.error('confirmRootsViaWrapper error:', err.message)
      throw err
    }
  }

  async confirmRootsViaWrapper (rootData: ConfirmRootsData): Promise<void> {
    // NOTE: Since root confirmations via a wrapper can only happen after the challenge period expires, it is not
    // possible for a reorg to occur. Therefore, we do not need to check for a reorg here.
    // Additionally, the validation relies on TheGraph, which is not guaranteed to be available during an emergency.
    // Because of this, we do not enable global emergencyDryMode for this watcher.
    await this.preTransactionValidation(rootData)
    const { rootHashes, destinationChainIds, totalAmounts, rootCommittedAts } = rootData
    await this.l1MessengerWrapper.confirmRoots(
      rootHashes,
      destinationChainIds,
      totalAmounts,
      rootCommittedAts
    )
  }

  async preTransactionValidation (rootData: ConfirmRootsData): Promise<void> {
    const { rootHashes, destinationChainIds, totalAmounts, rootCommittedAts } = rootData

    // Data validation
    if (
      rootHashes.length !== destinationChainIds.length ||
      rootHashes.length !== totalAmounts.length ||
      rootHashes.length !== rootCommittedAts.length
    ) {
      throw new Error('Root data arrays must be the same length')
    }

    for (const [index, value] of rootHashes.entries()) {
      const rootHash = value
      const destinationChainId = destinationChainIds[index]
      const totalAmount = totalAmounts[index]
      const rootCommittedAt = rootCommittedAts[index]

      // Verify that the DB has the root and associated data
      const calculatedTransferRootId = getTransferRootId(rootHash, totalAmount)
      const logger = this.logger.create({ root: calculatedTransferRootId })

      const dbTransferRoot = await this.db.transferRoots.getByTransferRootId(calculatedTransferRootId)
      if (!dbTransferRoot) {
        throw new Error(`Calculated calculatedTransferRootId (${calculatedTransferRootId}) does not match transferRootId in db`)
      }

      logger.debug(`confirming rootHash ${rootHash} on destinationChainId ${destinationChainId} with totalAmount ${totalAmount.toString()} and committedAt ${rootCommittedAt}`)

      // Verify that the data in the DB matches the data passed in
      if (
        rootHash !== dbTransferRoot?.transferRootHash ||
        destinationChainId !== dbTransferRoot?.destinationChainId ||
        totalAmount.toString() !== dbTransferRoot?.totalAmount?.toString() ||
        rootCommittedAt !== dbTransferRoot?.committedAt
      ) {
        throw new Error(`DB data does not match passed in data for rootHash ${rootHash}`)
      }

      // Verify that the watcher is on the correct chain
      if (this.bridge.chainId !== dbTransferRoot.sourceChainId) {
        throw new Error(`Watcher is on chain ${this.bridge.chainId} but transfer root ${calculatedTransferRootId} source is on chain ${dbTransferRoot.sourceChainId}`)
      }

      if (this.bridge.chainId === destinationChainId) {
        throw new Error(`Cannot confirm roots with a destination chain ${destinationChainId} from chain the same chain`)
      }

      // Verify that the transfer root ID is not confirmed for any chain
      // Note: Manually get all chains from config here to check all possible destinations, not
      // just the chains scoped to this watcher
      const allChainIds: number[] = []
      for (const key in globalConfig.networks) {
        const { chainId } = globalConfig.networks[key]
        allChainIds.push(chainId)
      }

      for (const chainId of allChainIds) {
        const isTransferRootIdConfirmed = await this.l1Bridge.isTransferRootIdConfirmed(
          chainId,
          calculatedTransferRootId
        )
        if (isTransferRootIdConfirmed) {
          throw new Error(`Transfer root ${calculatedTransferRootId} already confirmed on chain ${destinationChainId} (confirmRootsViaWrapper)`)
        }
      }

      // Verify that the wrapper being used is correct
      const wrapperL2ChainId = await this.l1MessengerWrapper.l2ChainId()
      if (
        Number(wrapperL2ChainId) !== dbTransferRoot?.sourceChainId ||
        Number(wrapperL2ChainId) !== this.bridge.chainId
      ) {
        throw new Error(`Wrapper l2ChainId is unexpected: ${wrapperL2ChainId} (expected ${dbTransferRoot?.sourceChainId})`)
      }

      // Verify that the root can be confirmed
      const { createdAt, challengeStartTime } = await this.l1Bridge.getTransferBond(calculatedTransferRootId)
      if (!createdAt || !challengeStartTime) {
        throw new Error('Transfer bond not found')
      }
      const createdAtMs = Number(createdAt) * 1000
      const timeSinceBondCreation = Date.now() - createdAtMs
      if (
        createdAt.toString() === '0' ||
          challengeStartTime.toString() !== '0' ||
          timeSinceBondCreation <= ChallengePeriodMs
      ) {
        throw new Error('Transfer root is not confirmable')
      }

      // Verify that the data in the TheGraph matches the data passed in
      // TheGraph support is not consistent on testnet, so skip this check on testnet
      if (globalConfig.isMainnet) {
        const transferCommitted = await getTransferCommitted(this.bridge.chainSlug, this.tokenSymbol, rootHash)
        if (
          rootHash !== transferCommitted?.rootHash ||
          destinationChainId !== transferCommitted?.destinationChainId ||
          totalAmount.toString() !== transferCommitted?.totalAmount?.toString() ||
          rootCommittedAt.toString() !== transferCommitted?.rootCommittedAt
        ) {
          throw new Error(`TheGraph data does not match passed in data for rootHash ${rootHash}`)
        }
      }
    }
  }
}

export default ConfirmRootsWatcher
