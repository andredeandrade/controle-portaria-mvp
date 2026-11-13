'use client'

import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type ListErrorStateProps = {
  title: string
  message: string
  onRetry: () => void
}

export function ListErrorState({ title, message, onRetry }: ListErrorStateProps) {
  return (
    <Stack alignItems="center" spacing={2} sx={{ textAlign: 'center', py: 8, px: 4 }}>
      <ErrorOutlineRoundedIcon sx={{ fontSize: 40, color: 'error.main' }} />
      <Stack spacing={0.5}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Stack>
      <Button variant="outlined" onClick={onRetry}>
        Tentar novamente
      </Button>
    </Stack>
  )
}
