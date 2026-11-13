'use client'

import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { TextField } from '@/modules/form'
import type { DashboardPeriod } from '@/types/dashboard'

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'today', label: 'Hoje' },
  { value: 'last7days', label: 'Últimos 7 dias' },
  { value: 'month', label: 'Este mês' },
]

type DashboardSummaryPeriodSelectProps = {
  value: DashboardPeriod
  onChange: (value: DashboardPeriod) => void
}

export function DashboardSummaryPeriodSelect({
  value,
  onChange,
}: DashboardSummaryPeriodSelectProps) {
  return (
    <Stack spacing={1.5} sx={{ width: { xs: '100%', sm: 220 } }}>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        Período
      </Typography>

      <TextField
        select
        value={value}
        onChange={(event) => onChange(event.target.value as DashboardPeriod)}
      >
        {PERIOD_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  )
}
