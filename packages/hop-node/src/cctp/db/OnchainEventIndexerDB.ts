import { BigNumber } from 'ethers'
import { type ChainedBatch, DB } from './DB.js'
import { MessageSDK } from '../cctp/MessageSDK.js'
import { getDefaultStartBlockNumber } from './utils.js'
import type { LogWithChainId } from '../types.js'

type DBValue = LogWithChainId | number

/**
 * This DB should only be used to get individual items. There should never be a
 * need to iterate over all items in the DB.
 */

/**
 * First index: topic[0]!chainId!blockNumber!logIndex
 * Second index: topic[0]!messageNonce!!chainId!chainId!blockNumber!logIndex
 * // TODO: Don't use !! in second index, rethink all
 */

// TODO: Second index has chainId twice. this is because a message nonce is not unique across chains.
// TODO: This should be hashed or handled differently so that there is not a redundant key

export class OnchainEventIndexerDB extends DB<string, DBValue> {

  constructor (dbName: string) {
    super(dbName + 'OnchainEventIndexerDB')
  }

  // TODO: Clean these up
  async *getLogsByTopic(topic: string): AsyncIterable<LogWithChainId> {
     // Tilde is intentional for lexicographical sorting
    const filter = {
      gte: `${topic}`,
      lt: `${topic}~`
    }
    yield* this.values(filter)
  }

  async *getLogsByTopicAndSecondaryIndex(topic: string, secondaryIndex: string): AsyncIterable<LogWithChainId> {
     // Tilde is intentional for lexicographical sorting
    const filter = {
      gte: `${topic}!${secondaryIndex}`,
      lt: `${topic}!${secondaryIndex}~`
    }

    yield* this.values(filter)
  }

  async getLastBlockSynced(chainId: string, syncDBKey: string): Promise<number> {
    // TODO: Use decorator for creation
    let dbValue = 0
    try {
      dbValue = await this.get(syncDBKey) as number
    } catch (e) {
      // TODO: Better handling
      // Noop
    }
    const defaultStartBlockNumber = getDefaultStartBlockNumber(chainId)
    // Intentional or instead of nullish coalescing since dbValue can be 0
    return (dbValue || defaultStartBlockNumber) as number
  }

  async updateSyncAndEvents(syncDBKey: string, syncedBlockNumber: number, logs: LogWithChainId[]): Promise<void> {
    const batch: ChainedBatch<this, string, DBValue> = this.batch()

    for (const log of logs) {
      const index = this.#getIndexKey(log)
      batch.put(index, log)
      console.log('putting log', syncDBKey, syncedBlockNumber, log)

      // TODO: Temp second index, pass this in thru constructor
      if (log.topics[0] === MessageSDK.MESSAGE_RECEIVED_EVENT_SIG) {
        const secondIndex = this.#getIndexKey(log, BigNumber.from(log.topics[2]).toString())
        batch.put(secondIndex, log)
        console.log('putting secondary log', syncDBKey, syncedBlockNumber, log)
      }
    }

    //  These must be performed atomically to keep state in sync
    batch.put(syncDBKey, syncedBlockNumber)
    console.log('putting sync log', syncDBKey, syncedBlockNumber)
    return batch.write()
  }

  // TODO: Use sublevels
  #getIndexKey (log: LogWithChainId, secondIndex?: string): string {
    // Use ! as separator since it is best choice for lexicographical ordering and follows best practices
    // https://github.com/Level/subleveldown
    let index = log.topics[0]
    if (secondIndex) {
      index += '!' + secondIndex
    }
    // TODO: Be careful with future indexes, there may be multiple nonces on the same chain and the sourceChain is used
    // as the index in the CCTP contracts but not indexed in events. Ensure that is handled.
    return index + '!' + log.chainId + '!' + log.blockNumber + '!' + log.logIndex
  }
}
