import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import RaisedSelect from '#components/selects/RaisedSelect.js'
import React from 'react'
import SelectOption from '#components/selects/SelectOption.js'
import Typography from '@mui/material/Typography'

function SendHeader(props: any) {
  const { styles, bridges, selectedBridge, handleBridgeChange } = props

  return (
    <div className={styles.header}>
      <Box display="flex" alignItems="center" className={styles.sendSelect}>
        <Typography variant="h4" className={styles.sendLabel}>
          Send
        </Typography>
        <RaisedSelect value={selectedBridge?.getTokenSymbol()} onChange={handleBridgeChange}>
          {bridges.map((bridge: any) => (
            <MenuItem value={bridge.getTokenSymbol()} key={bridge.getTokenSymbol()}>
              <SelectOption
                value={bridge.getTokenSymbol()}
                icon={bridge.getTokenImage()}
                label={bridge.getTokenSymbol()}
              />
            </MenuItem>
          ))}
        </RaisedSelect>
      </Box>
    </div>
  )
}

export default SendHeader
