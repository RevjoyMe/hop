import { sdkConfig } from '#config/index.js'

export function getSubgraphUrl (network: string, chain: string): string {
  if (!sdkConfig[network]) {
    throw new Error(`config for network ${network} not found`)
  }
  const url = sdkConfig[network]?.chains?.[chain]?.subgraphUrl
  if (!url) {
    throw new Error(`subgraph url not found for chain ${chain}`)
  }

  return url
}
