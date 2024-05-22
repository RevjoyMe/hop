import Box from '@mui/material/Box'
import React, { FC } from 'react'
import Typography from '@mui/material/Typography'
import clsx from 'clsx'
import { InfoTooltip } from '#components/InfoTooltip/index.js'
import { Theme } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'

export type DetailRowProps = {
  title: string
  value?: any
  tooltip?: React.ReactNode
  highlighted?: boolean
  large?: boolean
  xlarge?: boolean
  bold?: boolean
  contrastText?: boolean
}

type StyleProps = {
  highlighted: boolean
  bold: boolean
  contrastText: boolean
}

const useStyles = makeStyles<Theme, StyleProps>((theme: any) => {
  const label = {
    width: '100% !important',
    color: ({ highlighted, contrastText }) => {
      if (highlighted) {
        return `${theme.palette.primary.main} !important`
      } else if (contrastText) {
        return 'white !important'
      } else {
        return `${theme.palette.text.secondary} !important`
      }
    },
    fontWeight: ({ bold }) => (bold ? 800 : 700),
  }

  return {
    detailLabel: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
    label,
    xlabel: Object.assign(
      {
        fontSize: '2.8rem',
        textAlign: 'right',
        width: '100%',
        whiteSpace: 'nowrap',
        [theme.breakpoints.down('xs')]: {
          fontSize: '2rem',
        },
      } as any,
      label
    ),
    mobileFlexColumn: {
      '@media (max-width: 550px)': {
        flexDirection: 'column',
        justifyContent: 'flex-end',
      },
    },
    noop: {}
  }
})

export const DetailRow: FC<DetailRowProps> = props => {
  const {
    title,
    tooltip,
    value,
    highlighted = false,
    large = false,
    xlarge = false,
    bold = false,
    contrastText = false,
  } = props
  const styles = useStyles({ highlighted, bold, contrastText })
  const variant = xlarge || large ? 'h6' : 'subtitle2'

  return (
    <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" mt="1rem" className={xlarge ? styles.mobileFlexColumn : styles.noop}>
      <Typography
        variant={variant}
        color="textSecondary"
        className={clsx(styles.detailLabel, styles.label)}
      >
        <Box display="column" flexWrap="wrap">
          {title}&nbsp;
        </Box>
        {tooltip ? <InfoTooltip title={tooltip} /> : null}
      </Typography>
      <Typography
        align="right"
        variant={variant}
        color="textSecondary"
        className={xlarge ? styles.xlabel : styles.label}
      >
        {value || '•'}
      </Typography>
    </Box>
  )
}
