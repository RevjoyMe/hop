import { ArbitrumRelayerFee } from './ArbitrumRelayerFee'
import { BigNumber } from 'ethers'
import { Chain } from '../models'
import { LineaRelayerFee } from './LineaRelayerFee'

import { NetworkSlug } from '../constants'

const RelayerFees = {
  [Chain.Arbitrum.slug]: ArbitrumRelayerFee,
  [Chain.Nova.slug]: ArbitrumRelayerFee,
  [Chain.Linea.slug]: LineaRelayerFee
}

class RelayerFee extends AbstractRelayerFee {
  relayerFee: any

  constructor (network: string, chain: string, token: string) {
    super(network, chain, token)

    const relayerFeeConstructor: any | undefined = RelayerFees?.[chain]
    if (!relayerFeeConstructor) {
      throw new Error(`Relayer fee not implemented for network ${network}, chain ${chain}, token ${token}`)
    }
    this.relayerFee = new relayerFeeConstructor(network, chain, token)
  }

  async getRelayCost (): Promise<BigNumber> {
    return this.relayerFee.getRelayCost()
  }
}

export default RelayerFee
