import { RootProviderName } from '#constants/index.js'
import { getRpcUrlFromProvider } from './getRpcUrlFromProvider.js'
import { promiseTimeout } from './promiseTimeout.js'
import { providers } from 'ethers'

// Intentionally force a call to a method that is not supported by all providers
const unsupportedCallMethod = 'eth_unsupportedCall'

// Full error message for an eth_unsupportedCall
// alchemy: {"jsonrpc":"2.0","id":1,"error":{"code":-32600,"message":"Unsupported method: eth_unsupportedCall. See available methods at https://docs.alchemy.com/alchemy/documentation/apis"}}
// infura: {"jsonrpc":"2.0","id":1,"error":{"code":-32601,"message":"The method eth_unsupportedCall does not exist/is not available"}}
// quiknode: {"jsonrpc":"2.0","error":{"code":-32601,"message":"Method eth_unsupportedCall is not supported"},"id":1}
enum rpcRootProviderErrorString {
  Alchemy = 'alchemy',
  Infura = 'does not exist/is not available',
  Quiknode = 'Method eth_unsupportedCall is not supported'
}

const cache: Record<string, RootProviderName> = {}

export async function getRpcRootProviderName (providerOrUrl: providers.Provider | string, onlyAttemptUrl?: boolean): Promise<RootProviderName | undefined> {
  // Cache by top-level URL
  let url = getUrlFromProviderOrUrl(providerOrUrl)
  if (cache[url]) {
    return cache[url]
  }

  let providerName: RootProviderName | undefined = getRootProviderNameFromUrl(providerOrUrl)
  if (providerName) {
    return providerName
  }

  // This is useful if you want this function to be synchronous and not make any RPC calls
  if (onlyAttemptUrl) {
    return
  }

  if (url.includes('wss://')) {
    url = url.replace('wss://', 'https://')
  }

  providerName = await getRootProviderNameFromRpcCall(url)
  if (providerName) {
    cache[url] = providerName
    return providerName
  }
}

function getRootProviderNameFromUrl (providerOrUrl: providers.Provider | string): RootProviderName | undefined {
  const url = getUrlFromProviderOrUrl(providerOrUrl)
  const entries = Object.entries(RootProviderName)
  for (const [key, value] of entries) {
    if (url.includes(value)) {
      return RootProviderName[key as keyof typeof RootProviderName]
    }
  }
}

async function getRootProviderNameFromRpcCall (url: string): Promise<RootProviderName | undefined> {
  const callTimeout: number = 2_000
  const query = {
    id: 1,
    jsonrpc: '2.0',
    method: unsupportedCallMethod,
    params: []
  }

  let res
  try {
    res = await promiseTimeout(fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(query)
    }), callTimeout)
  } catch (err) {
    return
  }

  const jsonRes: any = await res.json()
  if (!jsonRes?.error) {
    return
  }

  const errMessage = jsonRes.error.message
  const entries = Object.entries(rpcRootProviderErrorString)
  for (const [key, value] of entries) {
    if (errMessage.includes(value)) {
      return RootProviderName[key as keyof typeof RootProviderName]
    }
  }
}

function getUrlFromProviderOrUrl (providerOrUrl: providers.Provider | string): string {
  if (providerOrUrl instanceof providers.Provider) {
    return getRpcUrlFromProvider(providerOrUrl)
  }

  return providerOrUrl
}
