import MenuItem from '@mui/material/MenuItem'
import Network from '#models/Network.js'
import RaisedSelect from '#components/selects/RaisedSelect.js'
import React, { useMemo } from 'react'
import SelectOption from '#components/selects/SelectOption.js'
import { findNetworkBySlug } from '#utils/index.js'
import { useApp } from '#contexts/AppContext/index.js'

interface Props {
  selectedNetwork?: Network
  onSelect?: (e: any) => void
  availableNetworks?: Network[]
  setNetwork?: (n: Network) => void
}

export function RaisedNetworkSelector(props: Props) {
  const { selectedNetwork, onSelect, setNetwork, availableNetworks } = props
  const { networks: allNetworks } = useApp()
  const networks = useMemo(
    () => (availableNetworks?.length ? availableNetworks : allNetworks),
    [availableNetworks, allNetworks]
  )

  function selectNetwork(event) {
    if (onSelect) {
      return onSelect(event)
    }
    const match = findNetworkBySlug(event.target.value, networks)
    if (setNetwork && match) {
      setNetwork(match)
    }
  }

  return (
    <RaisedSelect value={selectedNetwork?.slug} onChange={selectNetwork}>
      {networks.map(network => (
        <MenuItem value={network.slug} key={network.slug}>
          <SelectOption value={network.slug} icon={network.imageUrl} label={network.name} />
        </MenuItem>
      ))}
    </RaisedSelect>
  )
}
