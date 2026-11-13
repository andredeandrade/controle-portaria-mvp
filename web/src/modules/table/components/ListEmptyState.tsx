'use client'

import type { ReactNode } from 'react'
import InboxRoundedIcon from '@mui/icons-material/InboxRounded'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type ListEmptyStateProps = {
  title: string
  description: string
  actions?: ReactNode
}

export function ListEmptyState({ title, description, actions }: ListEmptyStateProps) {
  return (
    <Stack alignItems="center" spacing={2} sx={{ textAlign: 'center', py: 8, px: 4 }}>
      <InboxRoundedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
      <Stack spacing={0.5}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
      {actions ? (
        <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
          {actions}
        </Stack>
      ) : null}
    </Stack>
  )
}
