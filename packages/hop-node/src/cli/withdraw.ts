import getTransferId from '#theGraph/getTransfer.js'
import getTransferRoot from '#theGraph/getTransferRoot.js'
import { WatcherNotFoundError } from './shared/utils.js'
import { actionHandler, getWithdrawalProofDataForCli, parseString, root } from './shared/index.js'
import { chainIdToSlug } from '@hop-protocol/hop-node-core/utils'
import {
  getBondWithdrawalWatcher
} from '#watchers/watchers.js'

root
  .command('withdraw')
  .description('Withdraw a transfer')
  .option('--chain <slug>', 'Chain', parseString)
  .option('--token <symbol>', 'Token', parseString)
  .option('--transfer-id <id>', 'Transfer ID', parseString)
  .action(actionHandler(main))

async function main (source: any) {
  const { chain, token, transferId } = source
  if (!chain) {
    throw new Error('chain is required')
  }
  if (!token) {
    throw new Error('token is required')
  }
  if (!transferId) {
    throw new Error('transfer id is required')
  }

  const transfer = await getTransferId(
    chain,
    token,
    transferId
  )
  if (!transfer) {
    throw new Error('transfer not found')
  }

  const {
    transferRootHash,
    recipient,
    amount,
    transferNonce,
    bonderFee,
    amountOutMin,
    deadline,
    destinationChainId
  } = transfer

  if (!transferRootHash) {
    throw new Error('no transfer root hash found for transfer Id. Has the transferId been committed (pendingTransferIdsForChainId)?')
  }

  if (
    !recipient ||
    !amount ||
    !transferNonce ||
    !bonderFee ||
    !amountOutMin ||
    !deadline ||
    !destinationChainId
  ) {
    throw new Error('transfer Id is incomplete')
  }

  const transferRoot = await getTransferRoot(
    chain,
    token,
    transferRootHash
  )

  if (!transferRoot) {
    throw new Error('no transfer root item found for transfer Id')
  }

  const {
    rootTotalAmount,
    numLeaves,
    proof,
    transferIndex
  } = getWithdrawalProofDataForCli(transferId, transferRoot)

  const destinationChain = chainIdToSlug(destinationChainId)
  const watcher = await getBondWithdrawalWatcher({ chain: destinationChain, token, dryMode: false })
  if (!watcher) {
    throw new Error(WatcherNotFoundError)
  }

  await watcher.bridge.withdraw(
    recipient,
    amount,
    transferNonce,
    bonderFee,
    amountOutMin,
    deadline,
    transferRootHash,
    rootTotalAmount,
    transferIndex,
    proof,
    numLeaves
  )
}
