import { BigNumber, utils } from 'ethers'
import { DateTime } from 'luxon'
import { PriceFeed } from './PriceFeed.js'
import { db } from './Db.js'
import { enabledChains, enabledTokens } from './config.js'
import { getSubgraphUrl } from './utils/getSubgraphUrl.js'
import { getTokenDecimals } from './utils/getTokenDecimals.js'
import { mainnet as mainnetAddresses } from '@hop-protocol/sdk/addresses'
import { nearestDate } from './utils/nearestDate.js'
import { queryFetch } from './utils/queryFetch.js'

type Options = {
  regenesis?: boolean
  days?: number
  offsetDays?: number
  tokens?: string[]
  chains?: string[]
}

export class AmmStats {
  db = db
  regenesis: boolean = false
  days: number = 1
  offsetDays: number = 0
  priceFeed: PriceFeed
  tokens: string[] = enabledTokens
  chains: string[] = enabledChains

  constructor (options: Options = {}) {
    if (options.regenesis) {
      this.regenesis = options.regenesis
    }
    if (options.days) {
      this.days = options.days
    }
    if (options.offsetDays) {
      this.offsetDays = options.offsetDays
    }
    if (options.tokens) {
      this.tokens = options.tokens
    }
    if (options.chains) {
      this.chains = options.chains
    }

    this.priceFeed = new PriceFeed()
  }

  async fetchTokenSwaps (
    chain: string,
    token: string,
    startDate: number,
    endDate: number,
    lastId = '0'
  ) {
    const query = `
      query TokenSwaps($token: String, $startDate: Int, $endDate: Int, $lastId: ID) {
        tokenSwaps(
          where: {
            token: $token,
            id_gt: $lastId,
            timestamp_gte: $startDate,
            timestamp_lt: $endDate
          },
          orderBy: id,
          orderDirection: asc,
          first: 1000
        ) {
          id
          timestamp
          token
          tokensSold
        }
      }
    `
    const url = getSubgraphUrl(chain)
    let data
    try {
      data = await queryFetch(url, query, {
        token,
        startDate,
        endDate,
        lastId
      })
    } catch (err) {
      console.log('caught err', err.message, 'trying again')
      data = await queryFetch(url, query, {
        token,
        startDate,
        endDate,
        lastId
      })
    }

    if (!data) {
      return []
    }

    const items = data.tokenSwaps

    try {
      if (items.length === 1000) {
        lastId = items[items.length - 1].id
        items.push(
          ...(await this.fetchTokenSwaps(
            chain,
            token,
            startDate,
            endDate,
            lastId
          ))
        )
      }
    } catch (err) {
      console.error(err)
    }

    return items
  }

  async trackAmm () {
    const daysN = 365
    console.log('fetching prices')

    const prices: Record<string, any> = {}

    for (const token of this.tokens) {
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

    let totalFeesUsd = 0

    for (let i = 0; i < this.days; i++) {
      const now = DateTime.utc()
      const startDate = now.minus({ day: i + this.offsetDays }).startOf('day')
      const endDate = startDate.endOf('day')
      const startDateUnix = Math.floor(startDate.toSeconds())
      const endDateUnix = Math.floor(endDate.toSeconds())

      for (const token of this.tokens) {
        for (const chain of this.chains) {
          const config = (mainnetAddresses as any).bridges?.[token]?.[chain]
          if (!config) {
            continue
          }

          try {
            const tokenDecimals = getTokenDecimals(token)
            console.log('fetching token swaps', chain, token, i)
            const events = await this.fetchTokenSwaps(
              chain,
              token,
              startDateUnix,
              endDateUnix
            )
            let volume = BigNumber.from(0)
            for (const event of events) {
              const amount = BigNumber.from(event.tokensSold)
              volume = volume.add(amount)
            }
            const volumeFormatted = Number(
              utils.formatUnits(volume, tokenDecimals)
            )

            const oneToken = utils.parseUnits('1', tokenDecimals)
            // TODO: This is a temporary solution. Should retrieve from onchain and cache value.
            const isLowLpFeeChain = ['polygonzk', 'nova'].includes(chain)
            const lpFee: string = isLowLpFeeChain ? '1' : '4'
            const lpFeeBN = utils.parseUnits(lpFee, tokenDecimals)
            const fees = volume
              .mul(lpFeeBN)
              .div(oneToken)
              .div(10000)

            const feesFormatted = Number(utils.formatUnits(fees, tokenDecimals))

            if (!prices[token]) {
              console.log('price not found', token)
              return
            }

            const dates = prices[token].reverse().map((x: any) => x[0])
            const nearest = nearestDate(dates, startDateUnix)
            const price = prices[token][nearest][1]

            const volumeFormattedUsd = price * volumeFormatted
            const feesFormattedUsd = price * feesFormatted
            console.log(
              startDate.toISO(),
              startDateUnix,
              chain,
              token,
              'events',
              events.length,
              'volume',
              volumeFormatted,
              'volume usd',
              volumeFormattedUsd,
              'fees',
              feesFormatted,
              'fees usd',
              feesFormattedUsd
            )

            totalFeesUsd += feesFormattedUsd

            try {
              console.log('upserting amm stat', chain, token, i)
              await this.db.upsertAmmStat(
                chain,
                token,
                volumeFormatted,
                volumeFormattedUsd,
                feesFormatted,
                feesFormattedUsd,
                startDateUnix
              )
            } catch (err) {
              if (!err.message.includes('UNIQUE constraint failed')) {
                console.log('error', chain, token)
                throw err
              }
              console.error(err)
            }
            console.log(
              `done fetching amm daily volume stats, chain: ${chain}, token: ${token}`
            )
          } catch (err) {
            console.error('amm stats error:', err)
          }
        }
      }
    }

    console.log('totalFeesUsd', totalFeesUsd)
  }
}
