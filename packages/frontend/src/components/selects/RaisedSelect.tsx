import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import React, { FC } from 'react'
import Select, { SelectProps } from '@mui/material/Select'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    height: '4.8rem',
    borderRadius: '2.3rem',
    paddingTop: '0.0rem',
    paddingLeft: '1.8rem !important',
    paddingBottom: '0.0rem',
    paddingRight: '2.8rem',
    '& .MuiSelect-select': {
      minHeight: '0',
      padding: '0',
      paddingRight: '2.8rem',
    },
    fontSize: '1.8rem',
    fontWeight: 700,
    lineHeight: '4.6rem',
    '&:focus': {
      borderRadius: '2.3rem',
    },
    boxShadow: theme.boxShadow?.select,
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none'
    }
  },
  selectMenu: {
    paddingRight: '4.8rem',
    height: '4.6rem',
  },
  icon: ({ value }: any) => ({
    top: 'calc(50% - 0.75rem) !important',
    right: '0.8rem !important',
    color: `${value === 'default' ? '#fff' : theme.palette.text.secondary} !important`,
  }),
}))

const RaisedSelect: FC<SelectProps & { children: any }> = props => {
  const styles = useStyles(props)
  const isSingle = Array.from(props?.children).filter((x: any) => x).length <= 1
  const icon = isSingle ? () => null : ArrowDropDownIcon

  return <Select IconComponent={icon} {...props} classes={styles} />
}

export default RaisedSelect
