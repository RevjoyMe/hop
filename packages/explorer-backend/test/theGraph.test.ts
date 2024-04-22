import { fetchTransferFromL1Completeds, fetchCctpTransferSents, fetchCctpTransferSentsByTransferIds, fetchCctpTransferSentsForTxHash, fetchCctpMessageReceivedsByTxHashes, fetchCctpMessageReceivedsByTransferIds } from '../src/theGraph'

// run with:
// NETWORK=goerli ts-node test/theGraph.test.ts

async function testFetchTransferFromL1Completeds () {
  const chain = 'linea'
  const startTime = 1684284720
  const endTime = 1684306320
  const events = await fetchTransferFromL1Completeds(chain, startTime, endTime)
  console.log(events.length)
  console.log('done')
}

async function testFetchCctpTransferSents () {
  const chain = 'polygon'
  const startTime = 1710184488
  const endTime = 1710186191
  const events = await fetchCctpTransferSents(chain, startTime, endTime)
  console.log(events.length)
  console.log('done')
}

async function testFetchCctpTransferSentsForTxHash () {
  const chain = 'polygon'
  const txHash = '0x229c4546521c3570a0d535041a11ff88460aeaa70ffda42a18cf83153b1d366b'
  const events = await fetchCctpTransferSentsForTxHash(chain, txHash)
  console.log(events.length)
  console.log('done')
}

async function testFetchCctpMessageReceivedsByTxHashes () {
  const chain = 'polygon'
  const txHashes: any[] = []
  const events = await fetchCctpMessageReceivedsByTxHashes(chain, txHashes)
  console.log(events.length)
  console.log('done')
}

async function testFetchCctpMessageReceivedsByTransferIds () {
  const chain = 'base'
  const transferIds : any[] = ['44714', '123']
  const events = await fetchCctpMessageReceivedsByTransferIds(chain, transferIds)
  console.log(events.length)
  console.log('done')
}

async function testFetchCctpTransferSentsByTransferIds () {
  const chain = 'polygon'
  const transferIds : any[] = ['44012', '44073', '123']
  const events = await fetchCctpTransferSentsByTransferIds(chain, transferIds)
  console.log(events.length)
  console.log('done')
}

async function main () {
  // await testFetchTransferFromL1Completeds()
  // await testFetchCctpTransferSentsForTxHash()
  // await testFetchCctpMessageReceivedsByTxHashes()
  // await testFetchCctpMessageReceivedsByTransferIds()
  // await testFetchCctpTransferSents()
  // await testFetchCctpMessageReceiveds()
  // await testFetchCctpTransferSentsByTransferIds()
}

main().catch(console.error)
