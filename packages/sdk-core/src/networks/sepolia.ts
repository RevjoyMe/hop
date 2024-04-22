import { Networks } from './types.js'
import { chains } from '../metadata/index.js'

export const networks: Networks = {
  ethereum: {
    name: chains.ethereum.name,
    image: chains.ethereum.image,
    networkId: 11155111,
    publicRpcUrl: 'https://sepolia.infura.io/v3/84842078b09946638c03157f83405213', // from ethers
    fallbackPublicRpcUrls: [],
    explorerUrls: ['https://sepolia.etherscan.io'],
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/hop-protocol/hop-sepolia',
    multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
    txOverrides: {
      minGasLimit: 1_000_000
    },
    averageBlockTimeSeconds: 12
  },
  arbitrum: {
    name: chains.arbitrum.name,
    image: chains.arbitrum.image,
    networkId: 421614,
    publicRpcUrl: 'https://arbitrum-sepolia.infura.io/v3/84842078b09946638c03157f83405213', // from ethers
    fallbackPublicRpcUrls: [],
    explorerUrls: ['https://sepolia.arbiscan.io'],
    multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
    isRollup: true
  },
  optimism: {
    name: chains.optimism.name,
    image: chains.optimism.image,
    networkId: 11155420,
    publicRpcUrl: 'https://optimism-sepolia.infura.io/v3/84842078b09946638c03157f83405213', // from ethers
    fallbackPublicRpcUrls: [],
    explorerUrls: ['https://sepolia-optimism.etherscan.io'],
    multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
    isRollup: true
  }
}
