import { getRpcProviderFromUrl } from './getRpcProviderFromUrl.js'
import { getRpcUrl } from './getRpcUrl.js'
import type { providers } from 'ethers'

export const getRpcProvider = (network: string): providers.Provider => {
  const rpcUrl = getRpcUrl(network)
  return getRpcProviderFromUrl(rpcUrl)
}
