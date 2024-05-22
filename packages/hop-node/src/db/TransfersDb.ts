import BaseDb, { type DateFilter, type DateFilterWithKeyPrefix } from './BaseDb.js'
import { BigNumber } from 'ethers'
import { TimeIntervals } from '#constants/index.js'
import { getExponentialBackoffDelayMs } from '#utils/getExponentialBackoffDelayMs.js'
import {
  RelayWaitTimeMs,
  RelayableChains,
  TxError
} from '#constants/index.js'
import { TxRetryDelayMs } from '#config/index.js'
import { ChainSlug, getChainSlug } from '@hop-protocol/sdk'
import { transfersMigrations } from './migrations.js'

interface BaseTransfer {
  amount?: BigNumber
  amountOutMin?: BigNumber
  bonderFee?: BigNumber
  bondWithdrawalAttemptedAt?: number
  committed?: boolean
  deadline?: BigNumber
  destinationChainId?: number
  destinationChainSlug?: string
  isBondable?: boolean
  isFinalized?: boolean
  isRelayable?: boolean
  isRelayed?: boolean
  isNotFound?: boolean
  isTransferSpent?: boolean
  recipient?: string
  relayAttemptedAt?: number
  relayBackoffIndex?: number
  relayTxError?: TxError
  relayer?: string
  relayerFee?: BigNumber
  sourceChainId?: number
  sourceChainSlug?: string
  transferFromL1Complete?: boolean
  transferFromL1CompleteTxHash?: string
  transferNonce?: string
  transferRelayed?: boolean
  transferSentBlockNumber?: number
  transferSentIndex?: number
  transferSentLogIndex?: number
  transferSentTimestamp?: number
  transferSentTxHash?: string
  transferSpentTxHash?: string
  withdrawalBondBackoffIndex?: number
  withdrawalBondTxError?: TxError
  withdrawalBonded?: boolean
  withdrawalBondedTxHash?: string
}

export interface Transfer extends BaseTransfer {
  transferId: string
}

interface UpdateTransfer extends BaseTransfer {
  transferId?: string
}

type GetItemsFilter = Partial<Transfer> & {
  destinationChainIds?: number[]
}

export type UnbondedSentTransfer = {
  transferId: string
  transferSentTimestamp: number
  withdrawalBonded: boolean
  transferSentTxHash: string
  isBondable: boolean
  isTransferSpent: boolean
  destinationChainId: number
  amount: BigNumber
  withdrawalBondTxError: TxError
  sourceChainId: number
  recipient: string
  amountOutMin: BigNumber
  bonderFee: BigNumber
  transferNonce: string
  deadline: BigNumber
  transferSentIndex: number
  transferSentBlockNumber: number
  isFinalized: boolean
}

export type UnrelayedSentTransfer = {
  transferId: string
  sourceChainId: number
  destinationChainId: number
  recipient: string
  amount: BigNumber
  relayer: string
  relayerFee: BigNumber
  transferSentTxHash: string
  transferSentTimestamp: number
  transferSentLogIndex: number
}

export type UncommittedTransfer = {
  transferId: string
  transferSentTxHash: string
  committed: boolean
  destinationChainId: number
}

export interface TransfersIdsWithTransferRootHashParams {
  sourceChainId: number
  destinationChainId: number
  commitTxBlockNumber: number
  commitTxLogIndex: number
}

// structure:
// key: `transfer:<transferSentTimestamp>:<transferId>`
// value: `{ transferId: <transferId> }`
// note: the "transfer" prefix is not required but requires a migration to remove
class SubDbTimestamps extends BaseDb<Transfer> {
  constructor (prefix: string, _namespace?: string) {
    super(`${prefix}:timestampedKeys`, _namespace)
  }

  async update (transferId: string, transfer: Transfer): Promise<void> {
    const key = this.getTimestampedKey(transfer)
    if (!key) {
      this.logger.debug(`key not found for transferId: ${transferId}. Can occur if an event has been missed or during initial sync.`)
      return
    }
    await this.insertIfNotExists(key, { transferId })
  }

  async getTransferIds (dateFilter?: DateFilter): Promise<string[]> {
    const keyPrefix = 'transfer'
    const dateFilterWithKeyPrefix: DateFilterWithKeyPrefix = {
      keyPrefix,
      ...dateFilter
    }
    const values = await this.getValues({ dateFilterWithKeyPrefix })
    return values.map(this.filterTransferId).filter(this.filterExisty)
  }

  protected getTimestampedKey (transfer: Transfer): string | undefined {
    if (transfer.transferSentTimestamp && transfer.transferId) {
      return `transfer:${transfer.transferSentTimestamp}:${transfer.transferId}`
    }
  }

  protected readonly filterTransferId = (x: Transfer): string => {
    return x?.transferId
  }
}

// structure:
// key: `<transferId>`
// value: `{ transferId: <transferId> }`
class SubDbIncompletes extends BaseDb<Transfer> {
  constructor (prefix: string, _namespace?: string) {
    super(`${prefix}:incompleteItems`, _namespace)
  }

  async update (transferId: string, transfer: Transfer): Promise<void> {
    const isIncomplete = this.isItemIncomplete(transfer)
    if (isIncomplete) {
      const value = { transferId }
      await this.insertIfNotExists(transferId, value)
    } else {
      await this.del(transferId)
    }
  }

  async getItems (): Promise<string[]> {
    // No filter needed, as incomplete items are deleted when they are complete. Each get should retrieve all.
    const incompleteItems = await this.getValues()
    return incompleteItems.map(this.filterTransferId).filter(this.filterExisty)
  }

  protected isItemIncomplete (item: Transfer): boolean {
    if (!item?.transferId) {
      return false
    }

    if (item.isNotFound) {
      return false
    }

    return (
      !item.sourceChainId ||
      !item.destinationChainId ||
      !item.transferSentBlockNumber ||
      !!(item.transferSentBlockNumber && !item.transferSentTimestamp)
    )
  }

  protected readonly filterTransferId = (x: Transfer): string => {
    return x?.transferId
  }
}

// structure:
// key: `<transferId>`
// value: `{ ...Transfer }`
class TransfersDb extends BaseDb<Transfer> {
  subDbTimestamps: SubDbTimestamps
  subDbIncompletes: SubDbIncompletes

  constructor (prefix: string, _namespace?: string) {
    super(prefix, _namespace, transfersMigrations)
    this.subDbTimestamps = new SubDbTimestamps(prefix, _namespace)
    this.subDbIncompletes = new SubDbIncompletes(prefix, _namespace)
  }

  private isRouteOk (filter: GetItemsFilter = {}, item: Transfer) {
    if (filter.sourceChainId) {
      if (!item.sourceChainId || filter.sourceChainId !== item.sourceChainId) {
        return false
      }
    }

    if (filter.destinationChainIds) {
      if (!item.destinationChainId || !filter.destinationChainIds.includes(item.destinationChainId)) {
        return false
      }
    }

    return true
  }

  async update (transferId: string, transfer: UpdateTransfer): Promise<void> {
    const item = await this.get(transferId) ?? {} as Transfer
    const updatedValue: Transfer = this.getUpdatedValue(item, transfer as Transfer)
    updatedValue.transferId = transferId

    this.logger.debug(`updating transfer. key: ${transferId}, value: ${JSON.stringify(updatedValue)}`)
    await Promise.all([
      this.subDbTimestamps.update(transferId, updatedValue),
      this.subDbIncompletes.update(transferId, updatedValue),
      this.put(transferId, updatedValue)
    ])
  }

  async getByTransferId (transferId: string): Promise<Transfer | null> {
    const item: Transfer | null = await this.get(transferId)
    if (!item) {
      return null
    }
    return this.#normalizeTransferValue(item)
  }

  async getTransfers (dateFilter?: DateFilter): Promise<Transfer[]> {
    return this.getItems(dateFilter)
  }

  async getTransfersFromDay (): Promise<Transfer[]> {
    const fromUnix = Math.floor((Date.now() - TimeIntervals.ONE_DAY_MS) / 1000)
    return this.getTransfers({
      fromUnix
    })
  }

  async getTransfersWithinHour (targetTimestampSec: number): Promise<Transfer[]> {
    const targetTimestampMs = targetTimestampSec * 1000
    const fromUnix = Math.floor((targetTimestampMs - TimeIntervals.ONE_HOUR_MS) / 1000)
    const toUnix = Math.floor((targetTimestampMs + TimeIntervals.ONE_HOUR_MS) / 1000)
    return this.getTransfers({
      fromUnix,
      toUnix
    })
  }

  protected async getItems (dateFilter?: DateFilter): Promise<Transfer[]> {
    const transferIds = await this.subDbTimestamps.getTransferIds(dateFilter)
    if (!transferIds.length) {
      return []
    }

    const batchedItems = await this.getMany(transferIds)
    if (!batchedItems.length) {
      return []
    }

    const items = batchedItems.map(this.#normalizeTransferValue).sort(this.sortItems)
    if (items == null || !items.length) {
      return []
    }

    return items
  }

  async getUncommittedTransfers (
    filter: GetItemsFilter = {}
  ): Promise<UncommittedTransfer[]> {
    const transfers: Transfer[] = await this.getTransfersFromDay()
    const filtered = transfers.filter(item => {
      if (!this.isRouteOk(filter, item)) {
        return false
      }

      return (
        item.transferId &&
        item.transferSentTxHash &&
        !item.committed &&
        item.isFinalized
      )
    })

    return filtered as UncommittedTransfer[]
  }

  async getUnbondedSentTransfers (
    filter: GetItemsFilter = {}
  ): Promise<UnbondedSentTransfer[]> {
    const transfers: Transfer[] = await this.getTransfersFromDay()
    const filtered = transfers.filter(item => {
      if (!item?.transferId) {
        return false
      }

      if (!this.isRouteOk(filter, item)) {
        return false
      }

      if (item.isNotFound) {
        return false
      }

      let timestampOk = true
      if (item.bondWithdrawalAttemptedAt) {
        if (
          item.withdrawalBondTxError === TxError.BonderFeeTooLow ||
          item.withdrawalBondTxError === TxError.RedundantRpcOutOfSync ||
          item.withdrawalBondTxError === TxError.RpcServerError
        ) {
          const delayMs = getExponentialBackoffDelayMs(item.withdrawalBondBackoffIndex!)
          if (delayMs > TimeIntervals.ONE_WEEK_MS) {
            return false
          }
          timestampOk = item.bondWithdrawalAttemptedAt + delayMs < Date.now()
        } else {
          timestampOk = item.bondWithdrawalAttemptedAt + TxRetryDelayMs < Date.now()
        }
      }

      return (
        item.transferId &&
        item.transferSentTimestamp &&
        !item.withdrawalBonded &&
        item.transferSentTxHash &&
        item.isBondable &&
        item.transferSentBlockNumber &&
        !item.isTransferSpent &&
        timestampOk
      )
    })

    return filtered as UnbondedSentTransfer[]
  }

  async getL1ToL2UnrelayedTransfers (
    filter: GetItemsFilter = {}
  ): Promise<UnrelayedSentTransfer[]> {
    const transfers: Transfer[] = await this.getTransfersFromDay()
    const filtered = transfers.filter(item => {
      if (!item?.transferId) {
        return false
      }

      if (!this.isRouteOk(filter, item)) {
        return false
      }

      if (item.isNotFound) {
        return false
      }

      if (!item?.sourceChainId) {
        return false
      }

      const sourceChainSlug = getChainSlug(item.sourceChainId.toString())
      if (sourceChainSlug !== ChainSlug.Ethereum) {
        return false
      }

      if (!item?.destinationChainId) {
        return false
      }

      if (!item.transferSentTimestamp) {
        return false
      }

      // Check DB relayability
      // It is fine if isRelayable is undefined. We just need to ensure it is not false.
      if (item?.isRelayable === false) {
        return false
      }

      const destinationChain = getChainSlug(item.destinationChainId.toString())
      const isRelayable = RelayableChains.L1_TO_L2.includes(destinationChain)
      if (!isRelayable) {
        return false
      }

      let relayTimestampOk = true
      if (isRelayable) {
        const l1TxTimestampMs = item.transferSentTimestamp * 1000
        const relayTimeMs = RelayWaitTimeMs.L1_TO_L2?.[destinationChain]
        if (!relayTimeMs) {
          return false
        }
        relayTimestampOk = l1TxTimestampMs + relayTimeMs < Date.now()
      }

      let timestampOk = true
      if (item.relayAttemptedAt) {
        if (
          item.relayTxError === TxError.RelayerFeeTooLow ||
          item.relayTxError === TxError.RpcServerError ||
          item.relayTxError === TxError.UnfinalizedTransferBondError ||
          item.relayTxError === TxError.MessageUnknownStatus ||
          item.relayTxError === TxError.MessageRelayTooEarly
        ) {
          const delayMs = getExponentialBackoffDelayMs(item.relayBackoffIndex!)
          if (delayMs > TimeIntervals.ONE_WEEK_MS) {
            return false
          }
          timestampOk = item.relayAttemptedAt + delayMs < Date.now()
        } else {
          timestampOk = item.relayAttemptedAt + TxRetryDelayMs < Date.now()
        }
      }

      return (
        item.transferId &&
        item.transferSentTimestamp &&
        !item.transferRelayed &&
        item.transferSentTxHash &&
        item.isRelayable &&
        !item.isRelayed &&
        !item.transferFromL1Complete &&
        item.transferSentLogIndex &&
        relayTimestampOk &&
        timestampOk
      )
    })

    return filtered as UnrelayedSentTransfer[]
  }

  async getIncompleteItems (filter: GetItemsFilter = {}): Promise<Transfer[]> {
    const incompleteTransferIds: string[] = await this.subDbIncompletes.getItems()
    if (!incompleteTransferIds.length) {
      return []
    }
    const incompleteTransferIdItems = await this.getMany(incompleteTransferIds)
    if (!incompleteTransferIdItems.length) {
      return []
    }

    return incompleteTransferIdItems.map(this.#normalizeTransferValue).filter((item: Transfer) => {
      if (!item) {
        return false
      }

      if (filter.sourceChainId && item.sourceChainId) {
        if (filter.sourceChainId !== item.sourceChainId) {
          return false
        }
      }

      if (item.isNotFound) {
        return false
      }

      return true
    })
  }

  /**
   * Utils
   */

  /**
   * @returns transferIds sorted in order of their index in the root
   */
  async getTransfersIdsWithTransferRootHash (input: TransfersIdsWithTransferRootHashParams): Promise<string[] | undefined> {
    const { sourceChainId, destinationChainId, commitTxBlockNumber, commitTxLogIndex } = input

    // Look back this many days/weeks to construct the root. If this is not enough, the consumer should look
    // up the root onchain.
    // As a rough reference, a third-party Optimism provider looks back appx 1 day per index.
    const maxLookbackIndex = 150
    const transferIds: string[] = []

    const now = Date.now()
    for (let i = 0; i <= maxLookbackIndex; i++) {
      const fromUnix = Math.floor((now - (TimeIntervals.ONE_DAY_MS * (i + 1))) / 1000)
      const toUnix = Math.floor((now - (TimeIntervals.ONE_DAY_MS * i)) / 1000)
      const transfers: Transfer[] = await this.getTransfers({
        fromUnix,
        toUnix
      })

      // Sorted newest to oldest
      const sortedTransfers = transfers.filter(Boolean).sort(this.sortItems).reverse()
      for (const transfer of sortedTransfers) {
        if (
          transfer.sourceChainId === sourceChainId &&
          transfer.destinationChainId === destinationChainId &&
          transfer.transferSentBlockNumber &&
          transfer.transferSentBlockNumber <= commitTxBlockNumber &&
          transfer.transferSentIndex !== undefined
        ) {
          if (transfer.transferSentBlockNumber === commitTxBlockNumber) {
            if (
              transfer.transferSentLogIndex === undefined ||
              transfer.transferSentLogIndex > commitTxLogIndex
            ) {
              continue
            }
          }

          transferIds.unshift(transfer.transferId)
          if (transfer.transferSentIndex === 0) {
            return transferIds
          }
        }
      }
    }
  }

  #normalizeTransferValue = (item: Transfer): Transfer => {
    if (item.destinationChainId) {
      item.destinationChainSlug = getChainSlug(item.destinationChainId.toString())
    }
    if (item.sourceChainId) {
      item.sourceChainSlug = getChainSlug(item.sourceChainId.toString())
    }
    if (item.deadline !== undefined) {
      // convert number to BigNumber for backward compatibility reasons
      if (typeof item.deadline === 'number') {
        item.deadline = BigNumber.from((item.deadline as number).toString())
      }
    }
    return item
  }

  protected readonly filterValueTransferId = (x: any) => {
    return x?.value?.transferId
  }

  // sort explainer: https://stackoverflow.com/a/9175783/1439168
  protected readonly sortItems = (a: any, b: any) => {
    if (a.transferSentBlockNumber! > b.transferSentBlockNumber!) return 1
    if (a.transferSentBlockNumber! < b.transferSentBlockNumber!) return -1
    if (a.transferSentIndex! > b.transferSentIndex!) return 1
    if (a.transferSentIndex! < b.transferSentIndex!) return -1
    return 0
  }
}

export default TransfersDb
