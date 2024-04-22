import Address from 'src/models/Address'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import React from 'react'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { Alert } from 'src/components/Alert'
import { Button } from 'src/components/Button'
import { NetworkTokenEntity, commafy } from 'src/utils'
import { TokenIcon } from 'src/pages/Pools/components/TokenIcon'
import { makeStyles } from '@mui/styles'
import { transferTimeDisplay } from 'src/utils/transferTimeDisplay'
import { useSendingTransaction } from 'src/components/txConfirm/useSendingTransaction'
import { useTransferTimeEstimate } from 'src/hooks/useTransferTimeEstimate'

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
  customRecipient: {
    marginTop: '2rem',
  },
  warning: {
    marginTop: '2rem',
  },
  action: {},
  sendButton: {},
}))


interface Props {
  customRecipient?: string
  source: NetworkTokenEntity
  dest: Partial<NetworkTokenEntity>
  onConfirm: (confirmed: boolean) => void
  estimatedReceived: string
  isGnosisSafeWallet?: boolean
}

const ConfirmSend = (props: Props) => {
  const { customRecipient, source, dest, onConfirm, estimatedReceived, isGnosisSafeWallet = false } = props
  const styles = useStyles()

  const { sending, handleSubmit } = useSendingTransaction({
    onConfirm,
    source,
  })

  const { fixedTimeEstimate, medianTimeEstimate, isLoading } = useTransferTimeEstimate(
    source?.network?.slug,
    dest?.network?.slug,
    source?.token?.symbol
  )

  let warning = ''
  if (customRecipient && !dest?.network?.isLayer1) {
    warning =
      'If the recipient is an exchange, then there is possibility of loss funds if the token swap fails.'
  }

  const showDeadlineWarning = !!isGnosisSafeWallet

  return (
    <div className={styles.root}>
      <div className={styles.title}>
        <Typography variant="h6" color="textSecondary">
          <strong>
            Send{' '}
            {commafy(source.amount, 5)}
            {' '}<TokenIcon width="16px" inline bgTransparent src={source.token.image} alt={source.token._symbol} title={source.token._symbol} />
            &thinsp;{source.token.symbol}
          </strong>
          <br />
          <TokenIcon width="16px" inline bgTransparent src={source.network.imageUrl} alt={source.network.name} title={source.token.name} />
          &thinsp;{source.network.name}
          {' → '}
          <TokenIcon width="16px" inline bgTransparent src={dest?.network?.imageUrl} alt={dest?.network?.name} title={dest?.token?.name} />
          &thinsp;{dest?.network?.name}
        </Typography>

        <br />

        <Grid container justifyContent="center" spacing={6}>
          <Grid item>
            <Typography variant="subtitle2" color="textSecondary">
              Estimated Received
            </Typography>
            <Typography variant="subtitle2" color="textPrimary">
              {estimatedReceived}
            </Typography>
          </Grid>


          <Grid item>
            <Typography variant="subtitle2" color="textSecondary">
              Estimated Wait
            </Typography>
            <Typography variant="subtitle2" color="textPrimary">
              {isLoading ? <Skeleton animation="wave" width={'100px'} /> : transferTimeDisplay(medianTimeEstimate, fixedTimeEstimate)}
            </Typography>
          </Grid>
        </Grid>
        {!!customRecipient && (
          <>
            <Typography variant="body1" color="textPrimary" className={styles.customRecipient}>
              Recipient: {new Address(customRecipient).truncate()}
            </Typography>
          </>
        )}
        {!!warning && <Alert severity="warning" text={warning} className={styles.warning} />}
      </div>
      {showDeadlineWarning && (
        <Box mb={2}>
          <Alert severity="warning" text="The swap deadline will expire in 7 days. If this is a Gnosis Safe transaction, make sure to execute it within the deadline." className={styles.warning} />
        </Box>
      )}
      <Box mb={2} display="flex" flexDirection="column" alignItems="center" textAlign="center">
        <Box style={{ maxWidth: '350px' }}>
        <Typography variant="body2" color="textSecondary">
          Please make sure your wallet is connected to the <strong>{source.network.name}</strong> network, otherwise it can result in loss of funds.
        </Typography>
        </Box>
      </Box>
      <div className={styles.action}>
        <Button
          className={styles.sendButton}
          onClick={handleSubmit}
          loading={sending}
          large
          highlighted
        >
          Send
        </Button>
      </div>
    </div>
  )
}

export default ConfirmSend
