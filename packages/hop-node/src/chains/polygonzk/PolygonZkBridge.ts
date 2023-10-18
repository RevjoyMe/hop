import AbstractChainBridge from '../AbstractChainBridge'
import wait from 'src/utils/wait'
import { CanonicalMessengerRootConfirmationGasLimit } from 'src/constants'
import { IChainBridge } from '../IChainBridge'
import { Signer, providers } from 'ethers'
import { Web3ClientPlugin } from '@maticnetwork/maticjs-ethers'
import { ZkEvmClient, setProofApi, use } from '@maticnetwork/maticjs'

class PolygonZkBridge extends AbstractChainBridge implements IChainBridge {
  ready: boolean = false
  l1Provider: any
  l2Provider: any
  l1Wallet: Signer
  l2Wallet: Signer
  chainId: number
  apiUrl: string
  polygonzkMainnetChainId: number = 1101
  zkEvmClient: ZkEvmClient
  messengerAddress: string

  constructor (chainSlug: string) {
    super(chainSlug)

    this.apiUrl = `https://proof-generator.polygon.technology/api/v1/${
      this.chainId === this.polygonzkMainnetChainId ? 'matic' : 'mumbai'
    }/block-included`

    use(Web3ClientPlugin)
    setProofApi('https://proof-generator.polygon.technology/')

    this.zkEvmClient = new ZkEvmClient()
    this.messengerAddress = this.chainId === this.polygonzkMainnetChainId ? '0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe' : '0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7'

    this.init()
      .catch((err: any) => {
        this.logger.error('zkEvmClient initialize error:', err)
      })
  }

  async init () {
    const from = await this.l1Wallet.getAddress()
    await this.zkEvmClient.init({
      network: this.chainId === this.polygonzkMainnetChainId ? 'mainnet' : 'testnet',
      version: this.chainId === this.polygonzkMainnetChainId ? 'v1' : 'blueberry',
      parent: {
        provider: this.l1Wallet,
        defaultConfig: {
          from
        }
      },
      child: {
        provider: this.l2Wallet,
        defaultConfig: {
          from
        }
      }
    })
    this.ready = true
  }

  private async _tilReady (): Promise<boolean> {
    if (this.ready) {
      return true
    }

    await wait(100)
    return await this._tilReady()
  }

  async relayL1ToL2Message (l1TxHash: string): Promise<providers.TransactionResponse> {
    await this._tilReady()

    const networkId = 0
    const signer = this.l2Wallet
    return await this._relayXDomainMessage(l1TxHash, networkId, signer)
  }

  async relayL2ToL1Message (l2TxHash: string): Promise<providers.TransactionResponse> {
    await this._tilReady()

    const networkId = 1
    const signer = this.l1Wallet
    return this._relayXDomainMessage(l2TxHash, networkId, signer)
  }

  private async _relayXDomainMessage (txHash: string, networkId: number, wallet: Signer): Promise<providers.TransactionResponse> {
    const isRelayable = await this._isCheckpointed(txHash, networkId)
    if (!isRelayable) {
      throw new Error('expected deposit to be claimable')
    }

    const isParent = networkId === 0
    const claimPayload = await this.zkEvmClient.bridgeUtil.buildPayloadForClaim(txHash, isParent, networkId)

    const zkEvmBridge = isParent ? this.zkEvmClient.rootChainBridge : this.zkEvmClient.childChainBridge

    const claimMessageTx = await zkEvmBridge.claimMessage(
      claimPayload.smtProof,
      claimPayload.index,
      claimPayload.mainnetExitRoot,
      claimPayload.rollupExitRoot,
      claimPayload.originNetwork,
      claimPayload.originTokenAddress,
      claimPayload.destinationNetwork,
      claimPayload.destinationAddress,
      claimPayload.amount,
      claimPayload.metadata,
      { gasLimit: CanonicalMessengerRootConfirmationGasLimit }
    )

    const claimMessageTxHash: string = await claimMessageTx.getTransactionHash()
    const provider = isParent ? this.l1Provider : this.l2Provider

    return await provider.getTransaction(claimMessageTxHash)
  }

  private async _isCheckpointed (txHash: string, networkId: number): Promise<boolean> {
    if (networkId === 0) {
      return this.zkEvmClient.isDepositClaimable(txHash)
    } else if (networkId === 1) {
      return this.zkEvmClient.isWithdrawExitable(txHash)
    } else {
      throw new Error('invalid networkId')
    }
  }
}
export default PolygonZkBridge
