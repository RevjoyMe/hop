import { DateTime } from 'luxon'
import { utils } from 'ethers'
import { getTokenDecimals } from '@hop-protocol/hop-node-core/utils'
import { networks } from '@hop-protocol/sdk/networks'
import type { ChainSlug } from '@hop-protocol/sdk/config'
import type { NetworkSlug} from '@hop-protocol/sdk/networks'

export type Filters = {
  startDate: string
  endDate: string
  orderDesc: boolean
  destinationChainId?: number
}

const chainIdToSlug: Record<string, string> = {}

for (const network in networks) {
  for (const chain in networks[network as NetworkSlug]) {
    const networkId = networks[network as NetworkSlug]?.[chain as ChainSlug]?.networkId
    if (!networkId) {
      continue
    }
    chainIdToSlug[networkId] = chain
  }
}

export { chainIdToSlug }

export function normalizeEntity (x: any) {
  if (!x) {
    return x
  }

  if (x.index !== undefined) {
    x.index = Number(x.index)
  }
  if (x.originChainId) {
    x.originChainId = Number(x.originChainId)
  }
  if (x.sourceChainId) {
    x.sourceChainId = Number(x.sourceChainId)
    x.sourceChain = chainIdToSlug[x.sourceChainId]
  }
  if (x.destinationChainId) {
    x.destinationChainId = Number(x.destinationChainId)
    x.destinationChain = chainIdToSlug[x.destinationChainId]
  }

  const decimals = getTokenDecimals(x.token)

  // TODO: use correct decimal places for future assets
  if (x.amount) {
    x.formattedAmount = utils.formatUnits(x.amount, decimals)
  }
  if (x.bonderFee) {
    x.formattedBonderFee = utils.formatUnits(x.bonderFee, decimals)
  }

  x.blockNumber = Number(x.blockNumber)
  x.timestamp = Number(x.timestamp)
  x.timestampRelative = DateTime.fromSeconds(x.timestamp).toRelative()

  return x
}
