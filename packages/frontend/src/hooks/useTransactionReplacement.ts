import Transaction from '#models/Transaction.js'
import { ContractTransaction, errors } from 'ethers'
import { TransactionStatus as GnosisSafeTxStatus } from '@gnosis.pm/safe-apps-sdk'
import { WalletName } from '#utils/index.js'
import { getTransferSentDetailsFromLogs } from '#utils/logs.js'
import { useApp } from '#contexts/AppContext/index.js'
import { useCallback } from 'react'
import { useGnosisSafeTransaction } from './useGnosisSafeTransaction.js'
import { useWeb3Context } from '#contexts/Web3Context.js'

function useTransactionReplacement(walletName?: WalletName | string) {
  const { txHistory } = useApp()
  const { transactions, addTransaction, updateTransaction } = txHistory
  const { provider } = useWeb3Context()
  const { getSafeTx, connected, safe } = useGnosisSafeTransaction()

  const waitForTransaction = useCallback(
    async (transaction: ContractTransaction, txModelArgs: any) => {
      if (!(transaction && provider)) {
        return
      }

      try {
        if (walletName === WalletName.GnosisSafe && connected) {
          const safeTx = await getSafeTx(transaction)
          console.log(`GOT safeTx:`, safeTx)

          if (safeTx?.txStatus === GnosisSafeTxStatus.SUCCESS && safeTx.txHash) {
            const receipt = await provider.getTransactionReceipt(safeTx.txHash)

            if (safeTx.detailedExecutionInfo?.type === 'MULTISIG') {
              const txModel = new Transaction({
                ...txModelArgs,
                to: safeTx.detailedExecutionInfo.executor?.value ?? safeTx.txData?.to.value,
                from: safe.safeAddress,
                nonce: safeTx.detailedExecutionInfo.nonce,
                receipt,
                timestampMs: safeTx.executedAt,
                hash: safeTx.txHash || transaction.hash,
                pendingDestinationConfirmation: true,
                replaced: transaction.hash,
                safeTx,
              })

              // console.log(`gs txModel:`, txModel)

              addTransaction(txModel)

              return {
                originalTx: transaction,
                replacementTxModel: txModel,
                replacementTx: safeTx.txData,
                replacementReceipt: safeTx.detailedExecutionInfo,
              }
            }
          }
        }

        return await transaction.wait()
      } catch (error: any) {
        if (error.code === errors.TRANSACTION_REPLACED) {
          const { replacement, receipt } = error
          console.log(`replacement tx, receipt:`, replacement, receipt)

          // User ran MetaMask "Speed up" feature
          if (!error.cancelled) {
            const tsDetails = getTransferSentDetailsFromLogs(receipt.logs)
            console.log(`replacement tsDetails:`, tsDetails)

            const replacementTxModel = new Transaction({
              ...txModelArgs,
              hash: replacement.hash,
              pendingDestinationConfirmation: true,
              replaced: transaction.hash,
              transferId: tsDetails?.transferId,
            })

            addTransaction(replacementTxModel)

            return {
              originalTx: transaction,
              replacementTxModel,
              replacementTx: replacement,
              replacementReceipt: receipt,
            }
          }
        }
      }
    },
    [transactions, addTransaction, walletName, provider, connected]
  )

  return { waitForTransaction, transactions, addTransaction, updateTransaction }
}

export { useTransactionReplacement }
