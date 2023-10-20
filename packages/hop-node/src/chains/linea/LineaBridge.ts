import AbstractChainBridge from '../AbstractChainBridge'
import { IChainBridge } from '../IChainBridge'
import { Signer, providers, BigNumber, Contract } from 'ethers'
import { LineaSDK } from '@consensys/linea-sdk'

class LineaBridge extends AbstractChainBridge implements IChainBridge {
  l1Wallet: Signer
  l2Wallet: Signer
  LineaSDK: LineaSDK

  constructor (chainSlug: string) {
    super(chainSlug)

    // TODO: as of Oct 2023, there is no way to use the SDK in read-write with an ethers signer rather than private keys
    this.LineaSDK = new LineaSDK({
      l1RpcUrl: process.env.L1_RPC_URL ?? "", // L1 rpc url
      l2RpcUrl: process.env.L2_RPC_URL ?? "", // L2 rpc url
      // l1SignerPrivateKey: process.env.L1_SIGNER_PRIVATE_KEY ?? "", // L1 account private key (optional if you use mode = read-only)
      // l2SignerPrivateKey: process.env.L2_SIGNER_PRIVATE_KEY ?? "", // L2 account private key (optional if you use mode = read-only)
      network: 'linea-goerli', // network you want to interact with (either linea-mainnet or linea-goerli)
      mode: 'read-only', // contract wrapper class mode (read-only or read-write), read-only: only read contracts state, read-write: read contracts state and claim messages 
    })
  }

  async relayL1ToL2Message (l1TxHash: string): Promise<providers.TransactionResponse> {
    const signer = this.l2Wallet
    const isSourceTxOnL1 = true

    return await this._relayXDomainMessage(l1TxHash, isSourceTxOnL1, signer)
  }

  async relayL2ToL1Message (l2TxHash: string): Promise<providers.TransactionResponse> {
    const signer = this.l1Wallet
    const isSourceTxOnL1 = false

    return this._relayXDomainMessage(l2TxHash, isSourceTxOnL1, signer)
  }

  private async _relayXDomainMessage (txHash: string, isSourceTxOnL1: boolean, wallet: Signer): Promise<providers.TransactionResponse> {
    const l1Contract = this.LineaSDK.getL1Contract()
    const l2Contract = this.LineaSDK.getL2Contract()

    const sourceBridge = isSourceTxOnL1 ? l1Contract : l2Contract
    const destinationBridge = isSourceTxOnL1 ? l2Contract : l1Contract

    const messages = await sourceBridge.getMessagesByTransactionHash(txHash)
    if (!messages) {
      throw new Error('could not find messages for tx hash')
    }
    
    const message = messages[0]
    const messageHash = message.messageHash

    const isRelayable = await this._isCheckpointed(messageHash, destinationBridge)
    if (!isRelayable) {
      throw new Error('expected deposit to be claimable')
    }

    const txReceipt = await destinationBridge.getTransactionReceiptByMessageHash(messageHash)
    if (!txReceipt) {
      throw new Error('could not get receipt from message')
    }

    // return await contract.claim(message)
    return await destinationBridge.contract.connect(wallet).claimMessage(
      txReceipt.from,
      txReceipt.to,
      message.fee,
      message.value,
      message.messageSender,
      message.calldata,
      message.messageNonce
    )
  }

  private async _isCheckpointed (messageHash: string, destinationBridge: any): Promise<boolean> {
    const messageStatus = await destinationBridge.getMessageStatus(messageHash)
    
    if (messageStatus === 'CLAIMABLE') {
      return true
    }
    return false
  }
}
export default LineaBridge
