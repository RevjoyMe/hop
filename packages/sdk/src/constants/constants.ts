import {
  ChainSlug,
  NetworkSlug,
} from '#chains/index.js'
import { HToken } from '#networks/index.js'

export { NetworkSlug, ChainSlug, HToken }

export enum Slug {
  ethereum = 'ethereum',
  goerli = 'goerli',
  sepolia = 'sepolia',
  mainnet = 'mainnet',
  arbitrum = 'arbitrum',
  optimism = 'optimism',
  gnosis = 'gnosis',
  polygon = 'polygon',
  nova = 'nova',
  zksync = 'zksync',
  linea = 'linea',
  scrollzk = 'scrollzk',
  base = 'base',
  polygonzk = 'polygonzk'
}

// mainnet chain ids
export enum ChainId {
  Ethereum = 1,
  Optimism = 10,
  Arbitrum = 42161,
  Polygon = 137,
  Gnosis = 100,
  Nova = 42170,
  ZkSync = 324,
  Base = 8453,
  Linea = 59144
}

export enum CanonicalToken {
  ETH = 'ETH',
  MATIC = 'MATIC',
  XDAI = 'XDAI',
  USDC = 'USDC',
  USDT = 'USDT',
  DAI = 'DAI',
  WBTC = 'WBTC',
  sBTC = 'sBTC',
  sETH = 'sETH',
  HOP = 'HOP',
  SNX = 'SNX',
  sUSD = 'sUSD',
  rETH = 'rETH',
  UNI = 'UNI',
  MAGIC = 'MAGIC'
}

export enum ChainName {
  Ethereum = 'Ethereum',
  Optimism = 'Optimism',
  Arbitrum = 'Arbitrum',
  Polygon = 'Polygon',
  Gnosis = 'Gnosis',
  Nova = 'Nova',
  ZkSync = 'zkSync',
  Linea = 'Linea',
  ScrollZk = 'Scroll zkEVM',
  Base = 'Base',
  PolygonZk = 'Polygon zkEVM',
}

export enum WrappedToken {
  WETH = 'WETH',
  WMATIC = 'WMATIC',
  WXDAI = 'WXDAI',
}

export enum TokenIndex {
  CanonicalToken = 0,
  HopBridgeToken = 1
}

export enum BondTransferGasLimit {
  Ethereum = '165000',
   
  Optimism = '350000',
   
  Arbitrum = '2500000',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  Nova = '2500000',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  Base = '350000',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  Linea = '350000'
}

export const SettlementGasLimitPerTx: Record<string, number> = {
  ethereum: 5141,
  polygon: 5933,
  gnosis: 3218,
  optimism: 8545,
  arbitrum: 19843,
  nova: 19843,
  base: 8545,
  zksync: 10000, // TODO
  linea: 10416,
  scrollzk: 10000, // TODO
  polygonzk: 6270
}

export const PendingAmountBufferUsd = 50000

export enum EventNames {
  TransferSent = 'TransferSent',
  TransferSentToL2 = 'TransferSentToL2',
}

export const MaxDeadline: number = 9999999999
// Low liquidity or single-chain tokens should have a buffer of appx 10% of their L1 stake
export const LowLiquidityTokens: string[] = ['USDT', 'HOP', 'SNX', 'sUSD', 'rETH']
export const LowLiquidityTokenBufferAmountsUsd: Record<string, string> = {
  USDT: '10000',
  HOP: '8000',
  SNX: '40000',
  sUSD: '40000',
  rETH: '50000'
}
export const SecondsInDay = 86400

export enum Errors {
  NotEnoughAllowance = 'Not enough allowance. Please call `approve` on the token contract to allow contract to move tokens and make sure you are connected to the correct network.'
}
