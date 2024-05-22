import Box from '@mui/material/Box'
import React from 'react'
import Typography from '@mui/material/Typography'
import { InfoTooltip } from '#components/InfoTooltip/index.js'
import { getTokenImage } from '#utils/tokens.js'
import { makeStyles } from '@mui/styles'

export const useStyles = makeStyles((theme: any) => ({
  root: {
    width: '47rem',
    background: theme.palette.mode === 'dark' ? '#211e29' : '#fff',
    padding: '1rem 2rem',
    marginBottom: '2rem',
    marginLeft: '-20px',
    borderRadius: '50px',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      flexDirection: 'column',
    }
  }
}))

export function FeeRefund (props: any) {
  const { title, tokenSymbol, tooltip, value } = props
  const styles = useStyles()
  const tokenImageUrl = getTokenImage(tokenSymbol)

  return (
   <Box display="flex" justifyContent="space-between" alignItems="center" className={styles.root}>
    <Box display="flex" alignItems="center">
      <Typography variant="subtitle1" color="textSecondary" style={{
        display: 'flex',
        alignItems: 'center'
      }}>
      <div>{title}</div>
      {tooltip ? <InfoTooltip title={tooltip} /> : null}
      </Typography>
    </Box>
    <Box display="flex" alignItems="center">
      <Box mr={1} display="flex">
        <Typography variant="subtitle1" color="textSecondary">
         +
        </Typography>
      </Box>
      {tokenImageUrl && (
        <Box mr={1} display="flex">
          <img width="22px" src={tokenImageUrl} alt={tokenSymbol} />
        </Box>
      )}
      <Box display="flex">
        <Typography variant="subtitle1" color="textSecondary">
          {value}
        </Typography>
      </Box>
    </Box>
   </Box>
  )
}
