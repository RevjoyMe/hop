import { tokens } from '@hop-protocol/sdk/metadata'

export function getTokenDecimals (tokenSymbol: string) {
  const decimals = (tokens as any)[tokenSymbol]?.decimals
  if (!decimals) {
    throw new Error(`decimals not found for token "${tokenSymbol}"`)
  }

  return decimals
}
