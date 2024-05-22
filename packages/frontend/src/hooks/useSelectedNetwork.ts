import Network from '#models/Network.js'
import useQueryParams from './useQueryParams.js'
import { ChainSlug } from '@hop-protocol/sdk'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { SafeInfo } from '@gnosis.pm/safe-apps-sdk'
import { SelectChangeEvent } from '@mui/material/Select'
import { defaultL2Network as _defaultL2Network, l2Networks } from '#config/networks.js'
import { findNetworkBySlug, networkSlugToId } from '#utils/index.js'

interface Options {
  l2Only?: boolean
  availableNetworks?: Network[]
  gnosisSafe?: SafeInfo
  preferredDefault?: string
}

export function useSelectedNetwork(opts: Options = { l2Only: false }) {
  const [defaultL2Network] = useState<Network>(() => {
    if (opts.preferredDefault) {
      const found = findNetworkBySlug(opts.preferredDefault)
      if (found) {
        return found
      }
    }
    return _defaultL2Network
  })
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(defaultL2Network)
  const { queryParams, updateQueryParams } = useQueryParams()

  useEffect(() => {
    if (queryParams?.sourceNetwork !== selectedNetwork?.slug) {
      const matchingNetwork = findNetworkBySlug(
        queryParams.sourceNetwork as string,
        opts.availableNetworks
      )
      if (matchingNetwork && !matchingNetwork.isLayer1) {
        setSelectedNetwork(matchingNetwork)
      } else {
        setSelectedNetwork(defaultL2Network)
      }
    }
  }, [queryParams])

  useEffect(() => {
    if (opts.l2Only && selectedNetwork && !l2Networks.includes(selectedNetwork)) {
      setSelectedNetwork(defaultL2Network)
    }
  }, [opts.l2Only])

  const isMatchingSignerAndSourceChainNetwork = useMemo(() => {
    if (queryParams?.sourceNetwork) {
      const chainId = networkSlugToId(queryParams.sourceNetwork as ChainSlug)
      if (opts.gnosisSafe?.chainId === chainId) {
        return true
      }
    }
    return false
  }, [opts, queryParams])

  const selectSourceNetwork = (event: ChangeEvent<{ value: any }>) => {
    const selectedNetworkSlug = event.target.value as string
    const network = findNetworkBySlug(selectedNetworkSlug, opts.availableNetworks)
    if (network) {
      setSelectedNetwork(network)
      updateQueryParams({
        sourceNetwork: network.slug,
      })
    }
  }

  const selectDestNetwork = (event: SelectChangeEvent<unknown>) => {
    const selectedNetworkSlug = event.target.value as string
    const network = findNetworkBySlug(selectedNetworkSlug, opts.availableNetworks)
    if (network) {
      setSelectedNetwork(network)
      updateQueryParams({
        destNetwork: network.slug,
      })
    }
  }

  const selectBothNetworks = (event: SelectChangeEvent<unknown>) => {
    const selectedNetworkSlug = event.target.value as string
    const network = findNetworkBySlug(selectedNetworkSlug, opts.availableNetworks)
    if (network) {
      setSelectedNetwork(network)
      updateQueryParams({
        sourceNetwork: network.slug,
        destNetwork: network.slug,
      })
    }
  }

  return {
    selectedNetwork,
    selectSourceNetwork,
    selectDestNetwork,
    selectBothNetworks,
    isMatchingSignerAndSourceChainNetwork,
  }
}
