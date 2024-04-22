import getSubgraphUrl from '#utils/getSubgraphUrl.js'
import { rateLimitRetry } from '@hop-protocol/hop-node-core/utils'

export default async function makeRequest (
  chain: string,
  query: string,
  params: any = {}
) {
  return rateLimitRetry(_makeRequest)(chain, query, params)
}

async function _makeRequest (
  chain: string,
  query: string,
  params: any = {}
) {
  const url = getSubgraphUrl(chain)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query,
      variables: params
    })
  })
  const jsonRes: any = await res.json()
  if (Array.isArray(jsonRes.errors) && jsonRes.errors.length) {
    console.error('query:', query)
    throw new Error(jsonRes.errors[0].message)
  }
  return jsonRes.data
}
