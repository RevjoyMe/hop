import InputAdornment from '@mui/material/InputAdornment'
import MuiTextField, { TextFieldProps } from '@mui/material/TextField'
import React, { FC, ReactNode } from 'react'
import Typography from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'

type SmallTextFieldProps = {
  units?: string | ReactNode
  centerAlign?: boolean | undefined
} & TextFieldProps

interface StyleProps {
  centerAlign: boolean
}

const useStyles = makeStyles(theme => ({
  root: {},
  adornment: {
    marginRight: '0 !important',
    fontSize: '1.4rem !important',
  },
}))

const useInputStyles = makeStyles(theme => ({
  root: (props: StyleProps) => ({
    padding: '0.1rem 0.4rem',
    borderRadius: '2rem',
    boxShadow: theme.boxShadow.input.normal,
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none'
    },
  }),
  input: ({ centerAlign }: StyleProps) => ({
    textAlign: centerAlign ? 'center' : 'right',
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    color: theme.palette.text.primary,
    textOverflow: 'ellipsis',
  }),
  focused: {
    borderRadius: '2rem',
    boxShadow: theme.boxShadow.input.normal,
  },
}))

export const SmallTextField: FC<SmallTextFieldProps> = props => {
  const { units, centerAlign = false, ...textFieldProps } = props
  const styles = useStyles()
  const inputStyles = useInputStyles({ centerAlign })

  return (
    <MuiTextField
      className={styles.root}
      InputProps={{
        classes: inputStyles,
        endAdornment: units ? (
          <InputAdornment position="end">
            <Typography variant="h4" color="textPrimary" className={styles.adornment}>
              {units}
            </Typography>
          </InputAdornment>
        ) : null,
      } as any }
      {...textFieldProps}
    ></MuiTextField>
  )
}
