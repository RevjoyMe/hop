import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import React from 'react'
import Typography from '@mui/material/Typography'
import hopTokenLogo from '#assets/logos/hop-token-logo.svg'
import { Button } from '#components/Button/index.js'
import { DelegateIcon } from '#pages/Claim/DelegateIcon.js'
import { Icon } from '#components/ui/Icon.js'
import { StyledLink } from '#components/Link/StyledLink.js'
import { correctClaimChain } from './claims.js'
import { getEtherscanLink, getTruncatedHash, toTokenDisplay } from '#utils/index.js'

export function Claiming(props: any) {
  const { claiming, tx, delegate, handleClaimTokens, claimableTokens, showTryAgain } = props

  return (
    <Box display="flex" flexDirection="column">
      <Box my={3} textAlign="left">
        <Typography variant="body1">
          Please approve the transaction to delegate and claim tokens
        </Typography>
      </Box>

      <Box
        display="flex"
        p={3}
        px={4}
        alignItems="center"
        borderRadius={'25px'}
        boxShadow={'0px 4px 25px 10px rgba(255, 255, 255, 0.01)'}
      >
        <Box>
          <DelegateIcon delegate={delegate} />
        </Box>
        <Box p={2} textAlign="left">
          <Box mb={1}>
            <Typography variant="body1">
              Delegate and claim tokens
            </Typography>
          </Box>
          <Box mb={1} display="flex" alignItems="center">
            <Typography variant="body1">
              {toTokenDisplay(claimableTokens, 18)}
            </Typography>
            <Box ml={1} display="flex" alignItems="center">
              <Icon src={hopTokenLogo} alt="HOP" width={24} />
            </Box>
          </Box>
          <Box>
            <Typography variant="body1" color="secondary">
              This transaction happens on-chain and will require paying gas
            </Typography>
          </Box>
        </Box>
      </Box>

      {tx && (
        <Box display="flex" mt={3} justifyContent="center" color="secondary.main">
          Transaction:&nbsp;
          <StyledLink
            href={getEtherscanLink(
              correctClaimChain.id,
              tx.transactionHash || tx.hash,
              'transaction'
            )}
          >
            {getTruncatedHash(tx.transactionHash || tx.hash)} ↗
          </StyledLink>
        </Box>
      )}
      {(showTryAgain && !claiming) && (
        <Box mt={4}>
          <Button large highlighted onClick={handleClaimTokens} disabled={claimableTokens.eq(0)}>
            Try Again
          </Button>
        </Box>
      )}
      {claiming && (
        <Box mt={4}>
          <Button large highlighted disabled={claiming}>
            <Box display="flex" justifyContent="center" alignContent="center">
              <Box mr={1}>
                <CircularProgress size={24} />
              </Box>
              <Box>
                Claiming...
              </Box>
            </Box>
          </Button>
        </Box>
      )}
    </Box>
  )
}
