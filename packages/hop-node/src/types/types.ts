import { Event as EthersEvent } from 'ethers'

export type Event = EthersEvent & {
  blockNumber?: number
}
