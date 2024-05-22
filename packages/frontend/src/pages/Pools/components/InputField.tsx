import Box from '@mui/material/Box'
import React, { ChangeEvent } from 'react'
import Typography from '@mui/material/Typography'
import { TokenIcon } from '#pages/Pools/components/TokenIcon.js'
import { makeStyles } from '@mui/styles'

export const useStyles = makeStyles(theme => ({
  box: {
    background: theme.palette.mode === 'dark' ? '#0000003d' : '#fff',
    borderRadius: '1rem',
    position: 'relative'
  },
  label: {
    'white-space': 'nowrap'
  },
  input: {
    fontSize: '2rem',
    fontWeight: 'bold',
    fontFamily: 'Nunito,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
    border: 0,
    outline: 0,
    width: '100%',
    textAlign: 'right',
    background: 'none',
    color: theme.palette.text.primary,
  },
}))

type Props = {
  disabled?: boolean
  onChange: any
  tokenImageUrl: string
  tokenSymbol: string
  value: string
}

export function InputField (props: Props) {
  const styles = useStyles()
  const {
    disabled,
    onChange,
    tokenImageUrl,
    tokenSymbol,
    value,
  } = props

  function handleChange(event: ChangeEvent<any>) {
    if (onChange) {
      onChange(event.target.value)
    }
  }

  return (
    <Box p={2} className={styles.box} display="flex">
      <Box display="flex" alignItems="center">
        {!!tokenImageUrl && (
          <Box mr={1} display="flex" alignItems="center">
            <TokenIcon src={tokenImageUrl} alt={tokenSymbol} title={tokenSymbol} width="24px" />
          </Box>
        )}
        <Box mr={1} display="flex" alignItems="center">
          <Typography variant="subtitle1" className={styles.label}>
            {tokenSymbol}
          </Typography>
        </Box>
      </Box>
      <input type="text" placeholder="0.0" value={value} onChange={handleChange} className={styles.input} disabled={disabled} />
    </Box>
  )
}
