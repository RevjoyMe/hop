import os from 'node:os'
import path from 'node:path'
import url from 'node:url'
import { type Addresses, type Bonders, type Bridges, addresses as coreAddresses } from '@hop-protocol/sdk/addresses'
import {
  Chain,
  DefaultBatchBlocks,
  Network,
  OneHourMs,
  TotalBlocks
} from '@hop-protocol/hop-node-core/constants'
import {
  type CoreConfig,
  envNetwork,
  getCoreConfig,
  getCoreNetworkConfig,
  isTestMode,
  setCoreBonderPrivateKey,
  setCoreNetworkMaxGasPrice,
  setCoreNetworkRedundantRpcUrls,
  setCoreNetworkRpcUrl,
} from '@hop-protocol/hop-node-core/config'
import { DefaultBondThreshold } from '#constants/index.js'
import { type Networks, networks as coreNetworks } from '@hop-protocol/sdk/networks'
import { config as coreConfig } from '@hop-protocol/sdk/config'
import { normalizeEnvVarArray } from '@hop-protocol/hop-node-core/config'
import { normalizeEnvVarNumber } from '@hop-protocol/hop-node-core/config'
import { utils } from 'ethers'
import type { AssetSymbol, Bps } from '@hop-protocol/sdk/config'
import type {
  BlocklistConfig,
  MetricsConfig,
  SignerConfig,
  Tokens
} from '@hop-protocol/hop-node-core/config'
import type { BonderConfig } from './types.js'
import type { Tokens as Metadata } from '@hop-protocol/sdk/metadata'
import type { SyncType } from '#constants/index.js'
import { loadEnvFile } from 'node:process'
import { getEnvFilePath } from '#utils/getEnvFilePath.js'

const envFilePath = getEnvFilePath()
if (envFilePath) {
  loadEnvFile(envFilePath)
}

const bonderPrivateKey = process.env.BONDER_PRIVATE_KEY
if (bonderPrivateKey) {
  setCoreBonderPrivateKey(bonderPrivateKey)
}

// TODO: Normalize bool. This will be true if CCTP_ENABLED is set to anything
export const CCTPEnabled = !!process.env.CCTP_ENABLED ?? false
const dirname = url.fileURLToPath(new URL('.', import.meta.url))
const defaultDbPath = path.resolve(dirname, '../../db_data')
// const defaultDbPath = path.resolve(__dirname, '../../db_data')
export const ipfsHost = process.env.IPFS_HOST ?? 'http://127.0.0.1:5001'
export const healthCheckerWarnSlackChannel = process.env.HEALTH_CHECKER_WARN_SLACK_CHANNEL // optional

// This value must be longer than the longest chain's finality
export const TxRetryDelayMs = process.env.TX_RETRY_DELAY_MS ? Number(process.env.TX_RETRY_DELAY_MS) : OneHourMs
export const BondWithdrawalBatchSize = normalizeEnvVarNumber(process.env.BOND_WITHDRAWAL_BATCH_SIZE) ?? 25
export const RelayTransactionBatchSize = BondWithdrawalBatchSize

export const defaultConfigDir = `${os.homedir()}/.hop`
export const defaultConfigFilePath = `${defaultConfigDir}/config.json`
export const defaultKeystoreFilePath = `${defaultConfigDir}/keystore.json`
export const minEthBonderFeeBn = utils.parseEther('0.00001')
export const pendingCountCommitThreshold = normalizeEnvVarNumber(process.env.PENDING_COUNT_COMMIT_THRESHOLD) ?? 921 // 90% of 1024
export const expectedNameservers = normalizeEnvVarArray(process.env.EXPECTED_APP_NAMESERVERS)
export const modifiedLiquidityRoutes = process.env.MODIFIED_LIQUIDITY_ROUTES?.split(',') ?? []
export const wsEnabledChains = process.env.WS_ENABLED_CHAINS?.split(',') ?? []
export const BondThreshold = normalizeEnvVarNumber(process.env.BOND_THRESHOLD) ?? DefaultBondThreshold
// TODO: Normalize bool. This will be true if ENFORCE_RELAYER_FEE is set to anything
export const EnforceRelayerFee = !!process.env.ENFORCE_RELAYER_FEE ?? false

// Decreasing SyncCyclesPerFullSync will result in more full syncs (root data) more often. This is useful for the
// available liquidity watcher to have up-to-date info
export const SyncIntervalSec = process.env.SYNC_INTERVAL_SEC ? Number(process.env.SYNC_INTERVAL_SEC) : 30
export const SyncIntervalMultiplier = process.env.SYNC_INTERVAL_MULTIPLIER ? Number(process.env.SYNC_INTERVAL_MULTIPLIER) : 1
export const SyncCyclesPerFullSync = process.env.SYNC_CYCLES_PER_FULL_SYNC ? Number(process.env.SYNC_CYCLES_PER_FULL_SYNC) : 60

type SyncConfig = {
  totalBlocks?: number
  batchBlocks?: number
}
type SyncConfigs = { [key: string]: SyncConfig }
type DbConfig = {
  path: string
}

export type Fees = Record<string, Bps>
export type Routes = Record<string, Record<string, boolean>>
export type CommitTransfersConfig = {
  minThresholdAmount: Record<string, Record<string, Record<string, any>>>
}

export type Config = CoreConfig & {
  isMainnet: boolean
  network: string
  networks: Networks & {[network: string]: any}
  metadata: Metadata & {[network: string]: any}
  addresses: Partial<Bridges> & {[network: string]: any}
  bonders: Bonders
  bonderConfig: BonderConfig
  db: DbConfig
  sync: SyncConfigs
  commitTransfers: CommitTransfersConfig
  fees: Fees
  routes: Routes
}

const networkConfigs: {[key: string]: any} = {}

for (const network in coreNetworks) {
  const { networks, metadata } = getCoreNetworkConfig(network as Network)

  const { bridges: addresses, bonders } = coreAddresses[network as Network]
  const coreNetwork = coreNetworks[network as Network]
  const bonderConfig: BonderConfig = {}

  for (const chain in coreNetwork) {
    const chainObj = coreNetwork[chain as Chain]
    if (!networks[chain]) {
      networks[chain] = {}
    }
    networks[chain].subgraphUrl = chainObj?.subgraphUrl
  }
  bonderConfig.totalStake = coreConfig[network as Network].bonderTotalStake

  // Convert USDC to USDC.e
  if (addresses.USDC && addresses['USDC.e']) {
    addresses.USDC = addresses['USDC.e']
    delete addresses['USDC.e']
  }

  // Convert USDC to USDC.e
  if (bonders.USDC && bonders['USDC.e']) {
    bonders.USDC = bonders['USDC.e']
    delete bonders['USDC.e']
  }

  const networkInfo = { addresses, bonders, bonderConfig, networks, metadata }
  networkConfigs[network] = networkInfo
}

const getConfigByNetwork = (network: string): Pick<Config, 'network' | 'addresses' | 'bonders' | 'bonderConfig' | 'networks' | 'metadata' | 'isMainnet'> => {
  const networkConfig = isTestMode ? networkConfigs.test : networkConfigs?.[network]
  if (!networkConfig) {
    throw new Error(`Network config not found for network: ${network}`)
  }

  const { addresses, bonders, bonderConfig, networks, metadata } = networkConfig
  const isMainnet = network === Network.Mainnet

  // Temp handle USDC native vs bridge
  let modifiedAddresses = addresses
  for (const token in addresses) {
    if (token === 'USDC.e') {
      modifiedAddresses = {
        ...modifiedAddresses,
        'USDC': addresses?.['USDC.e']
      }
    }
  }

  return {
    network,
    addresses: modifiedAddresses,
    bonders,
    bonderConfig,
    networks,
    metadata,
    isMainnet
  }
}


const { network, networks, metadata, addresses, bonders, bonderConfig, isMainnet } = getConfigByNetwork(envNetwork)

export const config: Config = {
  ...getCoreConfig(),
  isMainnet,
  network,
  networks,
  metadata,
  addresses,
  bonders,
  bonderConfig,
  fees: {},
  routes: {},
  db: {
    path: defaultDbPath
  },
  sync: {
    [Chain.Ethereum]: {
      totalBlocks: TotalBlocks.Ethereum,
      batchBlocks: 2000
    },
    [Chain.Arbitrum]: {
      totalBlocks: 100_000,
      batchBlocks: DefaultBatchBlocks
    },
    [Chain.Optimism]: {
      totalBlocks: 100_000,
      batchBlocks: 2000
    },
    [Chain.Polygon]: {
      totalBlocks: TotalBlocks.Polygon,
      batchBlocks: 2000
    },
    [Chain.Gnosis]: {
      totalBlocks: TotalBlocks.Gnosis,
      batchBlocks: DefaultBatchBlocks
    },
    [Chain.Nova]: {
      totalBlocks: 100_000,
      batchBlocks: DefaultBatchBlocks
    },
    [Chain.ZkSync]: {
      totalBlocks: 100_000,
      batchBlocks: DefaultBatchBlocks
    },
    [Chain.Linea]: {
      totalBlocks: 100_000,
      batchBlocks: 2000
    },
    [Chain.ScrollZk]: {
      totalBlocks: 100_000,
      batchBlocks: DefaultBatchBlocks
    },
    [Chain.Base]: {
      totalBlocks: 100_000,
      batchBlocks: 2000
    },
    [Chain.PolygonZk]: {
      totalBlocks: 100_000,
      batchBlocks: DefaultBatchBlocks
    }
  },
  commitTransfers: {
    minThresholdAmount: {}
  },
}

export const setConfigByNetwork = (network: string) => {
  const { addresses, networks, metadata, isMainnet } = getConfigByNetwork(network)
  config.isMainnet = isMainnet
  config.addresses = addresses
  config.network = network
  config.networks = networks
  config.metadata = metadata
}

export const setConfigAddresses = (addresses: Addresses) => {
  const { bridges } = addresses
  config.addresses = bridges
}

export const setConfigBonders = (bonders: Bonders) => {
  config.bonders = bonders
}

export const setNetworkCustomSyncType = (network: string, customSyncType: SyncType) => {
  if (config.networks[network]) {
    config.networks[network].customSyncType = customSyncType
  }
}

// Core Setters

export const setBonderPrivateKey = (privateKey: string) => {
  config.bonderPrivateKey = privateKey
  setCoreBonderPrivateKey(privateKey)
}

export const setNetworkRpcUrl = (network: string, rpcUrl: string) => {
  if (config.networks[network]) {
    config.networks[network].rpcUrl = rpcUrl
    setCoreNetworkRpcUrl(network, rpcUrl)
  }
}

export const setNetworkRedundantRpcUrls = (network: string, redundantRpcUrls: string[]) => {
  if (config.networks[network]) {
    config.networks[network].redundantRpcUrls = redundantRpcUrls
    setCoreNetworkRedundantRpcUrls(network, redundantRpcUrls)
  }
}

export const setNetworkMaxGasPrice = (network: string, maxGasPrice: number) => {
  if (config.networks[network]) {
    config.networks[network].maxGasPrice = maxGasPrice
    setCoreNetworkMaxGasPrice(network, maxGasPrice)
  }
}

export const getNetworkCustomSyncType = (network: string): SyncType | undefined => {
  return config.networks[network]?.customSyncType
}

export const setSyncConfig = (syncConfigs: SyncConfigs = {}) => {
  const networks = Object.keys(config.networks)
  for (const network of networks) {
    if (!syncConfigs[network]) {
      continue
    }
    if (!config.sync[network]) {
      config.sync = config.sync ?? {}
      config.sync[network] = {}
    }
    if (syncConfigs[network].totalBlocks) {
      config.sync[network].totalBlocks = syncConfigs[network].totalBlocks
    }
    if (syncConfigs[network].batchBlocks) {
      config.sync[network].batchBlocks = syncConfigs[network].batchBlocks
    }
  }
}

export const setDbPath = (dbPath: string) => {
  config.db.path = dbPath
}

export const getEnabledTokens = (): string[] => {
  return Object.keys(config.tokens).filter(token => config.tokens[token])
}

export const getEnabledNetworks = (): string[] => {
  const networks: {[network: string]: boolean} = {}
  for (const token in config.tokens) {
    for (const network in config.addresses[token]) {
      networks[network] = true
    }
  }
  return Object.keys(networks)
}

export function getAllChains () {
  return Object.keys(config.networks)
}

export function getAllTokens () {
  return Object.keys(config.addresses)
}

export function getSourceChains (tokenSymbol: string, settlementChain?: string): string[] {
  const enabledChains = getAllChains()
  const sourceChains = new Set<string>([])
  for (const chain of enabledChains) {
    if (chain === Chain.Ethereum || chain === settlementChain) {
      continue
    }
    if (!config.addresses[tokenSymbol][chain]) {
      continue
    }
    sourceChains.add(chain)
  }

  return Array.from(sourceChains)
}

export const setMetricsConfig = (metricsConfig: MetricsConfig) => {
  config.metrics = { ...config.metrics, ...metricsConfig }
}

export const setFeesConfig = (fees: Fees) => {
  config.fees = { ...config.fees, ...fees }
}

export const setRoutesConfig = (routes: Routes) => {
  config.routes = { ...config.routes, ...routes }
}

export const setCommitTransfersConfig = (commitTransfers: CommitTransfersConfig) => {
  config.commitTransfers = { ...config.commitTransfers, ...commitTransfers }
}

export const setConfigTokens = (tokens: Tokens) => {
  config.tokens = { ...config.tokens, ...tokens }
}

export const setSignerConfig = (signerConfig: SignerConfig) => {
  config.signerConfig = { ...config.signerConfig, ...signerConfig }
}

export const setBlocklistConfig = (blocklist: BlocklistConfig) => {
  config.blocklist = { ...config.blocklist, ...blocklist }
}

export const getBonderConfig = (tokens: Tokens) => {
  config.tokens = { ...config.tokens, ...tokens }
}

export const chainNativeTokens = ['ETH', 'MATIC', 'DAI']

export enum Watchers {
  BondTransferRoot = 'bondTransferRoot',
  BondWithdrawal = 'bondWithdrawal',
  Challenge = 'challenge',
  CommitTransfers = 'commitTransfers',
  SettleBondedWithdrawals = 'settleBondedWithdrawals',
  ConfirmRoots = 'confirmRoots',
  L1ToL2Relay = 'L1ToL2Relay',
}

export function enableEmergencyMode () {
  config.emergencyDryMode = true
}

export const getBonderTotalStake = (token: string): number | undefined => {
  return config.bonderConfig?.totalStake?.[token as AssetSymbol]
}

const getConfigBondersForToken = (token: string) => {
  return config.bonders?.[token as AssetSymbol]
}

export const getConfigBonderForRoute = (token: string, sourceChain: string, destinationChain: string) => {
  const bonders = getConfigBondersForToken(token)
  const bonder = bonders?.[sourceChain as Chain]?.[destinationChain as Chain]
  return bonder
}

export { type Bonders }
export * from './validation.js'
export * from './fileOps.js'
