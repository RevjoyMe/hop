import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Network from 'src/models/Network'
import React, { ChangeEvent, FC, useCallback, useMemo } from 'react'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import clsx from 'clsx'
import { BigNumber, utils } from 'ethers'
import { LargeTextField } from 'src/components/LargeTextField'
import { Token } from '@hop-protocol/sdk'
import { commafy } from 'src/utils'
import { useAmountSelectorCardStyles, useEstimateTxCost } from 'src/hooks'

type AmountSelectorProps = {
  value?: string
  label?: string
  loadingLabel?: boolean
  onChange?: (value: string) => void
  title?: string
  titleIconUrl?: string
  token?: Token
  balance?: BigNumber
  balanceLabel?: string
  loadingBalance?: boolean
  secondaryToken?: Token
  secondaryBalance?: BigNumber
  secondaryBalanceLabel?: string
  loadingSecondaryBalance?: boolean
  loadingValue?: boolean
  disableInput?: boolean
  hideSymbol?: boolean
  hideMaxButton?: boolean
  className?: string
  decimalPlaces?: number
  methodName?: string
  destNetwork?: Network
  selectedNetwork?: Network
  maxButtonLeaveSmallAmount?: boolean
}

export const AmountSelectorCard: FC<AmountSelectorProps> = props => {
  const {
    value = '',
    label,
    loadingLabel = false,
    onChange,
    title,
    titleIconUrl,
    token,
    balance,
    balanceLabel,
    loadingBalance = false,
    secondaryToken,
    secondaryBalance,
    secondaryBalanceLabel,
    loadingSecondaryBalance = false,
    loadingValue = false,
    disableInput = false,
    hideSymbol = false,
    hideMaxButton = false,
    decimalPlaces = 4,
    className,
    methodName,
    destNetwork,
    selectedNetwork,
    maxButtonLeaveSmallAmount = false
  } = props
  const styles = useAmountSelectorCardStyles()
  const { estimateMaxValue } = useEstimateTxCost(selectedNetwork)

  const balanceDisplay = useMemo(() => {
    let label: string = ''
    if (token && balance) {
      label = utils.formatUnits(balance, token?.decimals)
      label = commafy(label, decimalPlaces)
    }
    return label
  }, [token, balance])

  const secondaryBalanceDisplay = useMemo(() => {
    let label: string = ''
    if (secondaryToken && secondaryBalance) {
      label = utils.formatUnits(secondaryBalance, secondaryToken?.decimals)
      label = commafy(label, decimalPlaces)
    }
    return label
  }, [secondaryToken, secondaryBalance])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if (onChange) {
      onChange(value)
    }
  }

  async function getEstimatedMaxValue(methodName: string, options: any) {
    const { balance, token: selectedToken } = options

    if (!selectedToken?.isNativeToken) {
      return ''
    }

    const nativeTokenMaxGasCost = await estimateMaxValue(methodName, options)

    if (nativeTokenMaxGasCost) {
      let totalAmount = balance.sub(nativeTokenMaxGasCost)
      if (totalAmount.lt(0)) {
        totalAmount = BigNumber.from(0)
      }
      if (maxButtonLeaveSmallAmount) {
        const tokenSymbol = options?.token?.symbol
        const smallAmount = tokenSymbol === 'XDAI' || tokenSymbol === 'MATIC' ? utils.parseEther('1') : utils.parseEther('0.001')
        if (tokenSymbol === 'XDAI' || tokenSymbol === 'MATIC' || tokenSymbol === 'ETH') {
          if (totalAmount.gt(smallAmount)) {
            // leave a little bit of native token for gas
            totalAmount = totalAmount.sub(smallAmount)
          }
        }
      }
      return utils.formatUnits(totalAmount, selectedToken.decimals)
    }

    return utils.formatUnits(balance, selectedToken.decimals)
  }

  const handleMaxClick = useCallback(async () => {
    if (!(onChange && balance && token)) {
      return
    }

    let maxValue = utils.formatUnits(balance, token.decimals)

    if (token?.isNativeToken && methodName) {
      const opts = {
        token,
        balance,
        network: selectedNetwork,
        destNetwork,
      }
      maxValue = await getEstimatedMaxValue(methodName, opts)
    }

    onChange(maxValue)
  }, [onChange, token, balance, methodName])

  const handleSecondaryMaxClick = useCallback(async () => {
    if (!(onChange && secondaryBalance && secondaryToken)) {
      return
    }

    let maxValue = utils.formatUnits(secondaryBalance, secondaryToken.decimals)

    if (secondaryToken?.isNativeToken && methodName) {
      const opts = {
        token: secondaryToken,
        balance: secondaryBalance,
        network: selectedNetwork,
      }
      maxValue = await getEstimatedMaxValue(methodName, opts)
    }

    onChange(maxValue)
  }, [onChange, secondaryToken, secondaryBalance, methodName, selectedNetwork])

  return (
    <Card className={clsx(styles.root, className)}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="1.8rem" width="100%">
        {!!label && (
          <Typography variant="subtitle2" color="textSecondary">
            {loadingBalance ? <Skeleton variant="text" width="15.0rem"></Skeleton> : label}
          </Typography>
        )}
        {loadingSecondaryBalance ? (
          <Skeleton variant="text" width="15.0rem"></Skeleton>
        ) : secondaryBalance ? (
          <div className={styles.balance}>
            {!hideMaxButton && secondaryBalance.gt(0) && !disableInput ? (
              <button
                className={styles.maxButton}
                onClick={handleSecondaryMaxClick}
                title="Max amount you can send while still having enough to cover fees"
              >
                MAX
              </button>
            ) : null}
            <Typography variant="subtitle2" color="textSecondary" align="left">
              {secondaryBalanceLabel ?? 'Balance:'} {secondaryBalanceDisplay}
            </Typography>
          </div>
        ) : null}
        {loadingBalance ? (
          <Skeleton variant="text" width="15.0rem"></Skeleton>
        ) : balance ? (
          <div className={styles.balance}>
            {!hideMaxButton && balance.gt(0) && !disableInput ? (
              <button
                className={styles.maxButton}
                onClick={handleMaxClick}
                title="Max amount you can send while still having enough to cover fees"
              >
                MAX
              </button>
            ) : null}
            <Typography variant="subtitle2" color="textSecondary" align="right">
              {balanceLabel ?? 'Balance:'} {balanceDisplay}
            </Typography>
          </div>
        ) : null}
      </Box>

      <Box display="flex" width="100%" justifyContent="space-between" alignItems="center">
        <Box display="flex" width="50%">
          <Box className={styles.networkSelectionBox}>
            {titleIconUrl ? (
              <Box className={styles.networkIconContainer}>
                <img src={titleIconUrl} className={styles.networkIcon} alt={title} />
              </Box>
            ) : null}
            <Typography variant="subtitle2" className={styles.networkLabel}>
              {title}
            </Typography>
          </Box>
        </Box>

        <Box display="flex">
          <LargeTextField
            value={value}
            onChange={handleInputChange}
            placeholder="0.0"
            units={hideSymbol ? '' : token?.symbol}
            disabled={disableInput}
            loadingValue={loadingValue}
          />
        </Box>
      </Box>
    </Card>
  )
}
