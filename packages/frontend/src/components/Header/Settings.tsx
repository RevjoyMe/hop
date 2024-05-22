import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import React, { FC, useState } from 'react'
import SettingsIcon from '#assets/settings-icon.svg'
import Typography from '@mui/material/Typography'
import { Alert } from '#components/Alert/index.js'
import { Icon } from '#components/ui/Icon.js'
import { InfoTooltip } from '#components/InfoTooltip/index.js'
import { SmallTextField } from '#components/SmallTextField/index.js'
import { makeStyles } from '@mui/styles'
import { sanitizeNumericalString } from '#utils/index.js'
import { useApp } from '#contexts/AppContext/index.js'

const useStyles = makeStyles((theme: any) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  header: {
    fontSize: '1.7rem',
    fontWeight: 'bold',
  },
  box: {
    marginBottom: '2rem',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'left',
  },
  inlineLabel: {
    marginLeft: '0.5rem',
  },
  settingsContent: {
    padding: '3rem',
    width: '300px',
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      width: 'auto',
    },
  },
  slippageTolerance: {
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: '2rem',
  },
  warningBox: {
    marginTop: '1rem',
  },
}))

export const Settings: FC = () => {
  const styles = useStyles()
  const [open, setOpen] = useState<boolean>(false)
  const { settings } = useApp()
  const { slippageTolerance, setSlippageTolerance, deadlineMinutes, setDeadlineMinutes } = settings
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const handleClick = (event: any) => {
    setOpen(true)
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setOpen(false)
    setAnchorEl(null)
  }

  const handleDeadlineMinutes = (event: any) => {
    const value = sanitizeNumericalString(event.target.value)
    if (!value) {
      setDeadlineMinutes('')
      return
    }

    const num = Number(value)
    if (num > 999 || num < 0) {
      return
    }
    setDeadlineMinutes(num.toString())
  }

  const handleSlippageToleranceChange = (event: any) => {
    const value = sanitizeNumericalString(event.target.value)
    if (!value) {
      setSlippageTolerance('')
      return
    }

    const num = Number(value)
    if (num >= 100 || num < 0) {
      return
    }
    setSlippageTolerance(value)
  }

  const deadlineError = Number(deadlineMinutes) < 10

  return (
    <Box display="flex" alignItems="center">
      <Box alignItems="center" p={[1, 1]} mx={[2, 0]}>
        <IconButton onClick={handleClick}>
          <Icon src={SettingsIcon} width={20} />
        </IconButton>
      </Box>

      <Popover
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <div className={styles.settingsContent}>
          <Box display="flex" flexDirection="column" className={styles.box}>
            <Typography variant="h6" className={styles.header}>
              Transaction Settings
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" className={styles.box}>
            <Typography variant="body1" className={styles.label}>
              Slippage Tolerance{' '}
              <InfoTooltip title="Your transaction will revert if the price changes unfavorably by more than this percentage." />
            </Typography>
            <Box display="flex" alignItems="center" className={styles.slippageTolerance}>
              <IconButton
                color={slippageTolerance === 0.1 ? 'primary' : 'secondary'}
                onClick={() => setSlippageTolerance(0.1)}
              >
                0.1%
              </IconButton>
              <IconButton
                color={slippageTolerance === 0.5 ? 'primary' : 'secondary'}
                onClick={() => setSlippageTolerance(0.5)}
              >
                0.5%
              </IconButton>
              <IconButton
                color={slippageTolerance === 1 ? 'primary' : 'secondary'}
                onClick={() => setSlippageTolerance(1)}
              >
                1%
              </IconButton>
              <SmallTextField
                style={{ width: 80 }}
                value={slippageTolerance}
                units="%"
                onChange={handleSlippageToleranceChange}
                placeholder={slippageTolerance?.toString() || '1.00'}
              />
            </Box>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            className={styles.box}
            style={{ display: 'none' }}
          >
            <Typography variant="body1" className={styles.label}>
              Transaction deadline{' '}
              <InfoTooltip title="Your transaction will revert if it is pending for more than this long." />
            </Typography>
            <Box display="flex" alignItems="center">
              <SmallTextField
                style={{ width: 80 }}
                value={deadlineMinutes}
                onChange={handleDeadlineMinutes}
                placeholder={'20'}
              />{' '}
              <span className={styles.inlineLabel}>minutes</span>
            </Box>
            <Box display="flex" alignItems="center" className={styles.warningBox}>
              {deadlineError ? (
                <div>
                  <Alert
                    severity="warning"
                    text={
                      'Cross-chain transactions take a few minutes. The deadline you set may be too short for the cross chain message to reach its destination.'
                    }
                  />
                </div>
              ) : null}
            </Box>
          </Box>
        </div>
      </Popover>
    </Box>
  )
}
