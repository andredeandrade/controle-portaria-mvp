'use client'

import Chip from '@mui/material/Chip'

type AccessStatusChipProps = {
  hasExited: boolean
}

const STATUS_CHIP = {
  exited: { label: 'Saiu', bg: 'rgba(255, 255, 255, 0.08)', color: '#9aa1ab' },
  inside: { label: 'No local', bg: 'rgba(52, 211, 153, 0.16)', color: '#34d399' },
} as const

export function AccessStatusChip({ hasExited }: AccessStatusChipProps) {
  const status = hasExited ? STATUS_CHIP.exited : STATUS_CHIP.inside

  return (
    <Chip
      label={status.label}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.6875rem',
        fontWeight: 600,
        backgroundColor: status.bg,
        color: status.color,
        border: 'none',
        alignSelf: 'flex-start',
      }}
    />
  )
}
