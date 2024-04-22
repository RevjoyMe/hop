import { providers } from 'ethers'
import { rateLimitRetry } from '#utils/rateLimitRetry.js'
import type { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import type {
  Block,
  BlockTag,
  BlockWithTransactions,
  Provider as EthersProvider,
  Filter,
  FilterByBlockHash,
  Log,
  TransactionReceipt,
  TransactionRequest,
  TransactionResponse
} from '@ethersproject/abstract-provider'
import type { ConnectionInfo } from '@ethersproject/web'
import type { Deferrable } from '@ethersproject/properties'
import type { Network } from '@ethersproject/networks'

const inMemoryMonitor = false
const calls: Record<string, any> = {}

// reference: https://github.com/ethers-io/ethers.js/blob/b1458989761c11bf626591706aa4ce98dae2d6a9/packages/abstract-provider/src.ts/index.ts#L225
export class Provider extends providers.StaticJsonRpcProvider implements EthersProvider {

  constructor (rpcUrlOrOptions: string | ConnectionInfo) {
    super(rpcUrlOrOptions)
    // TODO: Reintroduce metrics
  }

  override async perform (method: string, params: any): Promise<any> {
    return super.perform(method, params)
  }

  // Network
  override getNetwork = rateLimitRetry(async (): Promise<Network> => {
    return super.getNetwork()
  })

  // Latest State
  override getBlockNumber = rateLimitRetry(async (): Promise<number> => {
    return super.getBlockNumber()
  })

  override getGasPrice = rateLimitRetry(async (): Promise<BigNumber> => {
    return super.getGasPrice()
  })

  // Account
  override getBalance = rateLimitRetry(async (addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber> => {
    return super.getBalance(addressOrName, blockTag)
  })

  override getTransactionCount = rateLimitRetry(async (addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number> => {
    return super.getTransactionCount(addressOrName, blockTag)
  })

  override getCode = rateLimitRetry(async (addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> => {
    return super.getCode(addressOrName, blockTag)
  })

  override getStorageAt = rateLimitRetry(async (addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> => {
    return super.getStorageAt(addressOrName, position, blockTag)
  })

  // Execution
  override sendTransaction = rateLimitRetry(async (signedTransaction: string | Promise<string>): Promise<TransactionResponse> => {
    return super.sendTransaction(signedTransaction)
  })

  override call = rateLimitRetry(async (transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> => {
    return super.call(transaction, blockTag)
  })

  override estimateGas = rateLimitRetry(async (transaction: Deferrable<TransactionRequest>): Promise<BigNumber> => {
    return super.estimateGas(transaction)
  })

  // Queries
  override getBlock = rateLimitRetry(async (blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block> => {
    return super.getBlock(blockHashOrBlockTag)
  })

  override getBlockWithTransactions = rateLimitRetry(async (blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<BlockWithTransactions> => {
    return super.getBlockWithTransactions(blockHashOrBlockTag)
  })

  override getTransaction = rateLimitRetry(async (transactionHash: string | Promise<string>): Promise<TransactionResponse> => {
    return super.getTransaction(transactionHash)
  })

  override getTransactionReceipt = rateLimitRetry(async (transactionHash: string | Promise<string>): Promise<TransactionReceipt> => {
    if (process.env.TX_RECEIPT_TRACE) {
      console.trace(`getTransactionReceipt ${transactionHash as string}`)
    }
    return super.getTransactionReceipt(transactionHash)
  })

  // Bloom-filter Queries
  override getLogs = rateLimitRetry(async (filter: Filter | FilterByBlockHash | Promise<Filter | FilterByBlockHash>): Promise<Log[]> => {
    // this.#trackStackTrace('getLogs', new Error().stack)
    return super.getLogs(filter)
  })

  // ENS
  override resolveName = rateLimitRetry(async (name: string | Promise<string>): Promise<null | string> => {
    return super.resolveName(name)
  })

  override lookupAddress = rateLimitRetry(async (address: string | Promise<string>): Promise<null | string> => {
    return super.lookupAddress(address)
  })
}
