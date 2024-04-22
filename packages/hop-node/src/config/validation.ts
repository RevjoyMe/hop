import { AssetSymbol } from '@hop-protocol/sdk/config'
import { Chain } from '@hop-protocol/hop-node-core/constants'
import {
  type Config,
  type FileConfig,
  Watchers,
  getAllChains,
  getAllTokens,
  getEnabledTokens
} from './index.js'
import { SyncType } from '#constants/index.js'
import { URL } from 'node:url'
import { utils } from 'ethers'
import type { ChainSlug } from '@hop-protocol/sdk/config'

export function isValidToken (token: string) {
  const validTokens = getAllTokens()
  return validTokens.includes(token)
}

export function isValidChain (network: string) {
  const networks = getAllChains()
  return networks.includes(network)
}

export function validateKeys (validKeys: string[] = [], keys: string[]) {
  for (const key of keys) {
    if (!validKeys.includes(key)) {
      throw new Error(`unrecognized key "${key}". Valid keys are: ${validKeys.join(',')}`)
    }
  }
}

export async function validateConfigFileStructure (config?: FileConfig) {
  if (!config) {
    throw new Error('config is required')
  }

  if (!(config instanceof Object)) {
    throw new Error('config must be a JSON object')
  }

  const validSectionKeys = [
    'network',
    'chains',
    'sync',
    'tokens',
    'commitTransfers',
    'bondWithdrawals',
    'settleBondedWithdrawals',
    'watchers',
    'db',
    'logging',
    'keystore',
    'addresses',
    'metrics',
    'fees',
    'routes',
    'bonders',
    'signer',
    'blocklist'
  ]

  const validWatcherKeys = [
    Watchers.BondTransferRoot,
    Watchers.BondWithdrawal,
    Watchers.Challenge,
    Watchers.CommitTransfers,
    Watchers.SettleBondedWithdrawals,
    Watchers.ConfirmRoots,
    Watchers.L1ToL2Relay
  ]

  const validChainKeys = [
    Chain.Ethereum,
    Chain.Optimism,
    Chain.Arbitrum,
    Chain.Gnosis,
    Chain.Polygon,
    Chain.Nova,
    Chain.ZkSync,
    Chain.Linea,
    Chain.ScrollZk,
    Chain.Base,
    Chain.PolygonZk
  ]

  const validTokenKeys = Object.values(AssetSymbol)

  const sectionKeys = Object.keys(config)
  validateKeys(validSectionKeys, sectionKeys)

  const enabledChains: string[] = Object.keys(config.chains)
  if (!enabledChains.includes(Chain.Ethereum)) {
    throw new Error(`config for chain "${Chain.Ethereum}" is required`)
  }

  validateKeys(validChainKeys, enabledChains)

  for (const key in config.chains) {
    const chain = config.chains[key]
    const validChainConfigKeys = ['rpcUrl', 'maxGasPrice', 'redundantRpcUrls', 'customSyncType']
    const chainKeys = Object.keys(chain)
    validateKeys(validChainConfigKeys, chainKeys)
  }

  const enabledTokens = Object.keys(config.tokens).filter(token => config.tokens[token])
  validateKeys(validTokenKeys, enabledTokens)

  const watcherKeys = Object.keys(config.watchers)
  validateKeys(validWatcherKeys, watcherKeys)

  if (config?.keystore && config?.signer) {
    throw new Error('You cannot have both a keystore and a signer')
  }

  if (config.db) {
    const validDbKeys = ['location']
    const dbKeys = Object.keys(config.db)
    validateKeys(validDbKeys, dbKeys)
  }

  if (config.logging) {
    const validLoggingKeys = ['level']
    const loggingKeys = Object.keys(config.logging)
    validateKeys(validLoggingKeys, loggingKeys)

    if (config?.logging?.level) {
      const validLoggingLevels = ['debug', 'info', 'warn', 'error']
      validateKeys(validLoggingLevels, [config?.logging?.level])
    }
  }

  if (config.keystore) {
    const validKeystoreProps = [
      'location',
      'pass',
      'passwordFile',
      'parameterStore',
      'awsRegion'
    ]
    const keystoreProps = Object.keys(config.keystore)
    validateKeys(validKeystoreProps, keystoreProps)
  }

  if (config.signer) {
    const validSignerProps = [
      'type',
      'keyId',
      'awsRegion',
      'lambdaFunctionName'
    ]
    const signerProps = Object.keys(config.signer)
    validateKeys(validSignerProps, signerProps)
  }

  if (config.metrics) {
    const validMetricsKeys = ['enabled', 'port']
    const metricsKeys = Object.keys(config.metrics)
    validateKeys(validMetricsKeys, metricsKeys)
  }

  if (config.addresses) {
    const validAddressesProps = [
      'location'
    ]
    const addressesProps = Object.keys(config.addresses)
    validateKeys(validAddressesProps, addressesProps)
  }

  if (config.routes) {
    const sourceChains = Object.keys(config.routes)
    validateKeys(enabledChains, sourceChains)
    for (const sourceChain in config.routes) {
      const destinationChains = Object.keys(config.routes[sourceChain])
      validateKeys(enabledChains, destinationChains)
    }
  }

  if (config.fees) {
    const tokens = Object.keys(config.fees)
    validateKeys(enabledTokens, tokens)
    const destinationChains = new Set()
    for (const sourceChain in config.routes) {
      for (const destinationChain of Object.keys(config.routes[sourceChain])) {
        destinationChains.add(destinationChain)
      }
    }
    for (const token in config.fees) {
      const chains = Object.keys(config.fees[token])
      validateKeys(enabledChains, chains)
      for (const chain of destinationChains) {
        const found = config.fees[token as AssetSymbol]?.[chain as ChainSlug]
        if (!found) {
          throw new Error(`missing fee for chain "${chain}" for token "${token}"`)
        }
      }
    }
    for (const enabledToken of enabledTokens) {
      const found = config?.fees?.[enabledToken]
      if (!found) {
        throw new Error(`missing fee for token "${enabledToken}"`)
      }
    }
  }

  if (config.commitTransfers) {
    const validCommitTransfersKeys = ['minThresholdAmount']
    const commitTransfersKeys = Object.keys(config.commitTransfers)
    validateKeys(validCommitTransfersKeys, commitTransfersKeys)
    const minThresholdAmount = config.commitTransfers.minThresholdAmount
    const tokens = Object.keys(minThresholdAmount)
    if (tokens.length) {
      validateKeys(enabledTokens, tokens)
      for (const token of enabledTokens) {
        if (!minThresholdAmount[token]) {
          throw new Error(`missing minThresholdAmount config for token "${token}"`)
        }
        const chains = Object.keys(minThresholdAmount[token])
        validateKeys(enabledChains, chains)
        for (const sourceChain in config.routes) {
          if (sourceChain === Chain.Ethereum) {
            continue
          }
          if (!minThresholdAmount[token][sourceChain]) {
            throw new Error(`missing minThresholdAmount config for token "${token}" source chain "${sourceChain}"`)
          }
          for (const destinationChain in config.routes[sourceChain]) {
            if (!minThresholdAmount[token][sourceChain][destinationChain]) {
              throw new Error(`missing minThresholdAmount config for token "${token}" source chain "${sourceChain}" destination chain "${destinationChain}"`)
            }
          }
        }
      }
    }
  }

  if (config.bonders) {
    const bonders = config.bonders
    if (!(bonders instanceof Object)) {
      throw new Error('bonders config should be an object')
    }
    const tokens = Object.keys(bonders)
    validateKeys(enabledTokens, tokens)
    for (const token of enabledTokens) {
      if (!(bonders[token as AssetSymbol] instanceof Object)) {
        throw new Error(`bonders config for "${token}" should be an object`)
      }
      const sourceChains = Object.keys(bonders[token as AssetSymbol])
      validateKeys(enabledChains, sourceChains)
      for (const sourceChain in bonders[token as AssetSymbol]) {
        if (!(bonders[token as AssetSymbol][sourceChain as ChainSlug] instanceof Object)) {
          throw new Error(`bonders config for "${token}.${sourceChain}" should be an object`)
        }
        const obj = bonders[token as AssetSymbol][sourceChain as ChainSlug]
        if (!obj) {
          continue
        }
        const destinationChains = Object.keys(obj)
        validateKeys(enabledChains, destinationChains)
      }
    }
  }

  if (config.blocklist) {
    const blocklistConfig = config.blocklist
    if (!(blocklistConfig instanceof Object)) {
      throw new Error('blocklist config must be an object')
    }
    const validBlocklistKeys = ['path', 'addresses']
    const keys = Object.keys(blocklistConfig)
    validateKeys(validBlocklistKeys, keys)
  }
}

export async function validateConfigValues (config?: Config) {
  if (!config) {
    throw new Error('config is required')
  }

  if (!(config instanceof Object)) {
    throw new Error('config must be a JSON object')
  }

  for (const chainSlug in config.networks) {
    const chain = config.networks[chainSlug]
    if (!chain) {
      throw new Error(`RPC config for chain "${chain}" is required`)
    }
    const { rpcUrl, maxGasPrice, redundantRpcUrls, customSyncType } = chain
    if (!rpcUrl) {
      throw new Error(`RPC url for chain "${chainSlug}" is required`)
    }
    if (typeof rpcUrl !== 'string') {
      throw new Error(`RPC url for chain "${chainSlug}" must be a string`)
    }
    try {
      const parsed = new URL(rpcUrl)
      if (!parsed.protocol || !parsed.host || !['http:', 'https:'].includes(parsed.protocol)) {
        throw new URIError()
      }
    } catch (err) {
      throw new Error(`rpc url "${rpcUrl}" is invalid`)
    }
    if (maxGasPrice != null) {
      if (typeof maxGasPrice !== 'number') {
        throw new Error(`maxGasPrice for chain "${chainSlug}" must be a number`)
      }
      if (maxGasPrice <= 0) {
        throw new Error(`maxGasPrice for chain "${chainSlug}" must be greater than 0`)
      }
    }
    if (customSyncType != null) {
      if (!Object.values(SyncType).includes(customSyncType as SyncType)) {
        throw new Error(`customSyncType for chain "${chainSlug}" must be of type SyncType`)
      }
    }
    if (redundantRpcUrls && redundantRpcUrls.length > 0) {
      if (!Array.isArray(redundantRpcUrls)) {
        throw new Error(`redundantRpcUrls for chain "${chainSlug}" must be an array`)
      }
      for (const redundantRpcUrl of redundantRpcUrls) {
        if (typeof redundantRpcUrl !== 'string') {
          throw new Error(`redundantRpcUrl for chain "${chainSlug}" must be a string`)
        }
        try {
          const parsed = new URL(redundantRpcUrl)
          if (!parsed.protocol || !parsed.host || !['http:', 'https:'].includes(parsed.protocol)) {
            throw new URIError()
          }
        } catch (err) {
          throw new Error(`redundantRpcUrl "${redundantRpcUrl}" is invalid`)
        }
      }
    }
  }

  const enabledTokens = getEnabledTokens()

  if (config.commitTransfers) {
    const { minThresholdAmount } = config.commitTransfers
    if (Object.keys(minThresholdAmount).length) {
      for (const token of enabledTokens) {
        for (const sourceChain in config.routes) {
          if (sourceChain === Chain.Ethereum) {
            continue
          }
          for (const destinationChain in config.routes[sourceChain]) {
            if (typeof minThresholdAmount[token][sourceChain][destinationChain] !== 'number') {
              throw new Error(`minThresholdAmount config for token "${token}" source chain "${sourceChain}" destination chain "${destinationChain}" must be a number`)
            }
          }
        }
      }
    }
  }

  if (config.bonders) {
    const bonders = config.bonders
    for (const token of enabledTokens) {
      for (const sourceChain in bonders[token as AssetSymbol]) {
        for (const destinationChain in bonders[token as AssetSymbol][sourceChain as ChainSlug]) {
          const bonderAddress = bonders[token as AssetSymbol][sourceChain as ChainSlug]?.[destinationChain as ChainSlug]
          if (typeof bonderAddress !== 'string') {
            throw new Error('config bonder address should be a string')
          }
          try {
            utils.getAddress(bonderAddress)
          } catch (err) {
            throw new Error(`config bonder address "${bonderAddress}" is invalid`)
          }
        }
      }
    }
  }

  if (config.blocklist) {
    if (typeof config.blocklist.path !== 'string') {
      throw new Error('blocklist.path must be a string')
    }
  }
}
