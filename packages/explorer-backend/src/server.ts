import cors from 'cors'
import express from 'express'
import minimist from 'minimist'
import path from 'path'
import { Controller } from './controller'
import { ipRateLimitMiddleware } from './rateLimit'
import { port } from './config'
import { responseCache } from './responseCache'

const app = express()
const controller = new Controller()

app.enable('trust proxy')
app.use(cors())
app.use(express.json({ limit: '500kb' }))
app.use(express.urlencoded({ extended: false, limit: '500kb', parameterLimit: 50 }))
app.use(ipRateLimitMiddleware)

app.use('/static', express.static('static'))

app.get('/', (req: any, res: any) => {
  res.status(404).json({ error: 'not found' })
})

app.get('/health', (req: any, res: any) => {
  res.status(200).json({ status: 'ok' })
})

app.get('/v1/transfers', responseCache, async (req: any, res: any) => {
  try {
    const {
      page,
      perPage,
      source: sourceChainSlug,
      destination: destinationChainSlug,
      bonded,
      bonder: bonderAddress,
      account: accountAddress,
      recipient: recipientAddress,
      amount: amountFormatted,
      amountCmp: amountFormattedCmp,
      amountUsd,
      amountUsdCmp,
      bonderFeeUsd,
      bonderFeeUsdCmp,
      transferId,
      startDate,
      endDate,
      startTimestamp,
      endTimestamp,
      sortBy,
      sortDirection,
      receivedHTokens,
      countOnly,
      refresh,
      integrationPartner
    } = req.query
    let { token } = req.query
    if (token === 'USDC.e') {
      token = 'USDC'
    }

    const data = await controller.getTransfers({
      page,
      perPage,
      sourceChainSlug,
      destinationChainSlug,
      token,
      bonded,
      bonderAddress,
      accountAddress,
      recipientAddress,
      amountFormatted,
      amountFormattedCmp,
      amountUsd,
      amountUsdCmp,
      bonderFeeUsd,
      bonderFeeUsdCmp,
      transferId,
      startDate,
      endDate,
      startTimestamp,
      endTimestamp,
      sortBy,
      sortDirection,
      receivedHTokens,
      countOnly,
      refresh,
      integrationPartner
    })
    res.status(200).json({ status: 'ok', data })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/v1/transfers/count', responseCache, async (req: any, res: any) => {
  try {
    const {
      source: sourceChainSlug,
      destination: destinationChainSlug,
      bonded,
      bonder: bonderAddress,
      account: accountAddress,
      recipient: recipientAddress,
      amount: amountFormatted,
      amountCmp: amountFormattedCmp,
      amountUsd,
      amountUsdCmp,
      bonderFeeUsd,
      bonderFeeUsdCmp,
      transferId,
      startDate,
      endDate,
      receivedHTokens
    } = req.query
    let { token } = req.query
    if (token === 'USDC.e') {
      token = 'USDC'
    }
    const data = await controller.getTransfers({
      sourceChainSlug,
      destinationChainSlug,
      token,
      bonded,
      bonderAddress,
      accountAddress,
      recipientAddress,
      amountFormatted,
      amountFormattedCmp,
      amountUsd,
      amountUsdCmp,
      bonderFeeUsd,
      bonderFeeUsdCmp,
      transferId,
      startDate,
      endDate,
      receivedHTokens,
      countOnly: true
    })
    res.status(200).json({ status: 'ok', data })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/v1/accounts', responseCache, async (req: any, res: any) => {
  try {
    const {
      page,
      perPage,
      source: sourceChainSlug,
      destination: destinationChainSlug,
      bonded,
      bonder: bonderAddress,
      account: accountAddress,
      recipient: recipientAddress,
      amount: amountFormatted,
      amountCmp: amountFormattedCmp,
      amountUsd,
      amountUsdCmp,
      bonderFeeUsd,
      bonderFeeUsdCmp,
      transferId,
      startDate,
      endDate,
      startTimestamp,
      endTimestamp,
      sortBy,
      sortDirection,
      receivedHTokens,
      refresh,
      integrationPartner
    } = req.query
    let { token } = req.query
    if (token === 'USDC.e') {
      token = 'USDC'
    }
    const data = await controller.getTransfers({
      page,
      perPage,
      sourceChainSlug,
      destinationChainSlug,
      token,
      bonded,
      bonderAddress,
      accountAddress,
      recipientAddress,
      amountFormatted,
      amountFormattedCmp,
      amountUsd,
      amountUsdCmp,
      bonderFeeUsd,
      bonderFeeUsdCmp,
      transferId,
      startDate,
      endDate,
      startTimestamp,
      endTimestamp,
      sortBy,
      sortDirection,
      receivedHTokens,
      refresh,
      integrationPartner,
      accountsOnly: true
    })
    res.status(200).json({ status: 'ok', data })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/v1/transfers/timeStats', async (req, res) => {
  try {
    const { sourceChainSlug, destinationChainSlug } = req.query
    let { token } = req.query
    if (token === 'USDC.e') {
      token = 'USDC'
    }
    const data = await controller.getTransferTimes({ sourceChainSlug, destinationChainSlug, token })
    res.status(200).json({ status: 'ok', data })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/index', (req: any, res: any) => {
  res.sendFile(path.resolve(__dirname, '..', 'public/index.html'))
})

const argv = minimist(process.argv.slice(2))
console.debug('flags:', argv)

if (argv.worker) {
  controller.startWorker(argv)
}

const host = '0.0.0.0'
app.listen(port, host, () => {
  console.log(`Listening on port ${port}`)
})
