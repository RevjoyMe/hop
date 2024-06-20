import { networks, regenesisEnabled, customSubgraphUrls } from '../config'

export function getSubgraphUrl (chain: string) {
  if (regenesisEnabled) {
    return `http://localhost:8000/subgraphs/name/hop-protocol/hop-${chain}`
  }

  const url = customSubgraphUrls[chain] ?? (networks as any)[chain].subgraphUrl
  if (!url) {
    throw new Error(`subgraph url not found for chain ${chain}`)
  }

  return url
}
