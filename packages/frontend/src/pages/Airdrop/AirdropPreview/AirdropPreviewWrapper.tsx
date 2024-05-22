import Box from '@mui/material/Box'
import React from 'react'
import { useThemeMode } from '#theme/ThemeProvider.js'

export const respMaxWidths = [350, 624, 824]

export function AirdropPreviewWrapper({ children }) {
  const { isDarkMode } = useThemeMode()

  return (
    <Box display="flex" justifyContent="center" width="100%">
      <Box
        display="flex"
        justifyContent="center" flexDirection="column"
        p={['18px 24px', '36px 46px']}
        mx={[0, 4]}
        maxWidth={respMaxWidths}
        borderRadius={30}
        boxShadow={isDarkMode ? 'innerDark' : 'innerLight'}
        mt={2}
      >
        {children}
      </Box>
    </Box>
  )
}
