import Box from '@mui/material/Box'
import React, { useMemo } from 'react'
import RightArrow from '@mui/icons-material/ArrowRightAlt'
import { TransactionStatus, useTxStatusStyles } from '#components/Transaction/index.js'
import { findNetworkBySlug } from '#utils/networks.js'

function TxStatusTracker({ tx, completed, destCompleted, confirmations, networkConfirmations }) {
  const styles = useTxStatusStyles()
  const network = useMemo(() => findNetworkBySlug(tx.networkName), [tx])

  return (
    <Box mb={4}>
      <Box display="flex" justifyContent="space-around" alignItems="center">
        {network && (
          <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" width="5em">
            {/* <Icon src={network?.imageUrl} /> */}
            {/* <Box>{network.name}</Box> */}
            <Box mt={2}>Source</Box>
          </Box>
        )}
        {tx.destNetworkName !== tx.networkName && (
          <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" width="5em">
            {/* <Icon src={destNetwork?.imageUrl} /> */}
            {/* <Box>{destNetwork?.name}</Box> */}
            <Box mt={2}>Destination</Box>
          </Box>
        )}
      </Box>

      <Box display="flex" justifyContent="space-evenly" alignItems="center" mt={3}>
        <TransactionStatus
          txConfirmed={completed}
          link={tx.explorerLink}
          networkName={tx.networkName}
          destNetworkName={tx.destNetworkName}
          styles={styles}
          confirmations={confirmations}
          networkWaitConfirmations={networkConfirmations}
        />

        {tx.destNetworkName !== tx.networkName && (
          <>
            <div>
              <RightArrow fontSize="large" color="primary" />
            </div>
            <TransactionStatus
              srcConfirmed={completed}
              txConfirmed={destCompleted}
              link={tx.destExplorerLink}
              destNetworkName={tx.destNetworkName}
              networkName={tx.networkName}
              destTx
              styles={styles}
            />
          </>
        )}
      </Box>
    </Box>
  )
}

export default TxStatusTracker
