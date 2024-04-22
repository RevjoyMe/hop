import getTransferRootsCount from '#theGraph/getTransferRootsCount.js'
import { Chain } from '@hop-protocol/hop-node-core/constants'
import { actionHandler, root } from './shared/index.js'
import {
  getEnabledNetworks,
  getEnabledTokens
} from '#config/index.js'

root
  .command('transfer-roots-count')
  .description('Get transfer roots count')
  .action(actionHandler(main))

async function main (source: any) {
  const chains = getEnabledNetworks()
  const tokens = getEnabledTokens()
  const counts: Record<string, Record<string, number>> = {}
  let total = 0
  for (const chain of chains) {
    if (chain === Chain.Ethereum) {
      continue
    }
    for (const token of tokens) {
      console.log(`fetching ${chain}.${token} count`)
      const count = await getTransferRootsCount(chain, token)
      if (!counts[chain]) {
        counts[chain] = {}
      }
      if (!counts[chain][token]) {
        counts[chain][token] = 0
      }
      counts[chain][token] += count
      total += count
    }
  }
  console.log(JSON.stringify(counts, null, 2))
  console.log(`total: ${total}`)
}
