import styled from 'styled-components'
import { Button } from '#components/Button/Button.js'
import { ComposedStyleProps, composedStyleFns } from '#utils/index.js'

interface StyleProps {
  highlighted?: boolean
  large?: boolean
  flat?: boolean
  size?: number | string
  borderRadius?: any
  children?: any
  onClick?: any
  loading?: boolean
  disabled?: boolean
  secondary?: boolean
  fullWidth?: boolean
}

type StylishButtonProps = ComposedStyleProps & StyleProps

export const StyledButton = styled(Button)<StylishButtonProps>`
  text-transform: 'none';
  white-space: nowrap;

  ${({ large }: any) => {
    if (large) {
      return `
        font-size: 2.2rem;
        padding: 0.8rem 4.2rem;
        height: 5.5rem;
        `
    }
    return `
        font-size: 1.5rem !important;
        padding: 0.8rem 2.8rem;
        height: 4.0rem;
      `
  }};
  ${({ disabled }: any) => {
    if (disabled) {
      return `
        color: #FDF7F9;
        background: none;
      `
    }
  }};
  ${({ highlighted, theme }: any) => (highlighted ? `color: white !important` : `color: ${theme.colors.primary.main}`)};
  ${({ secondary, theme }: any) => secondary && `color: ${theme.colors.secondary.main}`}
  ${({ fullWidth }: any) => fullWidth && `width: 100%`}

  ${composedStyleFns};
`
