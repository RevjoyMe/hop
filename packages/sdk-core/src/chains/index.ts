import { networks } from './networks/index.js'
import type { Chain, ChainSlugish, Network, NetworkSlugish } from './types.js'
import { ChainSlug, NetworkSlug } from './types.js'
import {
  getChainByChainId,
  getChainByNetworkSlugAndChainSlug,
  isValidChainSlug,
  isValidNetworkSlug
} from './utils/internal.js'

/**
 * Types and utils
 */

export type { Chain, ChainSlugish, Network, NetworkSlugish }
export { ChainSlug, NetworkSlug }
export * from './utils/index.js'

/**
 * Main methods to be consumed
 */

export function getNetwork (networkSlug: NetworkSlugish): Network {
  if (!isValidNetworkSlug(networkSlug)) {
    throw new Error(`Invalid networkSlug: ${networkSlug}`)
  }
  return networks[networkSlug]
}

export function getChain(chainId: number): Chain;
export function getChain(networkSlug: NetworkSlugish, chainSlug: ChainSlugish): Chain;
export function getChain(chainIdOrNetworkSlug: number | NetworkSlugish, chainSlug?: ChainSlugish): Chain {
  if (typeof chainIdOrNetworkSlug === 'number') {
    return getChainByChainId(chainIdOrNetworkSlug)
  } else {
    if (!isValidNetworkSlug(chainIdOrNetworkSlug)) {
      throw new Error(`Invalid networkSlug: ${chainIdOrNetworkSlug}`)
    }
    if (!isValidChainSlug(chainSlug)) {
      throw new Error(`Invalid chainSlug: ${chainSlug}`)
    }
    return getChainByNetworkSlugAndChainSlug(chainIdOrNetworkSlug, chainSlug)
  }
}
