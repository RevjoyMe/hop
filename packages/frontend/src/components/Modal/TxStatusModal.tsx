import Box from '@mui/material/Box'
import MetaMaskLogo from '#assets/logos/metamask.png'
import React from 'react'
import Transaction from '#models/Transaction.js'
import TxStatusTracker from '#components/Transaction/TxStatusTracker.js'
import Typography from '@mui/material/Typography'
import { Button } from '#components/Button/index.js'
import { Icon } from '#components/ui/Icon.js'
import { Modal } from '#components/Modal/Modal.js'
import { StyledButton } from '#components/Button/StyledButton.js'
import { networkSlugToName } from '#utils/index.js'
import { transferTimeDisplay } from '#utils/transferTimeDisplay.js'
import { useAddTokenToMetamask } from '#hooks/useAddTokenToMetamask.js'
import { useTransactionStatus } from '#hooks/index.js'
import { useTransferTimeEstimate } from '#hooks/useTransferTimeEstimate.js'
import { useTxStatusStyles } from '#components/Transaction/index.js'

type Props = {
  tx: Transaction
  onClose?: () => void
}

export function TxStatusModal(props: Props) {
  const styles = useTxStatusStyles()
  const { onClose, tx } = props
  const handleTxStatusClose = () => {
    if (onClose) {
      onClose()
    }
  }

  const { fixedTimeEstimate, medianTimeEstimate, percentileTimeEstimate } = useTransferTimeEstimate(
    tx.networkName,
    tx.destNetworkName,
    tx?.token?._symbol
  )

  const { completed, destCompleted, confirmations, networkConfirmations } = useTransactionStatus(
    tx,
    tx.networkName
  )
  const { success, addTokenToDestNetwork } = useAddTokenToMetamask(tx.token, tx.destNetworkName)

  function InfoContent(props: any) {
    const { tx, medianTimeEstimate, percentileTimeEstimate, fixedTimeEstimate } = props

    if (tx && tx.token && medianTimeEstimate) {
      return (
        <>
          <Typography variant="body2" color="textSecondary">
            Your {tx.token._symbol ?? 'transfer'}{' '}
            will arrive{' '}
            {
              tx.destNetworkName
              ? `on ${networkSlugToName(tx.destNetworkName)}`
              : "at the destination"
            }
            <strong>{' '}
              { transferTimeDisplay(medianTimeEstimate, fixedTimeEstimate) }
            </strong>{' '}
            after the transaction is confirmed.
          </Typography>
          { medianTimeEstimate > fixedTimeEstimate * 1.5 &&
            <>
              <br />
              <Typography variant="body2" color="textSecondary" style={{ fontStyle: 'italic' }}>
                This estimate is higher than usual and may not reflect current speeds.
              </Typography>
            </>
          }
        </>
      )
    } else if (tx && fixedTimeEstimate) {
      return (
        <Typography variant="body1"><em>{`Your ${tx.token._symbol ?? 'transfer'} will arrive ${tx.destNetworkName ? `on ${networkSlugToName(tx.destNetworkName)}` : "at the destination"} ~${fixedTimeEstimate} minutes after your transaction is confirmed.`}</em></Typography>
      )
    } else {
      return (
        <Typography variant="body1"><em>This may take a few minutes</em></Typography>
      )
    }
  }

  return (
    <Modal onClose={handleTxStatusClose}>
      <TxStatusTracker
        tx={tx}
        completed={completed}
        destCompleted={destCompleted}
        confirmations={confirmations}
        networkConfirmations={networkConfirmations}
      />

      <Box display="flex" alignItems="center" className={styles.txStatusInfo}>
        <Box margin="0 auto" maxWidth="32rem" paddingLeft={3} paddingRight={3}>
          <InfoContent tx={tx} medianTimeEstimate={medianTimeEstimate} percentileTimeEstimate={percentileTimeEstimate} fixedTimeEstimate={fixedTimeEstimate} />
          <br />
        </Box>

        {tx?.token?.symbol && (
          <Box display="flex" mt={2} justifyItems="center">
            <StyledButton onClick={addTokenToDestNetwork}>
              {!success ? (
                <Box display="flex" alignItems="center">
                  <Box mr={2}>Add {tx.token.symbol} to Metamask</Box>
                  <Icon width={20} src={MetaMaskLogo} />
                </Box>
              ) : (
                <Box display="flex" alignItems="center">
                  <Box mr={2}>Added {tx.token.symbol}</Box>
                  <Icon.Circle width={0} stroke="green" />
                </Box>
              )}
            </StyledButton>
          </Box>
        )}

        <Button className={styles.txStatusCloseButton} onClick={handleTxStatusClose}>
          Close
        </Button>
      </Box>
    </Modal>
  )
}
