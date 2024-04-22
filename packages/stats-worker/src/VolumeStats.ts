import { DateTime } from 'luxon'
import { PriceFeed } from './PriceFeed.js'
import { db } from './Db.js'
import { enabledChains, enabledTokens } from './config.js'
import { utils } from 'ethers'
import { getSubgraphUrl } from './utils/getSubgraphUrl.js'
import { getTokenDecimals } from './utils/getTokenDecimals.js'
import { nearestDate } from './utils/nearestDate.js'
import { queryFetch } from './utils/queryFetch.js'

type Options = {
  regenesis?: boolean
  days?: number
}

class VolumeStats {
  db = db
  regenesis: boolean = false
  priceFeed: PriceFeed

  constructor (options: Options = {}) {
    if (options.regenesis) {
      this.regenesis = options.regenesis
    }

    this.priceFeed = new PriceFeed()
  }

  async fetchDailyVolume (chain: string, startDate: number) {
    const query = `
      query DailyVolume($startDate: Int, $endDate: Int) {
        dailyVolumes(
          where: {
            date_gte: $startDate,
          },
          orderBy: date,
          orderDirection: desc,
          first: 1000
        ) {
          id
          amount
          date
          token
        }
      }
    `
    const url = getSubgraphUrl(chain)
    let data
    try {
      data = await queryFetch(url, query, {
        startDate
      })
    } catch (err) {
      console.log('caught err', err.message, 'trying again')
      data = await queryFetch(url, query, {
        startDate
      })
    }

    if (!data) {
      return []
    }

    const items = data.dailyVolumes

    try {
      if (items.length === 1000) {
        startDate = items[0].date
        items.push(...(await this.fetchDailyVolume(chain, startDate)))
      }
    } catch (err) {
      console.error(err)
    }

    return items
  }

  async trackDailyVolume () {
    const daysN = 365
    console.log('fetching prices')

    const prices: Record<string, any> = {}

    for (const token of enabledTokens) {
      prices[token] = await this.priceFeed.getPriceHistory(token, daysN)
    }

    console.log('done fetching prices')

    console.log('upserting prices')
    for (const token in prices) {
      for (const data of prices[token]) {
        const price = data[1]
        const timestamp = data[0]
        try {
          this.db.upsertPrice(token, price, timestamp)
        } catch (err) {
          if (!err.message.includes('UNIQUE constraint failed')) {
            throw err
          }
        }
      }
    }
    console.log('done upserting prices')

    let chains = enabledChains
    if (this.regenesis) {
      chains = ['optimism']
    }

    const now = Math.floor(DateTime.utc().toSeconds())

    for (const chain of chains) {
      const startDate = now - (daysN - 1) * 24 * 60 * 60

      console.log(`fetching daily volume stats, chain: ${chain}`)
      const items = await this.fetchDailyVolume(chain, startDate)
      for (const item of items) {
        const amount = item.amount
        const timestamp = item.date
        const token = item.token
        const decimals = getTokenDecimals(token)
        const formattedAmount = Number(utils.formatUnits(amount, decimals))
        if (!prices[token]) {
          console.log('not found', token)
          return
        }

        const dates = prices[token].reverse().map((x: any) => x[0])
        const nearest = nearestDate(dates, timestamp)
        const price = prices[token][nearest][1]

        const usdAmount = price * formattedAmount
        try {
          this.db.upsertVolumeStat(
            chain === 'ethereum' ? 'mainnet' : chain, // backwards compatibility name
            token,
            formattedAmount,
            usdAmount,
            timestamp
          )
        } catch (err) {
          if (!err.message.includes('UNIQUE constraint failed')) {
            console.log('error', chain, item.token)
            throw err
          }
        }
      }
      console.log(`done fetching daily volume stats, chain: ${chain}`)
    }
  }
}

export default VolumeStats
