import getTransferRoot from '#theGraph/getTransferRoot.js'
import { WatcherNotFoundError } from './shared/utils.js'
import { actionHandler, parseBool, parseString, root } from './shared/index.js'
import { chainIdToSlug } from '@hop-protocol/hop-node-core/utils'
import {
  getSettleBondedWithdrawalsWatcher
} from '#watchers/watchers.js'

root
  .command('settle')
  .description('Settle bonded withdrawals')
  .option('--source-chain <slug>', 'Source chain', parseString)
  .option('--token <slug>', 'Token', parseString)
  .option('--transfer-root-hash <id>', 'Transfer root hash', parseString)
  .option('--bonder <address>', 'Bonder address', parseString)
  .option('--use-db [boolean]', 'Use the DB to construct the roots', parseBool)
  .option(
    '--dry [boolean]',
    'Start in dry mode. If enabled, no transactions will be sent.',
    parseBool
  )
  .action(actionHandler(main))

async function main (source: any) {
  let { sourceChain: chain, token, transferRootHash, bonder, useDb, dry: dryMode } = source
  if (!chain) {
    throw new Error('source chain is required')
  }
  if (!token) {
    throw new Error('token is required')
  }
  if (!transferRootHash) {
    throw new Error('transferRootHash is required')
  }

  if (typeof useDb === 'undefined') {
    useDb = true
  }

  const watcher = await getSettleBondedWithdrawalsWatcher({ chain, token, dryMode })
  if (!watcher) {
    throw new Error(WatcherNotFoundError)
  }

  if (useDb) {
    await watcher.checkTransferRootHash(transferRootHash, bonder)
  } else {
    const transferRoot: any = await getTransferRoot(chain, token, transferRootHash)
    const destinationChainId: number = transferRoot.destinationChainId
    const destinationChain = chainIdToSlug(destinationChainId)
    const transferIds: string[] = []
    for (const transfer of transferRoot.transferIds) {
      transferIds.push(transfer.transferId)
    }

    const destinationChainWatcher = await getSettleBondedWithdrawalsWatcher({ chain: destinationChain, token, dryMode })
    await destinationChainWatcher.bridge.settleBondedWithdrawals(
      bonder,
      transferIds,
      transferRoot.totalAmount
    )
  }
}
