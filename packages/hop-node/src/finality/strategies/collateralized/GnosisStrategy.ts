import { FinalityStrategy } from '../FinalityStrategy.js'
import type { IFinalityStrategy } from '../IFinalityStrategy.js'

export class GnosisStrategy extends FinalityStrategy implements IFinalityStrategy {
  getCustomBlockNumber = async (): Promise<number> => {
    const confirmations = 6
    return this.getProbabilisticBlockNumber(confirmations)
  }
}
