import { explorerLink } from '../src/utils/explorerLink'
import { getSlugFromChainId } from '../src/utils/getSlugFromChainId'
import { chainSlugToName } from '../src/utils/chainSlugToName'
import { chainSlugToId } from '../src/utils/chainSlugToId'
import { getSubgraphUrl } from '../src/utils/getSubgraphUrl'
import { getDefaultRpcUrl } from '../src/utils/getDefaultRpcUrl'

describe('config', () => {
  it('explorerLink', () => {
    expect(explorerLink('arbitrum')).toBe('https://goerli.arbiscan.io')
  })
  it('getSlugFromChainId', () => {
    expect(getSlugFromChainId(1)).toBe('ethereum')
    expect(getSlugFromChainId(137)).toBe('polygon')
  })
  it('chainSlugToName', () => {
    expect(chainSlugToName('ethereum')).toBe('Ethereum')
    expect(chainSlugToName('arbitrum')).toBe('Arbitrum One')
  })
  it('chainSlugToId', () => {
    expect(chainSlugToId('ethereum')).toBe(5)
    expect(chainSlugToId('polygon')).toBe(80001)
  })
  it('getSubgraphUrl', () => {
    expect(getSubgraphUrl('ethereum')).toBe('https://api.thegraph.com/subgraphs/name/hop-protocol/hop-goerli')
  })
  it('getDefaultRpcUrl', () => {
    expect(getDefaultRpcUrl('mainnet', 'polygon')).toBe('https://polygon-rpc.com')
  })
})
