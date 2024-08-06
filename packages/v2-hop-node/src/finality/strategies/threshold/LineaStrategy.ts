import { FinalityStrategy } from '../FinalityStrategy.js'
import type { IFinalityStrategy } from '../IFinalityStrategy.js'

export class LineaStrategy extends FinalityStrategy implements IFinalityStrategy {
  override getSafeBlockNumber = async (): Promise<number> => {
    const confirmations = 25
    return this.getProbabilisticBlockNumber(confirmations)
  }

  override getFinalizedBlockNumber = async (): Promise<number> => {
    const confirmations = 50
    return this.getProbabilisticBlockNumber(confirmations)
  }

  getCustomBlockNumber = async (): Promise<number> => {
    const confirmations = 10
    return this.getProbabilisticBlockNumber(confirmations)
  }
}
