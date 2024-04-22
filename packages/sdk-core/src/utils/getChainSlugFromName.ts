import { ChainSlug, NetworkSlug } from '#constants/index.js'

export function getChainSlugFromName (name: string) {
  let slug = (name || '').trim().toLowerCase().split(' ')[0]

  if ((name || '').trim().toLowerCase().startsWith('arbitrum one')) {
    slug = ChainSlug.Arbitrum
  }
  if ((name || '').trim().toLowerCase().startsWith('arbitrum nova')) {
    slug = ChainSlug.Nova
  }
  if ((name || '').trim().toLowerCase().startsWith('polygon zk')) {
    slug = ChainSlug.PolygonZk
  }
  if (slug.startsWith('consensys') || slug.startsWith('linea')) {
    slug = ChainSlug.Linea
  }
  if (slug.startsWith('xdai')) {
    slug = ChainSlug.Gnosis
  }
  if (slug.startsWith('scroll')) {
    slug = ChainSlug.ScrollZk
  }
  if (slug.startsWith('base')) {
    slug = ChainSlug.Base
  }
  if (
    slug === NetworkSlug.Goerli ||
    slug === NetworkSlug.Sepolia ||
    slug === NetworkSlug.Mainnet ||
    slug === ChainSlug.Ethereum
  ) {
    slug = ChainSlug.Ethereum
  }

  return slug
}
