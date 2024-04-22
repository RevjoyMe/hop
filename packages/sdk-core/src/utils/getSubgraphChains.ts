import { sdkConfig } from '#config/index.js'

export function getSubgraphChains (network: string): string[] {
  const networks = sdkConfig[network]?.chains
  const chains = new Set<string>([])
  for (const chain in networks) {
    if (networks[chain]?.subgraphUrl) {
      chains.add(chain)
    }
  }

  return Array.from(chains)
}
