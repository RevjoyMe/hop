import { Base } from '../Base.js'
import { Config } from './BaseWatcher.js'
import { EventEmitter } from 'eventemitter3'
import { L1ToL2Watcher } from './L1ToL2Watcher.js'
import { L2ToL1Watcher } from './L2ToL1Watcher.js'
import { L2ToL2Watcher } from './L2ToL2Watcher.js'

export class Watcher extends Base {
  watcher: L1ToL2Watcher | L2ToL1Watcher | L2ToL2Watcher

  constructor (config: Config) {
    super(config.network, config.signer, config.chainProviders)
    let { sourceChain, destinationChain } = config
    sourceChain = this.toChainModel(sourceChain)
    destinationChain = this.toChainModel(destinationChain)

    // L1 -> L2
    if (sourceChain.isL1) {
      this.watcher = new L1ToL2Watcher(config)
    }

    // L2 -> L1
    if (!sourceChain.isL1 && destinationChain?.isL1) {
      this.watcher = new L2ToL1Watcher(config)
    }

    // L2 -> L2
    if (!sourceChain.isL1 && !destinationChain?.isL1) {
      this.watcher = new L2ToL2Watcher(config)
    }
  }

  watch (): EventEmitter {
    if (!this.watcher) {
      throw new Error('not implemented')
    }

    return this.watcher.watch()
  }
}
