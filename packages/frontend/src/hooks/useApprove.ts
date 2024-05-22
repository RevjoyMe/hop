import Transaction from '#models/Transaction.js'
import { BigNumber, constants } from 'ethers'
import { ChainSlug, NetworkSlug, Token, getChain } from '@hop-protocol/sdk'
import { toTokenDisplay } from '#utils/index.js'
import { useApp } from '#contexts/AppContext/index.js'
import { useTransactionReplacement } from '#hooks/useTransactionReplacement.js'
import { useWeb3Context } from '#contexts/Web3Context.js'
import { reactAppNetwork } from '#config/index.js'

const useApprove = (token: any) => {
  const { provider } = useWeb3Context()
  const { txConfirm } = useApp()
  const { waitForTransaction, addTransaction } = useTransactionReplacement()

  const checkApproval = async (amount: BigNumber, token: Token, spender: string): Promise<boolean> => {
    try {
      const signer = provider?.getSigner()
      if (!signer) {
        throw new Error('Wallet not connected')
      }

      if (token.isNativeToken) {
        return false
      }

      const approved = await token.allowance(spender)
      if (approved.gte(amount)) {
        return false
      }

      return true
    } catch (err: any) {
      console.error('checkApproval error:', err)
      return false
    }
  }

  const approve = async (amount: BigNumber, token: Token, spender: string) => {
    const signer = provider?.getSigner()
    if (!signer) {
      throw new Error('Wallet not connected')
    }

    if (token.isNativeToken) {
      return
    }

    const approved = await token.allowance(spender)
    if (approved.gte(amount)) {
      return
    }

    const formattedAmount = toTokenDisplay(amount, token.decimals)
    const chain = getChain(reactAppNetwork as NetworkSlug, token.chain.slug as ChainSlug)
    const tx = await txConfirm?.show({
      kind: 'approval',
      inputProps: {
        tagline: `Allow Hop to spend your ${token.symbol} on ${chain.name}`,
        amount: token.symbol === 'USDT' ? undefined : formattedAmount,
        token,
        tokenSymbol: token.symbol,
        source: {
          network: {
            slug: token.chain?.slug,
            networkId: token.chain?.chainId,
          },
        },
      },
      onConfirm: async (approveAll: boolean) => {
        const approveAmount = approveAll ? constants.MaxUint256 : amount
        return token.approve(spender, approveAmount)
      },
    })

    if (tx?.hash) {
      addTransaction(
        new Transaction({
          hash: tx?.hash,
          networkName: token.chain.slug,
          token,
        })
      )

      const res = await waitForTransaction(tx, { networkName: token.chain.slug, token })
      if (res && 'replacementTx' in res) {
        return res.replacementTx
      }
    }

    return tx
  }

  return { approve, checkApproval }
}

export default useApprove
