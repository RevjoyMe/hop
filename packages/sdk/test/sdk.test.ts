import fs from 'fs'
import dotenv from 'dotenv'
import { BigNumber, Wallet, constants, providers, utils } from 'ethers'
import { Hop } from '#index.js'
import { addresses } from '#addresses/index.js'
import { Swap__factory } from '#contracts/index.js'
import { FallbackProvider } from '#provider/index.js'
import { promiseQueue, fetchJsonOrThrow } from '#utils/index.js'
import { TokenModel } from '#models/index.js'
import { ChainSlug, getSlugFromChainId, getChain } from '#chains/index.js'
// @ts-ignore
import pkg from '../package.json'

dotenv.config()

export const privateKey = process.env.PRIVATE_KEY

describe.skip('sdk setup', () => {
  const hop = new Hop('goerli')
  const signer = new Wallet(privateKey!)
  it('should return version', () => {
    expect(hop.version).toBe(pkg.version)
  })
})

describe.skip('hop bridge token transfers', () => {
  const hop = new Hop('goerli')
  const signer = new Wallet(privateKey!)
  it(
    'send token from L1 -> L2',
    async () => {
      const tokenAmount = utils.parseUnits('0.1', 18)
      const tx = await hop
        .connect(signer)
        .bridge(TokenModel.USDC)
        .send(tokenAmount, ChainSlug.Ethereum, ChainSlug.Optimism)

      console.log('tx hash:', tx?.hash)

      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'send token from L2 -> L2',
    async () => {
      const tokenAmount = utils.parseUnits('0.1', 18)
      const tx = await hop
        .connect(signer)
        .bridge(TokenModel.USDC)
        .send(tokenAmount, ChainSlug.Optimism, ChainSlug.Gnosis)

      console.log('tx hash:', tx?.hash)

      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'send token from L2 -> L1',
    async () => {
      const tokenAmount = utils.parseUnits('0.1', 18)
      const tx = await hop
        .connect(signer)
        .bridge(TokenModel.USDC)
        .send(tokenAmount, ChainSlug.Gnosis, ChainSlug.Ethereum)

      console.log('tx hash:', tx?.hash)

      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
})

describe.skip('tx watcher', () => {
  const hop = new Hop('mainnet')
  const signer = new Wallet(privateKey!)
  it.skip(
    'receive events on token transfer from L1 -> L2 (no swap)',
    async () => {
      const txHash =
        '0xb92c61e0a1e674eb4c9a52cc692c92709c8a4e4cb66fb22eb7cd9a958cf33a70'
      console.log('tx hash:', txHash)

      const res = await new Promise(resolve => {
        let sourceReceipt: any = null
        let destinationReceipt: any = null

        hop
          .watch(txHash, TokenModel.USDC, ChainSlug.Ethereum, ChainSlug.Polygon)
          .on('receipt', (data: any) => {
            const { receipt, chain } = data
            if (getSlugFromChainId(chain) === ChainSlug.Ethereum) {
              sourceReceipt = receipt
              console.log('got source transaction receipt')
            }
            if (getSlugFromChainId(chain) === ChainSlug.Polygon) {
              destinationReceipt = receipt
              console.log('got destination transaction receipt')
            }
            if (sourceReceipt && destinationReceipt) {
              resolve(true)
            }
          })
          .on('error', (err: Error) => {
            console.error(err)
            resolve(false)
          })
      })

      expect(res).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'receive events on token transfer from L1 -> L2 Gnosis (swap)',
    async () => {
      const txHash =
        '0xda9be66e99f9b668de873aeb7b82dc0d7870188862cbf86c52a00d7f61be0be4'
      console.log('tx hash:', txHash)

      console.log('waiting for receipts')

      const res = await new Promise(resolve => {
        let sourceReceipt: any = null
        let destinationReceipt: any = null

        hop
          .watch(txHash, TokenModel.USDC, ChainSlug.Ethereum, ChainSlug.Gnosis)
          .on('receipt', (data: any) => {
            const { receipt, chain } = data
            if (getSlugFromChainId(chain) === ChainSlug.Ethereum) {
              sourceReceipt = receipt
              console.log('got source transaction receipt')
            }
            if (getSlugFromChainId(chain) === ChainSlug.Gnosis) {
              destinationReceipt = receipt
              console.log('got destination transaction receipt')
            }
            if (sourceReceipt && destinationReceipt) {
              resolve(true)
            }
          })
          .on('error', (err: Error) => {
            console.error(err)
            resolve(false)
          })
      })

      expect(res).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'receive events on token transfer from L2 -> L2',
    async () => {
      const txHash = '0xf5d14a332d072de887bbe3dd058c8eb64f3aa754b7652f76179c230ab1391948'
      console.log('tx hash:', txHash)

      const res = await new Promise(resolve => {
        let sourceReceipt: any = null
        let destinationReceipt: any = null

        hop
          .watch(txHash, TokenModel.USDC, ChainSlug.Gnosis, ChainSlug.Optimism, false, {
            // destinationHeadBlockNumber: 5661102
          })
          .on('receipt', (data: any) => {
            const { receipt, chain } = data
            if (getSlugFromChainId(chain) === ChainSlug.Gnosis) {
              sourceReceipt = receipt
              console.log(
                'got source transaction receipt:',
                receipt.transactionHash
              )
            }
            if (getSlugFromChainId(chain) === ChainSlug.Optimism) {
              destinationReceipt = receipt
              console.log(
                'got destination transaction receipt:',
                receipt.transactionHash
              )
            }
            if (sourceReceipt && destinationReceipt) {
              resolve(true)
            }
          })
          .on('error', (err: Error) => {
            console.error(err)
            resolve(false)
          })
      })

      expect(res).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'receive events on token transfer from L2 -> L2 (Optimism -> Arbitrum)',
    async () => {
      const txHash = '0x0be35c18107c85f13b8c50bcb045c77a184115d24424daa48f5b76ea230a926e'
      console.log('tx hash:', txHash)

      const res = await new Promise(resolve => {
        let sourceReceipt: any = null
        let destinationReceipt: any = null

        hop
          .watch(txHash, TokenModel.ETH, ChainSlug.Optimism, ChainSlug.Arbitrum, false, {
            // destinationHeadBlockNumber: 5661102
          })
          .on('receipt', (data: any) => {
            const { receipt, chain } = data
            if (getSlugFromChainId(chain) === ChainSlug.Optimism) {
              sourceReceipt = receipt
              console.log(
                'got source transaction receipt:',
                receipt.transactionHash
              )
            }
            if (getSlugFromChainId(chain) === ChainSlug.Arbitrum) {
              destinationReceipt = receipt
              console.log(
                'got destination transaction receipt:',
                receipt.transactionHash
              )
            }
            if (sourceReceipt && destinationReceipt) {
              resolve(true)
            }
          })
          .on('error', (err: Error) => {
            console.error(err)
            resolve(false)
          })
      })

      expect(res).toBeTruthy()
    },
    20 * 60 * 1000
  )
  it(
    '(mainnet) receive events on token transfer from L2 Gnosis -> L2 Polygon',
    async () => {
      const txHash =
        '0x152348cfaf5344668191859ab95d858d31fd347f807c615e26e027b61fd976f3'

      const res = await new Promise(resolve => {
        let sourceReceipt: any = null
        let destinationReceipt: any = null

        hop
          .watch(txHash, TokenModel.USDC, ChainSlug.Gnosis, ChainSlug.Polygon, false, {
            // destinationHeadBlockNumber: 14779300 // estimate
          })
          .on('receipt', (data: any) => {
            const { receipt, chain } = data
            if (getSlugFromChainId(chain) === ChainSlug.Gnosis) {
              sourceReceipt = receipt
              console.log(
                'got source transaction receipt:',
                receipt.transactionHash
              )
              expect(sourceReceipt.transactionHash).toBe(
                '0x152348cfaf5344668191859ab95d858d31fd347f807c615e26e027b61fd976f3'
              )
            }
            if (getSlugFromChainId(chain) === ChainSlug.Polygon) {
              destinationReceipt = receipt
              console.log(
                'got destination transaction receipt:',
                receipt.transactionHash
              )
              expect(destinationReceipt.transactionHash).toBe(
                '0xfe413b4fdc86aa1c3e8092e4b0517ef4904a8bf16b1ff6519021ce2dd0b0cf8e'
              )
            }
            if (sourceReceipt && destinationReceipt) {
              resolve(true)
            }
          })
          .on('error', (err: Error) => {
            console.error(err)
            resolve(false)
          })
      })

      expect(res).toBeTruthy()
    },
    300 * 1000
  )
  it(
    'receive events on token transfer from L2 -> L1',
    async () => {
      const txHash = '0x6c9f8082a76ed7362cbd52ba93add0ba9e5b8af5c1a35d83378163dc30906f64'
      console.log('tx hash:', txHash)

      const res = await new Promise(resolve => {
        let sourceReceipt: any = null
        let destinationReceipt: any = null

        hop
          .watch(txHash, TokenModel.USDC, ChainSlug.Gnosis, ChainSlug.Ethereum)
          .on('receipt', (data: any) => {
            const { receipt, chain } = data
            if (getSlugFromChainId(chain) === ChainSlug.Gnosis) {
              sourceReceipt = receipt
              console.log('got source transaction receipt')
            }
            if (getSlugFromChainId(chain) === ChainSlug.Ethereum) {
              destinationReceipt = receipt
              console.log('got destination transaction receipt')
            }
            if (sourceReceipt && destinationReceipt) {
              resolve(true)
            }
          })
          .on('error', (err: Error) => {
            console.error(err)
            resolve(false)
          })
      })

      expect(res).toBeTruthy()
    },
    120 * 1000
  )
})

describe.skip('liqudity provider', () => {
  const hop = new Hop('goerli')
  const signer = new Wallet(privateKey!)
  it('should add liqudity on Gnosis', async () => {
    const bridge = hop.bridge(TokenModel.USDC)
    const tokenAmount = utils.parseUnits('0.1', 18)
    const amount0Desired = tokenAmount
    const amount1Desired = tokenAmount
    const tx = await bridge
      .connect(signer)
      .addLiquidity(amount0Desired, amount1Desired, ChainSlug.Gnosis)
    console.log('tx:', tx.hash)
    expect(tx.hash).toBeTruthy()
  })
  it('should remove liqudity on Gnosis', async () => {
    const bridge = hop.bridge(TokenModel.USDC)
    const liqudityTokenAmount = utils.parseUnits('0.1', 18)
    const tx = await bridge
      .connect(signer)
      .removeLiquidity(liqudityTokenAmount, ChainSlug.Gnosis)
    console.log('tx:', tx.hash)
    expect(tx.hash).toBeTruthy()
  })
})

describe.skip('custom addresses', () => {
  it('should set custom addresses', () => {
    const address = '0x1111111111111111111111111111111111111111'
    const newAddresses = Object.assign({}, addresses)
    newAddresses.mainnet.bridges.USDC!.gnosis!.l2CanonicalToken! = address

    const sdk = new Hop('mainnet')
    sdk.setConfigAddresses(newAddresses.mainnet)
    expect(sdk.getL2CanonicalTokenAddress('USDC', 'gnosis')).toBe(address)

    const bridge = sdk.bridge('USDC')
    expect(bridge.getL2CanonicalTokenAddress('USDC', 'gnosis')).toBe(address)
  })
})

describe.skip('approve addresses', () => {
  // const sdk = new Hop('mainnet')
  // const bridge = sdk.bridge('USDC')
  // it('get send approval address (L1 -> L2)', () => {
  //   const approvalAddress = bridge.getSendApprovalAddress(
  //     ChainSlug.Ethereum
  //   )
  //   const expectedAddress = addresses.mainnet.bridges['USDC.e']!.ethereum!.l1Bridge
  //   expect(approvalAddress).toBe(expectedAddress)
  // })
  // it('get send approval address (L2 -> L2)', () => {
  //   const approvalAddress = bridge.getSendApprovalAddress(
  //     ChainSlug.Polygon
  //   )
  //   const expectedAddress = addresses.mainnet.bridges['USDC.e']!.polygon!.l2AmmWrapper
  //   expect(approvalAddress).toBe(expectedAddress)
  // })
})

describe.skip('custom chain providers', () => {
  it('should set custom chain provider', () => {
    const sdk = new Hop('mainnet')
    const bridge = sdk.bridge('USDC')
    let provider = bridge.getChainProvider('polygon')
    const currentUrl = 'https://polygon-rpc.com'
    const newUrl = 'https://polygon-rpc2.com'
    expect(bridge.getProviderRpcUrl(provider)).toBe(currentUrl)
    const newProvider = new providers.StaticJsonRpcProvider(newUrl)
    sdk.setChainProvider('polygon', newProvider)
    provider = bridge.getChainProvider('polygon')
    expect(bridge.getProviderRpcUrl(provider)).toBe(newUrl)
  })
  it('should set multiple custom chain provider', () => {
    const sdk = new Hop('mainnet')
    const bridge = sdk.bridge('USDC')
    let polygonProvider = bridge.getChainProvider('polygon')
    let gnosisProvider = bridge.getChainProvider('gnosis')
    const currentPolygonUrl = 'https://polygon-rpc.com'
    const currentGnosisUrl = 'https://rpc.gnosis.gateway.fm'
    const newPolygonUrl = 'https://polygon-rpc2.com'
    const newGnosisUrl = 'https://rpc.gnosischain2.com'
    expect(bridge.getProviderRpcUrl(polygonProvider)).toBe(currentPolygonUrl)
    expect(bridge.getProviderRpcUrl(gnosisProvider)).toBe(currentGnosisUrl)
    sdk.setChainProviders({
      polygon: new providers.StaticJsonRpcProvider(newPolygonUrl),
      gnosis: new providers.StaticJsonRpcProvider(newGnosisUrl)
    })
    polygonProvider = bridge.getChainProvider('polygon')
    gnosisProvider = bridge.getChainProvider('gnosis')
    expect(bridge.getProviderRpcUrl(polygonProvider)).toBe(newPolygonUrl)
    expect(bridge.getProviderRpcUrl(gnosisProvider)).toBe(newGnosisUrl)
  })

  it('constructor chainProviders option', () => {
    const newPolygonUrl = 'https://polygon-rpc2.com'
    const newGnosisUrl = 'https://rpc.gnosischain2.com'
    const polygonProvider = new providers.StaticJsonRpcProvider(newPolygonUrl)
    const gnosisProvider = new providers.StaticJsonRpcProvider(newGnosisUrl)
    const sdk = new Hop({
      network: 'mainnet',
      chainProviders: {
        polygon: polygonProvider,
        gnosis: gnosisProvider
      }
    })
    const bridge = sdk.bridge('USDC')
    expect(bridge.getChainProvider('polygon')).toBe(polygonProvider)
    expect(bridge.getChainProvider('gnosis')).toBe(gnosisProvider)
  })
})

describe.skip('getSendData', () => {
  it.skip('available liquidity', async () => {
    const sdk = new Hop('mainnet')
    const bridge = sdk.bridge('USDC')
    const availableLiquidityBn = await bridge.getFrontendAvailableLiquidity(
      ChainSlug.Arbitrum,
      ChainSlug.Ethereum
    )
    const sendData = await bridge.getSendData(
      '1000000000',
      ChainSlug.Arbitrum,
      ChainSlug.Ethereum
    )
    const requiredLiquidity = Number(
      utils.formatUnits(sendData.requiredLiquidity.toString(), 6)
    )
    const availableLiquidity = Number(
      utils.formatUnits(availableLiquidityBn.toString(), 6)
    )
    expect(availableLiquidity).toBeGreaterThan(0)
    expect(requiredLiquidity).toBeGreaterThan(0)
    expect(availableLiquidity).toBeGreaterThan(requiredLiquidity)
  })
  it.skip('relayer fee', async () => {
    const sdk = new Hop('mainnet')
    const bridge = sdk.bridge('USDC')
    const amountIn = BigNumber.from('1000000')
    const sendData = await bridge.getSendData(
      amountIn,
      ChainSlug.Ethereum,
      ChainSlug.Arbitrum
    )
    const adjustedBonderFee = Number(
      utils.formatUnits(sendData.adjustedBonderFee.toString(), 6)
    )
    const adjustedDestinationTxFee = Number(
      utils.formatUnits(sendData.adjustedDestinationTxFee.toString(), 6)
    )
    const totalFee = Number(
      utils.formatUnits(sendData.totalFee.toString(), 6)
    )

    expect(adjustedBonderFee).toBe(0)
    expect(adjustedDestinationTxFee).toBe(0)
    expect(totalFee).toBeGreaterThan(0)
  })

  it(
    'getAmountOut - L2 -> L2',
    async () => {
      const hop = new Hop('mainnet')
      const signer = new Wallet(privateKey!)
      const tokenAmount = utils.parseUnits('1', 18)
      const amountOut = await hop
        .connect(signer)
        .bridge(TokenModel.USDC)
        .getAmountOut(tokenAmount, ChainSlug.Gnosis, ChainSlug.Optimism)

      expect(Number(utils.formatUnits(amountOut.toString(), 18))).toBeGreaterThan(0)
    },
    10 * 1000
  )

  it('getDestinationTransactionFee', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('ETH')
    const sourceChain = 'polygon'
    const destinationChain = 'optimism'
    const destinationTxFee = await bridge.getDestinationTransactionFee(sourceChain, destinationChain)
    console.log(destinationTxFee)
    expect(destinationTxFee.gt(0)).toBeTruthy()
  }, 10 * 1000)

  it('getDestinationTransactionFeeData', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('ETH')
    const sourceChain = 'polygon'
    const destinationChain = 'optimism'
    const result = await bridge.getDestinationTransactionFeeData(sourceChain, destinationChain)
    const { destinationTxFee, rate, chainNativeTokenPrice, tokenPrice, destinationChainGasPrice } = result
    console.log(result)
    expect(destinationTxFee.gt(0)).toBeTruthy()
    expect(rate > 0 && rate < 2).toBeTruthy()
    expect(chainNativeTokenPrice > 0 && chainNativeTokenPrice < 10000).toBeTruthy()
    expect(tokenPrice > 0 && tokenPrice < 10000).toBeTruthy()
    expect(destinationChainGasPrice.gt(0)).toBeTruthy()
  }, 10 * 1000)

  it.skip('getSendData', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('ETH')
    const amountIn = utils.parseUnits('0.5', 18)
    const sourceChain = 'polygon'
    const destinationChain = 'optimism'
    const result = await bridge.getSendData(amountIn, sourceChain, destinationChain)
    const {
      amountOut,
      rate,
      priceImpact,
      requiredLiquidity,
      lpFees,
      bonderFeeRelative,
      adjustedBonderFee,
      destinationTxFee,
      adjustedDestinationTxFee,
      totalFee,
      estimatedReceived,
      feeBps,
      lpFeeBps,
      tokenPriceRate,
      chainNativeTokenPrice,
      tokenPrice,
      destinationChainGasPrice,
      isLiquidityAvailable
    } = result
    console.log(result)
    expect(amountOut.gt(0)).toBeTruthy()
    expect(rate > 0 && rate < 2).toBeTruthy()
    expect(priceImpact >= -100 && priceImpact <= 100).toBeTruthy()
    expect(requiredLiquidity.gt(0)).toBeTruthy()
    expect(lpFees.gt(0)).toBeTruthy()
    expect(bonderFeeRelative.gt(0)).toBeTruthy()
    expect(adjustedBonderFee.gt(0)).toBeTruthy()
    expect(destinationTxFee.gt(0)).toBeTruthy()
    expect(adjustedDestinationTxFee.gt(0)).toBeTruthy()
    expect(totalFee.gt(0)).toBeTruthy()
    expect(estimatedReceived.gt(0)).toBeTruthy()
    expect(feeBps > 0).toBeTruthy()
    expect(lpFeeBps > 0).toBeTruthy()
    expect(tokenPriceRate > 0 && tokenPriceRate < 2).toBeTruthy()
    expect(chainNativeTokenPrice > 0 && chainNativeTokenPrice < 10000).toBeTruthy()
    expect(tokenPrice > 0 && tokenPrice < 10000).toBeTruthy()
    expect(destinationChainGasPrice.gt(0)).toBeTruthy()
    expect(typeof isLiquidityAvailable).toBe('boolean')
  }, 10 * 1000)
})

describe.skip('getSendDataAmountOutMins', () => {
  it('getSendDataAmountOutMins l1->l2', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const amountIn = utils.parseUnits('10', 6)
    const getSendData = await bridge.getSendData(amountIn, 'ethereum', 'arbitrum')
    expect(getSendData).toBeTruthy()
    const slippageTolerance = 0.5
    const { amount, amountOutMin, destinationAmountOutMin, deadline, destinationDeadline } = bridge.getSendDataAmountOutMins(getSendData, slippageTolerance)
    console.log('slippageTolerance:', slippageTolerance)
    console.log('amount:', utils.formatUnits(amount, 6))
    console.log('amountOutMin:', utils.formatUnits(amountOutMin, 6))
    console.log('destinationAmountOutMin:', destinationAmountOutMin)
    console.log('deadline:', deadline)
    console.log('destinationDeadline:', destinationDeadline)
    expect(amount.toString()).toBe(amountIn.toString())
    expect(amountOutMin.gt(utils.parseUnits('9', 6))).toBe(true)
    expect(amountOutMin.lt(utils.parseUnits('11', 6))).toBe(true)
    expect(deadline > 0).toBe(true)
    expect(destinationAmountOutMin).toBe(null)
    expect(destinationDeadline).toBe(null)
  })
  it('getSendDataAmountOutMins l2->l1', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const amountIn = utils.parseUnits('100', 6)
    const getSendData = await bridge.getSendData(amountIn, 'arbitrum', 'ethereum')
    expect(getSendData).toBeTruthy()
    const slippageTolerance = 0.5
    const { amount, amountOutMin, destinationAmountOutMin, deadline, destinationDeadline } = bridge.getSendDataAmountOutMins(getSendData, slippageTolerance)
    console.log('slippageTolerance:', slippageTolerance)
    console.log('amount:', utils.formatUnits(amount, 6))
    console.log('amountOutMin:', utils.formatUnits(amountOutMin, 6))
    console.log('destinationAmountOutMin:', utils.formatUnits(destinationAmountOutMin ?? 0, 6))
    console.log('deadline:', deadline)
    console.log('destinationDeadline:', destinationDeadline)
    expect(amount.toString()).toBe(amountIn.toString())
    expect(amountOutMin.gt(utils.parseUnits('50', 6))).toBe(true)
    expect(amountOutMin.lt(utils.parseUnits('110', 6))).toBe(true)
    expect(deadline > 0).toBe(true)
    expect((destinationAmountOutMin ?? 0).toString()).toBe('0')
    expect(destinationDeadline).toBe(0)
  })
  it('getSendDataAmountOutMins l2->l2', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const amountIn = utils.parseUnits('10', 6)
    const getSendData = await bridge.getSendData(amountIn, 'arbitrum', 'optimism')
    expect(getSendData).toBeTruthy()
    const slippageTolerance = 0.5
    const { amount, amountOutMin, destinationAmountOutMin, deadline, destinationDeadline } = bridge.getSendDataAmountOutMins(getSendData, slippageTolerance)
    console.log('slippageTolerance:', slippageTolerance)
    console.log('amount:', utils.formatUnits(amount, 6))
    console.log('amountOutMin:', utils.formatUnits(amountOutMin, 6))
    console.log('destinationAmountOutMin:', utils.formatUnits(destinationAmountOutMin ?? 0, 6))
    console.log('deadline:', deadline)
    console.log('destinationDeadline:', destinationDeadline)
    expect(amount.toString()).toBe(amountIn.toString())
    expect(amountOutMin.gt(utils.parseUnits('8', 6))).toBe(true)
    expect(amountOutMin.lt(utils.parseUnits('11', 6))).toBe(true)
    expect(deadline > 0).toBe(true)
    expect((destinationAmountOutMin ?? BigNumber.from(0)).gt(utils.parseUnits('8', 6))).toBe(true)
    expect((destinationAmountOutMin ?? BigNumber.from(0)).lt(utils.parseUnits('11', 6))).toBe(true)
    expect((destinationDeadline ?? 0) > 0).toBe(true)
  })
})

describe('supported assets', () => {
  it('should return list of supported assets per chain', () => {
    const hop = new Hop('mainnet')
    const assets = hop.getSupportedAssets()
    console.log(assets)
    expect(assets).toBeTruthy()
  })
  it('should check if asset is supported on chain', () => {
    const network = 'mainnet'
    const hop = new Hop(network)
    const bridge = hop.bridge('SNX')
    expect(bridge.isSupportedAsset('polygon')).toBe(false)
    expect(bridge.isSupportedAsset(getChain(network, 'polygon'))).toBe(false)
    expect(bridge.isSupportedAsset('optimism')).toBe(true)
    expect(bridge.isSupportedAsset(getChain(network, 'optimism'))).toBe(true)
  })
})

describe('available routes', () => {
  it('should return list available routes', async () => {
    const hop = new Hop('mainnet')
    const routes = await hop.getAvailableRoutes()
    console.log(routes)
    expect(routes).toBeTruthy()
  })
})

describe.skip('get call data only (no signer connected)', () => {
  it('should return call data for L1->L2 ETH send', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('ETH')
    const amount = utils.parseUnits('0.01', 18)
    const sourceChain = 'ethereum'
    const destinationChain = 'gnosis'
    const recipient = constants.AddressZero
    const txObj = await bridge.populateSendTx(amount, sourceChain, destinationChain, {
      recipient
    })
    expect(txObj.value).toBeTruthy()
    expect(txObj.data).toBeTruthy()
    expect(txObj.to).toBeTruthy()
  }, 30 * 1000)
  it('should return call data for L1->L2 USDC send', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const amount = utils.parseUnits('150', 6)
    const sourceChain = 'ethereum'
    const destinationChain = 'gnosis'
    const recipient = constants.AddressZero
    const txObj = await bridge.populateSendTx(amount, sourceChain, destinationChain, {
      recipient
    })
    expect(txObj.value).toBeFalsy()
    expect(txObj.data).toBeTruthy()
    expect(txObj.to).toBeTruthy()
  }, 30 * 1000)
  it('should return call data for L2->L2 USDC send', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const amount = utils.parseUnits('1', 6)
    const sourceChain = 'gnosis'
    const destinationChain = 'polygon'
    const recipient = constants.AddressZero
    const txObj = await bridge.populateSendTx(amount, sourceChain, destinationChain, {
      recipient
    })
    expect(txObj.value).toBeFalsy()
    expect(txObj.data).toBeTruthy()
    expect(txObj.to).toBeTruthy()
  }, 30 * 1000)
  it('should return call data for L2->L1 USDC send', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const amount = utils.parseUnits('150', 6)
    const sourceChain = 'gnosis'
    const destinationChain = 'ethereum'
    const recipient = constants.AddressZero
    const txObj = await bridge.populateSendTx(amount, sourceChain, destinationChain, {
      recipient
    })
    expect(txObj.value).toBeFalsy()
    expect(txObj.data).toBeTruthy()
    expect(txObj.to).toBeTruthy()
  }, 30 * 1000)
  it('should return call data for add liquidity call', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const sourceChain = 'gnosis'
    const amount = utils.parseUnits('1', 6)
    const txObj = await bridge.populateSendApprovalTx(amount, sourceChain)
    expect(txObj.data).toBeTruthy()
    expect(txObj.to).toBeTruthy()
  }, 30 * 1000)
  it('should return call data for add liquidity call', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const chain = 'gnosis'
    const amm = await bridge.getAmm(chain)
    const amount0 = utils.parseUnits('1', 6)
    const amount1 = utils.parseUnits('1', 6)
    const minToMint = BigNumber.from(0)
    const txObj = await amm.populateAddLiquidityTx(amount0, amount1, minToMint)
    expect(txObj.data).toBeTruthy()
    expect(txObj.to).toBeTruthy()
  }, 30 * 1000)
  it('should return call data for remove liquidity call', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const chain = 'gnosis'
    const amm = await bridge.getAmm(chain)
    const lpTokenAmount = utils.parseUnits('1', 18)
    const amount0Min = BigNumber.from(0)
    const amount1Min = BigNumber.from(0)
    const txObj = await amm.populateRemoveLiquidityTx(lpTokenAmount, amount0Min, amount1Min)
    expect(txObj.data).toBeTruthy()
    expect(txObj.to).toBeTruthy()
  }, 30 * 1000)
})

describe.skip('get estimated gas (no signer connected)', () => {
  it('should return estimated gas for L1->L2 send', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const amount = utils.parseUnits('1', 6)
    const sourceChain = 'ethereum'
    const destinationChain = 'gnosis'
    const recipient = constants.AddressZero
    const estimatedGas = await bridge.estimateSendGasLimit(amount, sourceChain, destinationChain, {
      recipient
    })
    expect(estimatedGas.gt(0)).toBeTruthy()
  })
  it('should return estimated gas for L2->L2 send', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const amount = utils.parseUnits('1', 6)
    const sourceChain = 'gnosis'
    const destinationChain = 'polygon'
    const recipient = constants.AddressZero
    const estimatedGas = await bridge.estimateSendGasLimit(amount, sourceChain, destinationChain, {
      recipient
    })
    expect(estimatedGas.gt(0)).toBeTruthy()
  })
  it('should return estimated gas for L2->L1 send', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const amount = utils.parseUnits('100', 6)
    const sourceChain = 'gnosis'
    const destinationChain = 'ethereum'
    const recipient = constants.AddressZero
    const estimatedGas = await bridge.estimateSendGasLimit(amount, sourceChain, destinationChain, {
      recipient
    })
    expect(estimatedGas.gt(0)).toBeTruthy()
  })
})

describe.skip('getMessengerWrapperAddress', () => {
  it('should return the messenger wrapper', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('ETH')
    const destinationChain = 'arbitrum'
    const messengerWrapper = await bridge.getMessengerWrapperAddress(destinationChain)
    console.log(messengerWrapper)
    expect(messengerWrapper).toBeTruthy()
    expect(messengerWrapper.length).toBe(42)
  })
  it('should not return the messenger wrapper for mainnet because one does not exist', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('ETH')
    const destinationChain = 'ethereum'
    const messengerWrapper = await bridge.getMessengerWrapperAddress(destinationChain)
    console.log(messengerWrapper)
    expect(messengerWrapper).toBeFalsy()
  })
})

describe.skip('Apr', () => {
  it('should return apr', async () => {
    const hop = new Hop('mainnet')
    const token = 'USDC'
    const chain = 'gnosis'
    const bridge = hop.bridge(token)
    /*
    bridge.setChainProviderUrls({
      gnosis: '',
      optimism: ''
    })
    */
    const amm = bridge.getAmm(chain)
    const apr = await amm.getApr()
    console.log(token, chain, apr)
    expect(apr).toBeGreaterThan(0)
    expect(apr).toBeLessThan(50)
  }, 10 * 60 * 1000)
})

describe.skip('getExplorerUrl', () => {
  it('should return explorer url for transfer id', () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    expect(bridge.getExplorerUrlForTransferId('0x3686977a4c3ce1e42b2cc113f2889723d95251d55b874910fd97ef6b16982024')).toBe('https://explorer.hop.exchange/?transferId=0x3686977a4c3ce1e42b2cc113f2889723d95251d55b874910fd97ef6b16982024')
  })
})

describe.skip('getTransferStatus', () => {
  it('should return status for transfer id', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const status = await bridge.getTransferStatus('0x198cf61a0dfa6d86e9b3b2b92a10df33acd8a4b722c8d670b8c94638d590d3c5180')
    expect(status.sourceChainSlug).toBe('ethereum')
    expect(status.bonded).toBe(true)
  })
})

describe.skip('getTransferTimes', () => {
  it.skip('should return transfer times for optimism to arbitrum route', async () => {
    const hop = new Hop('mainnet')
    const sourceChain = 'optimism'
    const destinationChain = 'arbitrum'
    const times = await hop.getTransferTimes(sourceChain, destinationChain)
    console.log('times', times)

    expect(times.avg > 0).toBe(true)
    expect(times.median > 0).toBe(true)
    expect(times.percentile90 > 0).toBe(true)
  })
  it.skip('should return transfer times for ethereum to polygon route', async () => {
    const hop = new Hop('mainnet')
    const sourceChain = 'ethereum'
    const destinationChain = 'polygon'
    const times = await hop.getTransferTimes(sourceChain, destinationChain)
    console.log('times', times)

    expect(times.avg > 0).toBe(true)
    expect(times.median > 0).toBe(true)
    expect(times.percentile90 > 0).toBe(true)
  })
})

describe.skip('calcAmountOutMin', () => {
  it('should return min amount out given slippage tolerance', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const amountOut = utils.parseUnits('1')
    const slippageTolerance = 0.5
    const amountOutMin = bridge.calcAmountOutMin(amountOut, slippageTolerance)
    expect(utils.formatUnits(amountOutMin)).toBe(0.995)
  })
})

describe.skip('isDestinationChainIdPaused', () => {
  it('should return false if chain id is not paused', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const isPaused = await bridge.isDestinationChainPaused('polygon')
    expect(isPaused).toBe(false)
  }, 10 * 1000)
})

describe.skip('relayerFeeEnabled', () => {
  it('should return enabled value for arbitrum', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const enabled = bridge.relayerFeeEnabled.arbitrum
    expect(enabled).toBe(true)

    const fee = await bridge.getRelayerFee('arbitrum', 'USDC')
    expect(fee.eq(0)).toBe(true)
  })
})

describe.skip('hop bridge', () => {
  it('Should not use AMM', async () => {
    const hop = new Hop('goerli')
    const bridge = hop.bridge('HOP')
    expect(bridge.doesUseAmm).toBe(false)
  })
  it('Should not use h prefix', async () => {
    const hop = new Hop('goerli')
    const bridge = hop.bridge('HOP')
    const hopToken = bridge.toHopToken('HOP', 'goerli', 'polygon')
    expect(hopToken.name).toBe('Hop')
    expect(hopToken._symbol).toBe('HOP')
  })
  it('Should use correct approval address', async () => {
    // const hop = new Hop('goerli')
    // const bridge = hop.bridge('HOP')
    // const approvalAddress = bridge.getSendApprovalAddress('polygon')
    // const expectedAddress = addresses.goerli.bridges.HOP?.polygon?.l2Bridge
    // expect(approvalAddress).toBe(expectedAddress)
  })
})

describe.skip('supported chains', () => {
  it('Should return supported chains', async () => {
    const hop = new Hop('mainnet')
    const usdcBridge = hop.bridge('USDC')
    expect(JSON.stringify(usdcBridge.supportedChains)).toBe(JSON.stringify(['ethereum', 'arbitrum', 'optimism', 'gnosis', 'polygon']))
    const maticBridge = hop.bridge('MATIC')
    expect(JSON.stringify(maticBridge.supportedChains)).toBe(JSON.stringify(['ethereum', 'gnosis', 'polygon']))
  })
})

describe.skip('fallback provider', () => {
  it('Should return supported chains', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('USDC')
    const provider = bridge.getChainProvider('optimism')
    expect(provider instanceof FallbackProvider).toBe(true)
    const network = await provider!.getNetwork()
    console.log('network:', network)
    expect(network.name).toBe('optimism')
  }, 10 * 60 * 1000)
})

describe.skip('AMM calculateSwap', () => {
  it('should call calculateSwap', async () => {
    const provider = new providers.StaticJsonRpcProvider('https://optimism-mainnet.infura.io/v3/84842078b09946638c03157f83405213')
    const signer = new Wallet(privateKey!, provider)
    const hop = new Hop('mainnet', signer)
    const token = 'USDC'
    const chain = 'optimism'
    const bridge = hop.bridge(token)
    const amm = bridge.getAmm(chain)
    const amountOut = await amm.calculateSwap(0, 1, utils.parseUnits('10', 6))
    console.log(token, chain, amountOut)
    expect(amountOut.gt(0)).toBe(true)
  }, 10 * 60 * 1000)
})

describe.skip('S3 data', () => {
  it('should get core config json data', async () => {
    const hop = new Hop('mainnet')
    const json = await hop.fetchCoreConfigData()
    // console.log(json)
    expect(json).toBeTruthy()
    expect(json.bonders).toBeTruthy()
  })
  it('should get available liquidity json data', async () => {
    const hop = new Hop('mainnet')
    const json = await hop.fetchBonderAvailableLiquidityData()
    // console.log(json)
    expect(json).toBeTruthy()
    expect(json.ETH).toBeTruthy()
  })
})

describe.skip('fetchJsonOrThrow', () => {
  it('should fetch json', async () => {
    const url = 'https://assets.hop.exchange/mainnet/v1-core-config.json'
    const json = await fetchJsonOrThrow(url)
    // console.log(json)
    expect(json).toBeTruthy()
    expect(json instanceof Object).toBeTruthy()
    expect(json.bonders).toBeTruthy()
  }, 60 * 1000)
  it('should throw if invalid json', async () => {
    let error : any
    try {
      const url = 'https://assets.hop.exchange'
      const json = await fetchJsonOrThrow(url)
      expect(json).toBeFalsy()
    } catch (err: any) {
      error = err.message
    }
    console.log(error)
    expect(error).toBeTruthy()
    expect(/invalid/gi.test(error)).toBeTruthy()
  }, 60 * 1000)
  it('should throw if url request times out', async () => {
    let error : any
    try {
      const url = 'https://www.google.com:81/' // this endpoint basically never responds which is useful for testing timeouts
      const json = await fetchJsonOrThrow(url)
      expect(json).toBeFalsy()
    } catch (err: any) {
      error = err.message
    }
    console.log(error)
    expect(error).toBeTruthy()
    expect(/timedout|aborted/gi.test(error)).toBeTruthy()
  }, 60 * 1000)
  it('should throw if invalid or incomplete url', async () => {
    let error : any
    try {
      const url = 'example.com'
      const json = await fetchJsonOrThrow(url)
      expect(json).toBeFalsy()
    } catch (err: any) {
      error = err.message
    }
    console.log(error)
    expect(error).toBeTruthy()
    expect(/invalid/gi.test(error)).toBeTruthy()
  }, 60 * 1000)
})

describe.skip('sdk config file fetching', () => {
  it('setBaseConfigUrl', async () => {
    const hop = new Hop('mainnet')
    expect(hop.baseConfigUrl).toBe('https://assets.hop.exchange')
    await hop.setBaseConfigUrl('https://s3.us-west-1.amazonaws.com/assets.hop.exchange')
    expect(hop.baseConfigUrl).toBe('https://s3.us-west-1.amazonaws.com/assets.hop.exchange')
    const bridge = hop.bridge('USDC')
    expect(bridge.baseConfigUrl).toBe('https://s3.us-west-1.amazonaws.com/assets.hop.exchange')
    await hop.setBaseConfigUrl('https://assets.hop.exchange')
  })

  it('baseConfigUrl option', async () => {
    const hop = new Hop('mainnet')
    expect(hop.baseConfigUrl).toBe('https://assets.hop.exchange')

    const hop2 = new Hop({
      network: 'mainnet',
      baseConfigUrl: 'https://s3.us-west-1.amazonaws.com/assets.hop.exchange'
    })
    const bridge = hop2.bridge('USDC')
    expect(bridge.baseConfigUrl).toBe('https://s3.us-west-1.amazonaws.com/assets.hop.exchange')
  })

  it('configFileFetchEnabled', async () => {
    const hop = new Hop('mainnet')
    expect(hop.configFileFetchEnabled).toBe(true)
    hop.setConfigFileFetchEnabled(false)
    expect(hop.configFileFetchEnabled).toBe(false)
    const bridge = hop.bridge('USDC')
    expect(bridge.configFileFetchEnabled).toBe(false)
    hop.setConfigFileFetchEnabled(true)
    expect(hop.configFileFetchEnabled).toBe(true)
  })

  it('setCoreConfigJsonUrl', async () => {
    const hop = new Hop('mainnet')
    expect(hop.coreConfigJsonUrl).toBe('https://assets.hop.exchange/mainnet/v1-core-config.json')
    await hop.setCoreConfigJsonUrl('https://s3.us-west-1.amazonaws.com/assets.hop.exchange/mainnet/v1-core-config.json')
    expect(hop.coreConfigJsonUrl).toBe('https://s3.us-west-1.amazonaws.com/assets.hop.exchange/mainnet/v1-core-config.json')
    const bridge = hop.bridge('USDC')
    expect(bridge.coreConfigJsonUrl).toBe('https://s3.us-west-1.amazonaws.com/assets.hop.exchange/mainnet/v1-core-config.json')
  })

  it('setAvailableLiqudityJsonUrl', async () => {
    const hop = new Hop('mainnet')
    expect(hop.availableLiqudityJsonUrl).toBe('https://assets.hop.exchange/mainnet/v1-available-liquidity.json')
    await hop.setAvailableLiqudityJsonUrl('https://s3.us-west-1.amazonaws.com/assets.hop.exchange/mainnet/v1-available-liquidity.json')
    expect(hop.availableLiqudityJsonUrl).toBe('https://s3.us-west-1.amazonaws.com/assets.hop.exchange/mainnet/v1-available-liquidity.json')
    const bridge = hop.bridge('USDC')
    expect(bridge.availableLiqudityJsonUrl).toBe('https://s3.us-west-1.amazonaws.com/assets.hop.exchange/mainnet/v1-available-liquidity.json')
  })
})

describe.skip('ipfs', () => {
  it('resolveDnslink', async () => {
    const hop = new Hop('mainnet')
    const dnslinkDomain = '_dnslink.ipfs-assets.hop.exchange'
    const ipfsHash = await hop.resolveDnslink(dnslinkDomain)
    console.log(ipfsHash)
    expect(ipfsHash).toBeTruthy()
  })

  it('fetchIpfsCoreConfigData', async () => {
    const hop = new Hop('mainnet')
    const json = await hop.fetchIpfsCoreConfigData()
    console.log(json)
    expect(json).toBeTruthy()
    expect(json.bonders).toBeTruthy()
  })

  it('fetchIpfsBonderAvailableLiquidity', async () => {
    const hop = new Hop('mainnet')
    const json = await hop.fetchIpfsBonderAvailableLiquidityData()
    console.log(json)
    expect(json).toBeTruthy()
    expect(json.ETH).toBeTruthy()
  })

  it('fetchCoreConfigDataWithIpfsFallback', async () => {
    const hop = new Hop('mainnet')
    const json = await hop.fetchCoreConfigDataWithIpfsFallback()
    console.log(json)
    expect(json).toBeTruthy()
    expect(json.bonders).toBeTruthy()
  })

  it('fetchBonderAvailableLiquidityDataWithIpfsFallback', async () => {
    const hop = new Hop('mainnet')
    const json = await hop.fetchBonderAvailableLiquidityDataWithIpfsFallback()
    console.log(json)
    expect(json).toBeTruthy()
    expect(json.ETH).toBeTruthy()
  })
})

describe.skip('WithdrawalProof', () => {
  it('should get populated withdrawal tx', async () => {
    const sourceChain = 'optimism'
    const destinationChain = 'ethereum'
    const transferId = '0xbc24dd151ced6ad0d725c753b513a2164e669868faeebea8224dd0b92e751df7'
    const sdk = new Hop('mainnet')
    const bridge = sdk.bridge('ETH')
    const txData = await bridge.populateWithdrawTransferTx(sourceChain, destinationChain, transferId)
    console.log(txData)
    expect(txData).toBeTruthy()
  }, 10 * 1000)
  it('should get withdrawal proof', async () => {
    const sourceChain = 'optimism'
    const destinationChain = 'ethereum'
    const transferId = '0xbc24dd151ced6ad0d725c753b513a2164e669868faeebea8224dd0b92e751df7'
    const sdk = new Hop('mainnet')
    const bridge = sdk.bridge('ETH')
    const proof = await bridge.getWithdrawProof(sourceChain, destinationChain, transferId)
    console.log(proof)
    expect(proof).toBeTruthy()
  }, 10 * 1000)
})

describe.skip('debugTimeLogs', () => {
  it('should console log debug time logs and return array with times', async () => {
    const sdk = new Hop({
      network: 'mainnet',
      debugTimeLogsEnabled: true,
      debugTimeLogsCacheEnabled: true

      // fill in

      // chainProviders: {
      //   ethereum: new providers.StaticJsonRpcProvider('redacted'),
      //   arbitrum: new providers.StaticJsonRpcProvider('redacted'),
      //   optimism: new providers.StaticJsonRpcProvider('redacted'),
      //   base: new providers.StaticJsonRpcProvider('redacted'),
      //   gnosis: new providers.StaticJsonRpcProvider('redacted'),
      //   nova: new providers.StaticJsonRpcProvider('redacted')
      // }
    })

    const iterations = 100
    for (let i = 0; i < iterations; i++) {
      const bridge = sdk.bridge('ETH')
      const amountIn = '1000000000'
      const sourceChain = 'base'
      const destinationChain = 'ethereum'
      const sendData = await bridge.getSendData(amountIn, sourceChain, destinationChain)
      expect(sendData).toBeTruthy()
    }

    const logs = sdk.getDebugTimeLogs()
    expect(logs.length > 0).toBeTruthy()
    fs.writeFileSync('/tmp/debugTimeLogs.json', JSON.stringify(logs, null, 2))

    // generate chart:
    // cd scripts/
    // python generate_chart_from_file.py /tmp/debugTimeLogs.json
    // open debugTimeLogs.png
  }, 60 * 60 * 1000)
  it('should calculate swap and add time to array', async () => {
    const sdk = new Hop('mainnet')
    const logs: any[] = []
    const iterations = 100
    const concurrency = 6
    await promiseQueue(new Array(iterations), async (item: any, i: number) => {
      console.log(`processing #${i}`)
      const sourceChain = 'arbitrum'
      const tokenSymbol = 'ETH'
      const rpcUrl = 'redacted' // fill in
      const saddleSwapAddress = sdk.getL2SaddleSwapAddress(
        tokenSymbol,
        sourceChain
      )
      const amountIn = '1000000000'
      const fromIndex = 1
      const toIndex = 0
      const provider = new providers.StaticJsonRpcProvider(rpcUrl)
      const saddleSwap = Swap__factory.connect(saddleSwapAddress, provider)
      const timeStart = Date.now()
      const swapData = await saddleSwap.calculateSwap(fromIndex, toIndex, amountIn)
      console.log(swapData)
      expect(swapData).toBeTruthy()
      const now = Date.now()
      const durationMs = now - timeStart
      if (durationMs > 2 * 2000) {
        console.warn(`slow ${Math.floor(durationMs / 1000)}s`)
      }
      logs.push({ label: 'calculateSwap', duration: durationMs, timestamp: now })
    }, { concurrency })

    expect(logs.length > 0).toBeTruthy()
    fs.writeFileSync('/tmp/debugTimeLogs.json', JSON.stringify(logs, null, 2))

    // generate chart:
    // cd scripts/
    // python generate_chart_from_file.py /tmp/debugTimeLogs.json
    // open debugTimeLogs.png
  }, 60 * 60 * 1000)
})

describe.skip('calcToHTokenAmountMulticall', () => {
  it('Should get amount outs', async () => {
    const sdk = new Hop('mainnet')
    const bridge = sdk.bridge('ETH')
    const amountOuts = await bridge.calcToHTokenAmountMulticall('optimism', [utils.parseUnits('1', 18), utils.parseUnits('0', 18), utils.parseUnits('2', 18)])
    console.log('amountOuts', amountOuts)
    expect(amountOuts.length).toBe(3)
    expect(amountOuts[0].toString()).toBeTruthy()
    expect(amountOuts[1].toString()).toBeTruthy()
    expect(amountOuts[2].toString()).toBeTruthy()
  }, 60 * 1000)
})

describe.skip('calcFromHTokenAmountMulticall', () => {
  it('Should get amount outs', async () => {
    const sdk = new Hop('mainnet')
    const bridge = sdk.bridge('ETH')
    const amountOuts = await bridge.calcFromHTokenAmountMulticall('optimism', [utils.parseUnits('1', 18), utils.parseUnits('0', 18), utils.parseUnits('2', 18)])
    console.log('amountOuts', amountOuts)
    expect(amountOuts.length).toBe(3)
    expect(amountOuts[0].toString()).toBeTruthy()
    expect(amountOuts[1].toString()).toBeTruthy()
    expect(amountOuts[2].toString()).toBeTruthy()
  }, 60 * 1000)
})

describe.skip('priceFeed', () => {
  it('should return USDC price', async () => {
    const hop = new Hop('mainnet')
    hop.setPriceFeedApiKeys({
      // coingecko: 'CG-123'
    })
    const bridge = hop.bridge('USDC')
    const price = await bridge.priceFeed.getPriceByTokenSymbol('USDC')
    console.log(price)
    expect(price).toBeGreaterThan(0)
    expect(price).toBeLessThan(2)
  }, 60 * 1000)
  it('should return ETH price', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('ETH')
    const price = await bridge.priceFeed.getPriceByTokenSymbol('ETH')
    console.log(price)
    expect(price).toBeGreaterThan(0)
    expect(price).toBeLessThan(10000)
  }, 60 * 1000)
  it('should return HOP price', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('HOP')
    const price = await bridge.priceFeed.getPriceByTokenSymbol('HOP')
    console.log(price)
    expect(price).toBeGreaterThan(0)
    expect(price).toBeLessThan(50)
  }, 60 * 1000)
  it('should return SNX price', async () => {
    const hop = new Hop('mainnet')
    const bridge = hop.bridge('SNX')
    const price = await bridge.priceFeed.getPriceByTokenSymbol('SNX')
    console.log(price)
    expect(price).toBeGreaterThan(0)
    expect(price).toBeLessThan(50)
  })
})

describe.skip('cctp', () => {
  const hop = new Hop('mainnet')
  const signer = new Wallet(privateKey!)

  it('getShouldUseCctpBridge', async () => {
    const bridgeUsdce = hop.bridge('USDC.e')
    expect(bridgeUsdce.getShouldUseCctpBridge()).toBe(true)
    expect(bridgeUsdce.getShouldUseCctpBridge({ isHTokenSend: true })).toBe(false)

    const bridgeUsdc = hop.bridge('USDC')
    expect(bridgeUsdc.getShouldUseCctpBridge()).toBe(true)

    const bridgeEth = hop.bridge('ETH')
    expect(bridgeEth.getShouldUseCctpBridge()).toBe(false)
  })

  it('getAvailableLiquidityCctp', async () => {
    const bridge = hop.bridge('USDC')
    const availableLiquidity = await bridge.getFrontendAvailableLiquidity('arbitrum', 'polygon')
    console.log(availableLiquidity)
    expect(availableLiquidity.gt(0)).toBe(true)
  })

  it('getSendDataCctp', async () => {
    const bridge = hop.bridge('USDC')
    const data = await bridge.getSendData(utils.parseUnits('1', 6), 'arbitrum', 'polygon')
    console.log(data)
    expect(data).toBeTruthy()
  })

  it('getIsSupportedCctpRoute', async () => {
    const bridge = hop.bridge('USDC')
    expect(bridge.getIsSupportedCctpRoute('arbitrum', 'polygon')).toBe(true)
    expect(bridge.getIsSupportedCctpRoute('gnosis', 'polygon')).toBe(false)
  })

  it('getCctpDecodedMessageBody', async () => {
    const bridge = hop.bridge('USDC')
    const messageBody = '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000f8000000000000000600000002000000000000b52c0000000000000000000000001682ae6375c4e4a97e4b583bc394c861a46d89620000000000000000000000002b4069517957735be00cee0fadae88a26365528f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda029130000000000000000000000009997da3de3ec197c853bcc96caecf08a81de9d69000000000000000000000000000000000000000000000000000000000002e5bc000000000000000000000000e7f40bf16ab09f4a6906ac2caa4094ad2da48cc20000000000000000'

    const message = bridge.getCctpDecodedMessageBody(messageBody)
    console.log(message)
    expect(message.startsWith('0x')).toBeTruthy()
  })

  it('getCctpMessageHash', async () => {
    const bridge = hop.bridge('USDC')
    const message = '0x000000000000000600000002000000000000b52c0000000000000000000000001682ae6375c4e4a97e4b583bc394c861a46d89620000000000000000000000002b4069517957735be00cee0fadae88a26365528f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda029130000000000000000000000009997da3de3ec197c853bcc96caecf08a81de9d69000000000000000000000000000000000000000000000000000000000002e5bc000000000000000000000000e7f40bf16ab09f4a6906ac2caa4094ad2da48cc2'
    const hash = bridge.getCctpMessageHash(message)
    console.log(hash)
    expect(hash.startsWith('0x')).toBeTruthy()
  })

  it('getCctpMessageAttestation', async () => {
    const bridge = hop.bridge('USDC')
    const messageHash = '0xa03ed734b7f91cbeaf20596a181272da3a3b6ba5e1eea063abe1218552ef4387'
    const toChain = 'base'
    const attestation = await bridge.getCctpMessageAttestation(messageHash, toChain)
    console.log(attestation)
    expect(attestation.startsWith('0x')).toBeTruthy()
  })

  it('getCctpRecipientHash', async () => {
    const bridge = hop.bridge('USDC')
    const addressHash = bridge.getCctpRecipientHash('0x9997da3de3ec197C853BCC96CaECf08a81dE9D69')
    console.log(addressHash)
    expect(addressHash).toBeTruthy()
  })

  it('getCctpReceiveMessageEstimateGasLimit', async () => {
    const bridge = hop.bridge('USDC')
    const gasLimit = await bridge.getCctpReceiveMessageEstimateGasLimit('polygon', 'base')
    console.log(gasLimit.toString())
    expect(gasLimit).toBeTruthy()
  })

  it('getCctpWithdrawData', async () => {
    const bridge = hop.bridge('USDC')
    const fromChain = 'polygon'
    const toChain = 'optimism'
    const txHash = '0x6cfdbb214f5d184697cc62cee1b5279a44ca55c80b003323f9ca126ace80ae22'
    const data = await bridge.getCctpWithdrawData(txHash)
    console.log(data)
    expect(data).toBeTruthy()
    expect(data.fromChain).toBe(fromChain)
    expect(data.fromChainId).toBeTruthy()
    expect(data.toChain).toBe(toChain)
    expect(data.toChainId).toBeTruthy()
    expect(data.transactionHash).toBe(txHash)
  }, 60 * 1000)

  it('getCctpWithdrawPopulatedTx', async () => {
    const bridge = hop.bridge('USDC')
    const fromChain = 'polygon'
    const toChain = 'optimism'
    const txHash = '0x6cfdbb214f5d184697cc62cee1b5279a44ca55c80b003323f9ca126ace80ae22'
    const populatedTx = await bridge.getCctpWithdrawPopulatedTx(fromChain, toChain, txHash)
    expect(populatedTx).toBeTruthy()
  }, 60 * 1000)

  it('getIsCctpEnabled', async () => {
    const bridge = hop.bridge('USDC')
    const isEnabled = await bridge.getIsCctpEnabled()
    expect(typeof isEnabled).toBe('boolean')
  }, 60 * 1000)
})
