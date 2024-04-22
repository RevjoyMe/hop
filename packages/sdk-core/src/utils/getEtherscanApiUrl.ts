import { sdkConfig } from '#config/index.js'

export function getEtherscanApiUrl (network: string, chain: string): string {
  const url = sdkConfig[network]?.chains?.[chain]?.etherscanApiUrl
  if (!url) {
    throw new Error(`etherscan API url not found for chain ${chain}`)
  }

  return url
}
