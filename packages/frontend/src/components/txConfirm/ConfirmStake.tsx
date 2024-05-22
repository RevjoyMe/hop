import React from 'react'
import Typography from '@mui/material/Typography'
import { Button } from '#components/Button/index.js'
import { NetworkTokenEntity, commafy } from '#utils/index.js'
import { Token } from '@hop-protocol/sdk'
import { makeStyles } from '@mui/styles'
import { useSendingTransaction } from '#components/txConfirm/useSendingTransaction.js'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
  },
  title: {
    marginBottom: '2rem',
  },
  action: {},
  sendButton: {},
}))

interface Props {
  amount: string
  token: Token
  onConfirm: (confirmed: boolean) => void
  source: NetworkTokenEntity
}

const ConfirmStake = (props: Props) => {
  const { amount, token, onConfirm, source } = props
  const styles = useStyles()

  const { sending, handleSubmit } = useSendingTransaction({ onConfirm, source })

  return (
    <div className={styles.root}>
      <div className={styles.title}>
        <Typography variant="h5" color="textPrimary">
          Stake {commafy(amount, 5)} {token.symbol}
        </Typography>
      </div>
      <div className={styles.action}>
        <Button
          className={styles.sendButton}
          onClick={handleSubmit}
          loading={sending}
          large
          highlighted
        >
          Stake
        </Button>
      </div>
    </div>
  )
}

export default ConfirmStake
