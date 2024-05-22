import { FinalityBlockTag } from '#chains/IChainBridge.js'
import { FinalityStrategy } from '../FinalityStrategy.js'
import type { IFinalityStrategy } from '../IFinalityStrategy.js'

export class OptimismStrategy extends FinalityStrategy implements IFinalityStrategy {
  override getSafeBlockNumber = async (): Promise<number> => {
    const blockNumber = await this._getCustomBlockNumber(FinalityBlockTag.Safe)
    if (blockNumber) {
      return blockNumber
    }

    // Optimism's safe can be reorged, so we must use finalized block number as the safe block number if
    // the custom implementation is not available.
    return this.getFinalizedBlockNumber()
  }
}
