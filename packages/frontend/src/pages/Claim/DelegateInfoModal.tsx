import Box from '@mui/material/Box'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import Typography from '@mui/material/Typography'
import remarkGfm from 'remark-gfm'
import { Button } from '#components/Button/index.js'
import { Link } from '#components/Link/index.js'
import { Modal } from '#components/Modal/index.js'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme: any) => ({
  root: {
    '& a': {
      textDecoration: 'none',
      color: theme.palette.primary.main
    }
  }
}))

interface Props {
  onClose: () => void
  delegate: any
}

export const DelegateInfoModal = (props: Props) => {
  const { onClose, delegate } = props
  const styles = useStyles()

  function handleClose() {
    onClose()
  }

  return (
    <Modal onClose={handleClose}>
      <Box display="flex" flexDirection="column" textAlign="left">
        <Box mb={2} display="flex" flexDirection="column">
          <Box mb={4} display="flex" flexDirection="column">
            <Typography variant="body1" color="textPrimary">
              Delegate&nbsp;
              <Link
                target="_blank" rel="noopener noreferrer"
                href={delegate.infoUrl}
              >submission</Link>&nbsp;for <strong>{delegate.ensName}</strong>
            </Typography>
          </Box>
          <Box style={{ maxHeight: '100%', overflow: 'auto', wordBreak: 'break-word' }} className={styles.root}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{delegate.info?.trim()}</ReactMarkdown>
          </Box>
        </Box>
        <Box mt={3} display="flex">
          <Button
            onClick={() => {
              handleClose()
            }}
            large
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

