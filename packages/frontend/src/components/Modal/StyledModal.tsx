import Card, { CardProps } from '@mui/material/Card'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import React, { forwardRef, useCallback, useEffect } from 'react'
import clsx from 'clsx'
import { Theme } from '@mui/material/styles'
import { Transition } from 'react-transition-group'
import { makeStyles } from '@mui/styles'
import { useApp } from '#contexts/AppContext/index.js'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 4,
    overflow: 'auto',
    transition: 'background 0.1s ease-out',
    background: '#00000070',
    '&.entering': {
      background: 'transparent',
    },
    '&.entered': {
      background: '#f4f4f491',
    },
    '&.exiting': {
      background: '#f4f4f491',
    },
    '&.exited': {
      background: 'transparent',
    },
  },
  close: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '2rem',
    display: 'inline-block',
    color: '#000',
    opacity: 0.4,
    fontSize: '2rem',
    fontWeight: 'bold',
    zIndex: 1,
    '&:hover': {
      color: '#000',
      opacity: 0.6,
      cursor: 'pointer',
    },
  },
  container: {
    position: 'fixed',
    width: '100%',
    maxWidth: '560px',
    height: 'auto',
    overflow: 'auto',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.15s ease-out',
    padding: '5rem',
    '&.entering': {
      opacity: 0,
      transform: 'translate(-50%, -50%) scale(0.8)',
    },
    '&.entered': {
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1)',
    },
    '&.exiting': {
      opacity: 0,
      transform: 'translate(-50%, -50%) scale(0.6)',
    },
    '&.exited': {
      opacity: 0,
      transform: 'translate(-50%, -50%) scale(0)',
    },
    [theme.breakpoints.down('xs')]: {
      maxWidth: '90%',
    },
  },
  card: {
    position: 'relative',
    padding: 0,
    overflow: 'auto',
    maxHeight: '100%',
  },
}))

export type ActivityDetailsProps = {
  onClose?: () => void
} & CardProps

export const StyledModal = forwardRef<HTMLElement, Partial<ActivityDetailsProps>>(
  function StyledModal(props, ref) {
    const { children, onClose } = props
    const styles = useStyles()
    const { events } = useApp()
    const keypress = events?.keypress
    const handleClose = useCallback(() => {
      if (onClose) {
        onClose()
      }
    }, [onClose])

    useEffect(() => {
      keypress?.on('escape', handleClose)
      return () => {
        keypress?.off('escape', handleClose)
      }
    }, [keypress, handleClose])

    return (
      <ClickAwayListener onClickAway={handleClose}>
        <Transition
          in={true}
          timeout={{
            appear: 0,
            enter: 0,
            exit: 0,
          }}
          appear={true}
          unmountOnExit={false}
        >
          {(transitionState: string) => (
            <div className={clsx(styles.root, transitionState)}>
              <Transition
                in={true}
                timeout={{
                  appear: 0,
                  enter: 0,
                  exit: 0,
                }}
                appear={true}
                unmountOnExit={false}
              >
                <div className={clsx(styles.container, transitionState)}>
                  <ClickAwayListener
                    onClickAway={handleClose}
                    mouseEvent="onMouseDown"
                    touchEvent="onTouchStart"
                  >
                    <Card className={styles.card}>
                      <div className={styles.close} onClick={handleClose}>
                        ✕
                      </div>
                      <div>{children}</div>
                    </Card>
                  </ClickAwayListener>
                </div>
              </Transition>
            </div>
          )}
        </Transition>
      </ClickAwayListener>
    )
  }
)
