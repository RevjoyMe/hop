import Box from '@mui/material/Box'
import React from 'react'
import Typography from '@mui/material/Typography'
import { Button } from '#components/Button/index.js'
import { Modal } from '#components/Modal/index.js'

interface Props {
  onClose: () => void
  onSubmit: (value: boolean) => void
}

export const DelegateConfirmModal = (props: Props) => {
  const { onSubmit, onClose } = props

  function handleClick(value: boolean) {
    onSubmit(value)
  }

  function handleClose() {
    onClose()
  }

  return (
    <Modal onClose={handleClose}>
      <Box display="flex" flexDirection="column" justifyContent="center" textAlign="center">
        <Box mb={2} display="flex" flexDirection="column">
          <Typography variant="h5" color="textPrimary">
            Are you sure?
          </Typography>
        </Box>
        <Box mb={2} display="flex" flexDirection="column">
          <Typography variant="body1" color="textPrimary">
            This delegate already has a lot of votes.
          </Typography>
          <Typography variant="body1" color="textPrimary">
            Choosing a delegate with less votes is better to reduce centralization.
          </Typography>
        </Box>
        <Box mt={3} display="flex">
          <Button
            onClick={() => {
              handleClick(true)
            }}
            large
          >
            Yes
          </Button>
          <Button
            onClick={() => {
              handleClick(false)
            }}
            large
          >
            No
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

