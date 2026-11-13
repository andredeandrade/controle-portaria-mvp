'use client'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'

import { LoginFormFields } from './LoginFormFields'

export function LoginForm() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (isMobile) {
    return (
      <Box sx={{ width: 380, maxWidth: '100%' }} px={5}>
        <LoginFormFields />
      </Box>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        width: 380,
        maxWidth: '100%',
        p: 10,
        borderRadius: 2,
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.common.white, 0.06),
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      <LoginFormFields />
    </Paper>
  )
}
