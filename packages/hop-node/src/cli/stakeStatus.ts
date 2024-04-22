import { Chain } from '@hop-protocol/hop-node-core/constants'
import { WatcherNotFoundError } from './shared/utils.js'
import { actionHandler, logger, parseString, root } from './shared/index.js'
import { constants } from 'ethers'
import {
  getBondWithdrawalWatcher
} from '#watchers/watchers.js'
import type L1Bridge from '#watchers/classes/L1Bridge.js'
import type L2Bridge from '#watchers/classes/L2Bridge.js'
import type Token from '#watchers/classes/Token.js'

root
  .command('stake-status')
  .description('Stake status')
  .option('--chain <slug>', 'Chain', parseString)
  .option('--token <symbol>', 'Token', parseString)
  .action(actionHandler(main))

async function main (source: any) {
  const { chain, token } = source

  // Arbitrary watcher since only the bridge is needed
  const watcher = await getBondWithdrawalWatcher({ chain, token, dryMode: false })
  if (!watcher) {
    throw new Error(WatcherNotFoundError)
  }

  const bridge: L2Bridge | L1Bridge = watcher.bridge
  await printAmounts(bridge)
}

async function printAmounts (bridge: L2Bridge | L1Bridge) {
  const bonderAddress = await bridge.getBonderAddress()
  logger.debug(`bonder address: ${bonderAddress}`)

  const [credit, rawDebit, debit, allowance, eth] = await Promise.all([
    bridge.getCredit(),
    bridge.getRawDebit(),
    bridge.getDebit(),
    getTokenAllowance(bridge),
    bridge.getEthBalance()
  ])

  const token = await getToken(bridge)
  let balance
  if (token) {
    balance = await token.getBalance()
  }
  logger.debug('eth balance:', bridge.formatEth(eth))
  logger.debug('token balance:', balance && bridge.formatUnits(balance))
  logger.debug('credit balance:', bridge.formatUnits(credit))
  logger.debug('raw debit balance:', bridge.formatUnits(rawDebit))
  logger.debug('debit balance:', bridge.formatUnits(debit))
  logger.debug('allowance:', bridge.formatUnits(allowance))
}

async function getToken (bridge: L2Bridge | L1Bridge): Promise<Token | void> {
  const isEthSend: boolean = bridge.l1CanonicalTokenAddress === constants.AddressZero
  if (isEthSend) {
    return
  } else if (bridge.chainSlug !== Chain.Ethereum) {
    return (bridge as L2Bridge).hToken()
  }
  return (bridge as L1Bridge).l1CanonicalToken()
}

async function getTokenAllowance (bridge: L2Bridge | L1Bridge) {
  if (bridge.tokenSymbol === 'ETH') {
    return constants.MaxUint256
  }
  const spender: string = bridge.getAddress()
  const token: Token = (await getToken(bridge)) as Token
  return token.getAllowance(spender)
}
