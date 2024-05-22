import { ChainSlug, TokenSymbol, getToken } from '@hop-protocol/sdk'
import { addresses } from '#config/index.js'
import { normalizeTokenSymbol } from '#utils/normalizeTokenSymbol.js'

export function getTokenImage(tokenSymbol: string = 'ETH') {
  if (!tokenSymbol) {
    console.error('expected tokenSymbol')
    return ''
  }
  tokenSymbol = normalizeTokenSymbol(tokenSymbol)
  const token = getToken(tokenSymbol as TokenSymbol)
  if (!token) {
    console.error(`could not find token: ${tokenSymbol}`)
    console.error(tokenSymbol)
    return ''
  }
  return token.image
}

export function getTokenDecimals(tokenSymbol: string) {
  tokenSymbol = normalizeTokenSymbol(tokenSymbol)
  const token = getToken(tokenSymbol as TokenSymbol)
  if (!token) {
    throw new Error(`could not find token: ${tokenSymbol}`)
  }
  return token.decimals
}

export function getTokenByAddress(network: string, address?: string): TokenSymbol | undefined {
  for (const token in addresses.tokens) {
    const networkContracts = addresses.tokens[token][network]

    if (network === ChainSlug.Ethereum && networkContracts.l1Bridge === address) {
      return token  as TokenSymbol
    }

    if (
      networkContracts &&
      [
        networkContracts.l2Bridge,
        networkContracts.l2AmmWrapper,
        networkContracts.l2CanonicalToken,
      ].includes(address)
    ) {
      return token as TokenSymbol
    }
  }
}
