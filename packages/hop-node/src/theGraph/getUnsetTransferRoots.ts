import getTransferRootBonded from './getTransferRootBonded.js'
import getTransferRootConfirmed from './getTransferRootConfirmed.js'
import getTransferRootSet from './getTransferRootSet.js'
import { ChainSlug } from '@hop-protocol/sdk'
import { getAllChains } from '#config/index.js'

export default async function getUnsetTransferRoots (startDate: number, endDate: number, token: string = '') {
  const transferRoots: Record<string, any> = {}
  console.log('fetching bonded roots', ChainSlug.Ethereum, startDate, endDate)
  let items = await getTransferRootBonded(ChainSlug.Ethereum, token, startDate, endDate)
  for (const item of items) {
    transferRoots[item.root] = { ...item, rootHash: item.root, totalAmount: item.amount }
  }

  console.log('fetching confirmed roots', ChainSlug.Ethereum, startDate, endDate)
  items = await getTransferRootConfirmed(ChainSlug.Ethereum, token, startDate, endDate)
  for (const item of items) {
    transferRoots[item.rootHash] = item
  }

  const setTransferRoots: Record<string, any> = {}
  const chains = getAllChains()
  const transferRootHashes = Object.values(transferRoots).map((x: any) => x.transferRootHash)
  for (const chain of chains) {
    console.log('fetching transferRootSets', chain, transferRootHashes.length)
    const items = await getTransferRootSet(chain, token)
    for (const item of items) {
      setTransferRoots[item.rootHash] = item
    }
  }
  const unsetTransferRoots: Record<string, any> = {}
  for (const transferRootHash in transferRoots) {
    if (!setTransferRoots[transferRootHash]) {
      unsetTransferRoots[transferRootHash] = transferRoots[transferRootHash]
    }
  }
  return Object.values(unsetTransferRoots)
}
