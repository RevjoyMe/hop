import { constants, providers, utils } from 'ethers'
import { Multicall3__factory } from '#contracts/index.js'
import { PriceFeedFromS3 } from '#priceFeed/index.js'
import { ERC20__factory } from '#contracts/index.js'
import { getTokenDecimals } from '#utils/index.js'
import { sdkConfig } from '#config/index.js'

export type Config = {
  network: string
  accountAddress?: string
}

export type MulticallBalance = {
  tokenSymbol: string
  address: string
  chainSlug: string
  balance?: string
  balanceFormatted?: string
  balanceUsd?: string
  tokenPrice?: string
  error?: string
}

export type TokenAddress = {
  tokenSymbol: string
  address: string
}

export type GetMulticallBalanceOptions = {
  abi?: any
  method?: string
  address?: string
  tokenSymbol?: string
  tokenDecimals?: number
}

export type MulticallOptions = {
  address: string
  abi: Array<any>
  method: string
  args: Array<any>
}

export class Multicall {
  network: string
  accountAddress?: string
  priceFeed: PriceFeedFromS3

  constructor (config: Config) {
    if (!config) {
      throw new Error('config is required')
    }
    if (!config.network) {
      throw new Error('config.network is required')
    }
    this.network = config.network
    this.accountAddress = config.accountAddress
    this.priceFeed = new PriceFeedFromS3()
  }

  getMulticallAddressForChain (chainSlug: string): string | null {
    const address = sdkConfig[this.network].chains?.[chainSlug]?.multicall
    if (!address) {
      return null
    }
    return address
  }

  getProvider (chainSlug: string): providers.Provider {
    const rpcUrl = sdkConfig[this.network].chains?.[chainSlug]?.rpcUrl
    if (!rpcUrl) {
      throw new Error(`rpcUrl not found for chain ${chainSlug}`)
    }
    const provider = new providers.JsonRpcProvider(rpcUrl)
    return provider
  }

  getChains (): string[] {
    const chains = Object.keys(sdkConfig[this.network].chains)
    return chains
  }

  getTokenAddressesForChain (chainSlug: string): TokenAddress[] {
    const tokenConfigs = sdkConfig[this.network]?.addresses
    const addresses : TokenAddress[] = []
    for (const tokenSymbol in tokenConfigs) {
      const chainConfig = tokenConfigs[tokenSymbol]?.[chainSlug]
      if (!chainConfig) {
        continue
      }
      const address = chainConfig?.l2CanonicalToken ?? chainConfig?.l1CanonicalToken
      if (!address) {
        throw new Error(`canonicalToken not found for chain ${chainSlug}`)
      }
      if (address === constants.AddressZero) {
        continue
      }
      addresses.push({
        tokenSymbol,
        address
      })
    }
    return addresses
  }

  async getBalances ():Promise<MulticallBalance[]> {
    const chains = this.getChains()
    const promises: Promise<any>[] = []
    for (const chain of chains) {
      promises.push(this.getBalancesForChain(chain))
    }
    const balances = await Promise.all(promises)
    return balances.flat()
  }

  async multicall (chainSlug: string, options: MulticallOptions[]): Promise<Array<any>> {
    const provider = this.getProvider(chainSlug)
    const multicallAddress = this.getMulticallAddressForChain(chainSlug)
    const calls = options.map(({ address, abi, method, args }: any) => {
      const contractInterface = new utils.Interface(abi)
      const calldata = contractInterface.encodeFunctionData(method, args)
      return {
        target: address,
        allowFailure: false,
        callData: calldata
      }
    })

    let results : any
    if (multicallAddress) {
      const multicallContract = Multicall3__factory.connect(multicallAddress, provider)
      results = await multicallContract.callStatic.aggregate3(calls)
    } else {
      results = await Promise.all(calls.map(async ({ target, callData }: any) => {
        const result = await provider.call({ to: target, data: callData })
        return result
      }))
    }

    const parsed = results.map((data: any, index: number) => {
      let returnData = data
      if (multicallAddress) {
        returnData = data.returnData
      }
      const { abi, method } = options[index]
      const contractInterface = new utils.Interface(abi)
      for (const key in contractInterface.functions) {
        const _method = key.split('(')[0]
        if (_method === method) {
          const returnTypes = contractInterface?.functions[key]?.outputs?.map((output: any) => output.type)
          const returnValues = utils.defaultAbiCoder.decode(returnTypes!, returnData)
          return returnValues
        }
      }

      return null
    })

    return parsed
  }

  async getBalancesForChain (chainSlug: string, opts?: GetMulticallBalanceOptions[]): Promise<MulticallBalance[]> {
    if (!this.accountAddress) {
      throw new Error('config.accountAddress is required')
    }
    const provider = this.getProvider(chainSlug)
    const multicallAddress = this.getMulticallAddressForChain(chainSlug)
    const tokenAddresses : GetMulticallBalanceOptions[] | TokenAddress = Array.isArray(opts) ? opts : this.getTokenAddressesForChain(chainSlug)

    const calls = await Promise.all(tokenAddresses.map(async ({ address, method }: GetMulticallBalanceOptions) => {
      const tokenContract = ERC20__factory.connect(address!, provider)
      const balanceTx = await tokenContract.populateTransaction.balanceOf(this.accountAddress!)
      return {
        target: address!,
        allowFailure: false,
        callData: balanceTx.data!
      }
    }))

    let results: any
    if (multicallAddress) {
      const multicallContract = Multicall3__factory.connect(multicallAddress, provider)
      results = await multicallContract.callStatic.aggregate3(calls)
    } else {
      results = await Promise.all(calls.map(async ({ target, callData }: any) => {
        const result = await provider.call({ to: target, data: callData })
        return result
      }))
    }

    const balancePromises = results.map(async (data: any, index: number) => {
      let returnData = data
      if (multicallAddress) {
        returnData = data.returnData
      }
      const { tokenSymbol, address, tokenDecimals } = tokenAddresses[index]
      try {
        const balance = utils.defaultAbiCoder.decode(['uint256'], returnData)[0]
        const _tokenDecimals = tokenDecimals ?? getTokenDecimals(tokenSymbol!)
        const balanceFormatted = Number(utils.formatUnits(balance, _tokenDecimals))
        const tokenPrice = opts ? null : await this.priceFeed.getPriceByTokenSymbol(tokenSymbol!) // don't fetch usd price if using custom abi
        const balanceUsd = tokenPrice ? balanceFormatted * tokenPrice : null
        return {
          tokenSymbol,
          address,
          chainSlug,
          balance,
          balanceFormatted,
          balanceUsd,
          tokenPrice
        }
      } catch (err: any) {
        return {
          tokenSymbol,
          address,
          chainSlug,
          error: err.message
        }
      }
    })

    const balances = await Promise.all(balancePromises)

    return balances
  }
}
