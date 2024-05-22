import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import RaisedSelect from '#components/selects/RaisedSelect.js'
import React, { FC } from 'react'
import Typography from '@mui/material/Typography'
import { Alert } from '#components/Alert/index.js'
import { Button } from '#components/Button/index.js'
import { SelectChangeEvent } from '@mui/material/Select'
import { findMatchingBridge } from '#utils/index.js'
import { makeStyles } from '@mui/styles'
import { useApp } from '#contexts/AppContext/index.js'
import { useFaucet } from '#pages/Faucet/FaucetContext.js'

const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: '4.2rem',
  },
  box: {
    marginBottom: '2rem',
    flexDirection: 'column',
  },
  text: {
    fontSize: '2rem',
    marginRight: '1rem',
  },
  selectBox: {
    marginBottom: '2rem',
  },
  button: {},
  alert: {
    marginTop: '2rem',
    marginBottom: '1.2rem',
  },
}))

const mintAmounts = {
  HOP: '1000',
  USDT: '100',
  DAI: '100',
  UNI: '10',
}

const Faucet: FC = () => {
  const styles = useStyles()
  const { bridges, selectedBridge, setSelectedBridge } = useApp()
  const { mintToken, mintAmount, setMintAmount, isMinting, error, setError, success, setSuccess, tokens, selectedNetwork } = useFaucet()

  const handleTokenChange = (event: SelectChangeEvent<unknown>) => {
    const tokenSymbol = event.target.value as string
    const bridge = findMatchingBridge(bridges, tokenSymbol)
    if (bridge) {
      setSelectedBridge(bridge)
    }
  }

  let selectedToken = selectedBridge?.getTokenSymbol()
  if (selectedToken === 'ETH' || selectedToken === 'USDC') {
    selectedToken = 'HOP'
  }

  const handleMint = () => {
    mintToken(selectedToken)
  }
  setMintAmount(mintAmounts[selectedToken])

  const filteredTokens = tokens?.filter(token => token.symbol !== 'ETH')

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box display="flex" alignItems="center">
        <Typography variant="h4" className={styles.title}>
          Faucet
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" className={styles.box}>
        <Box display="flex" alignItems="center" flexDirection="row" className={styles.selectBox}>
          <Typography variant="body1" className={styles.text}>
            Mint {mintAmount} {selectedToken}
          </Typography>
          {filteredTokens?.length > 0 && (
            <RaisedSelect value={selectedToken} onChange={handleTokenChange}>
              {filteredTokens.filter(token => token.symbol !== 'USDC').map(token => (
                <MenuItem value={token.symbol} key={token.symbol}>
                  {token.symbol}
                </MenuItem>
              ))}
            </RaisedSelect>
          )}
        </Box>
        <Button
          className={styles.button}
          onClick={handleMint}
          large
          highlighted
          loading={isMinting}
        >
          Mint {selectedToken}
        </Button>
        <Alert
          className={styles.alert}
          severity="error"
          onClose={() => setError('')}
          text={error}
        />
        <Alert
          className={styles.alert}
          severity="success"
          onClose={() => setSuccess('')}
          text={success}
        />
      </Box>
    </Box>
  )
}

export default Faucet
