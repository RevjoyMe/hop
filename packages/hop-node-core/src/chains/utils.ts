import { chainSlugToId } from '#utils/chainSlugToId.js'
import { networks } from '@hop-protocol/sdk/networks'
import type { ChainSlug, NetworkSlug} from '@hop-protocol/sdk/networks'

export function getNetworkSlugByChainId (chainId: number): string | undefined {
  for (const network in networks) {
    const chains = networks[network as NetworkSlug]
    for (const chain in chains) {
      const possibleChainId = chains?.[chain as ChainSlug]?.networkId
      if (chainId === possibleChainId) {
        return network
      }
    }
  }
}

export function getNetworkSlugByChainSlug (chainSlug: string): string | undefined {
  const chainId = chainSlugToId(chainSlug)
  return getNetworkSlugByChainId(chainId)
}
