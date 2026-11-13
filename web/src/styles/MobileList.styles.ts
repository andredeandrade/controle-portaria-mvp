'use client'

import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

export const MobileListCard = styled(Paper)(({ theme }) => ({
  padding: 16,
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  borderColor: theme.palette.divider,
  boxShadow: 'none',
}))

export const MobileFieldLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}))
