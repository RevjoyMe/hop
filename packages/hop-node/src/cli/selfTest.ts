import L1Bridge from '#watchers/classes/L1Bridge.js'
import contracts from '#contracts/index.js'
import wallets from '@hop-protocol/hop-node-core/wallets'
import { Chain, Token } from '@hop-protocol/hop-node-core/constants'
import { actionHandler, logger, parseNumber, parseString, root } from './shared/index.js'
import { utils } from 'ethers'

root
  .command('self-test')
  .description('Self test')
  .option('--token <symbol>', 'Token', parseString)
  .option('--amount <number>', 'Amount (in human readable format)', parseNumber)
  .action(actionHandler(main))

async function main (source: any) {
  const { token, amount } = source
  if (!token) {
    throw new Error('token is required')
  }
  if (!amount) {
    throw new Error('amount is required')
  }

  // Instantiate objects
  const tokenContracts = contracts.get(token, Chain.Ethereum)
  if (!tokenContracts) {
    throw new Error('token contracts not found')
  }
  const bridge = new L1Bridge(tokenContracts.l1Bridge)
  const wallet = wallets.get(Chain.Ethereum)
  const walletAddress = await wallet.getAddress()

  // Validate balances
  const minEthAmount = '0.01'
  const parsedMinEthAmount = utils.parseEther(minEthAmount)
  const ethBalance = await wallet.getBalance()
  if (ethBalance.lt(parsedMinEthAmount)) {
    throw new Error(`not enough ETH balance for test. need at least ${minEthAmount} ETH. you have ${utils.formatEther(ethBalance)} in your address (${walletAddress})`)
  }

  // NOTE: this only works with ERC20 tokens, not native tokens
  const l1CanonicalTokenContract = tokenContracts.l1CanonicalToken
  let parsedStakeAmount = utils.parseEther(amount.toString())
  if (token !== Token.ETH) {
    parsedStakeAmount = utils.parseUnits(amount.toString(), await l1CanonicalTokenContract.decimals())
    const tokenBalance = await l1CanonicalTokenContract.balanceOf(walletAddress)
    if (tokenBalance.lt(parsedStakeAmount)) {
      throw new Error(`not enough token balance for test. need at least ${amount} ${token}. you have ${utils.formatEther(tokenBalance)} in your address (${walletAddress})`)
    }
  }

  // Send ETH to self
  const parsedEthSendAmount = parsedMinEthAmount.div(10)
  logger.debug(`sendNativeToken: attempting to send ${utils.formatEther(parsedEthSendAmount)} to self on Ethereum`)

  let tx = await wallet.sendTransaction({
    value: parsedEthSendAmount,
    to: walletAddress
  })
  logger.info(`send tx: ${tx.hash}`)
  await tx.wait()
  logger.debug('send complete')

  const isBonder = await bridge.isBonder()
  if (isBonder) {
    // Approve token
    logger.debug(`approval: attempting to approve ${token} on Ethereum`)
    tx = await l1CanonicalTokenContract.approve(bridge.address, parsedStakeAmount)
    await tx.wait()
    logger.debug('approval complete')

    // Stake token
    logger.debug(`stake: attempting to stake ${utils.formatEther(parsedStakeAmount)} on Ethereum`)
    tx = await bridge.stake(parsedStakeAmount)
    await tx.wait()
    logger.debug('stake completed')

    // Unstake token
    logger.debug(`unstake: attempting to stake ${utils.formatEther(parsedStakeAmount)} on Ethereum`)
    tx = await bridge.unstake(parsedStakeAmount)
    await tx.wait()
    logger.debug('unstake completed')
  }

  // Log result
  logger.debug('\n\n *** SELF TEST COMPLETE ***\n')
  logger.debug(`Sent ${utils.formatEther(parsedEthSendAmount)} ETH to self on Ethereum ✓`)
  logger.debug(`Staked ${amount} ${token} on Ethereum ${isBonder ? '✓' : '✗ (you are not an active bonder)'}`)
  logger.debug(`Unstaked ${amount} ${token} on Ethereum ${isBonder ? '✓' : '✗ (you are not an active bonder)'}`)
}
