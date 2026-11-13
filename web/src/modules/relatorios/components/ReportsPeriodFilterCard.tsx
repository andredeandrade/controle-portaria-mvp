'use client'

import DateRangeIcon from '@mui/icons-material/DateRange'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { TextField } from '@/modules/form'
import { useAppSnackbar } from '@/providers/AppSnackbarProvider'
import type { ReportPeriodShortcut, ReportsPeriodFilter } from '@/types/relatorios'

const SHORTCUTS: Array<{ value: ReportPeriodShortcut; label: string }> = [
  { value: 'hoje', label: 'Hoje' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: 'mes', label: 'Este mês' },
  { value: 'todos', label: 'Todo o período' },
]

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function shortcutToRange(shortcut: ReportPeriodShortcut): { from: string; to: string } {
  const today = new Date()

  if (shortcut === 'hoje') {
    const todayIso = toIsoDate(today)
    return { from: todayIso, to: todayIso }
  }

  if (shortcut === '7') {
    const from = new Date(today)
    from.setDate(from.getDate() - 6)
    return { from: toIsoDate(from), to: toIsoDate(today) }
  }

  if (shortcut === '30') {
    const from = new Date(today)
    from.setDate(from.getDate() - 29)
    return { from: toIsoDate(from), to: toIsoDate(today) }
  }

  if (shortcut === 'mes') {
    const from = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from: toIsoDate(from), to: toIsoDate(today) }
  }

  return { from: '', to: '' }
}

const EMPTY_FILTER: ReportsPeriodFilter = { from: '', to: '', shortcut: 'todos' }

type ReportsPeriodFilterCardProps = {
  filter: ReportsPeriodFilter
  onChange: (filter: ReportsPeriodFilter) => void
}

export function ReportsPeriodFilterCard({ filter, onChange }: ReportsPeriodFilterCardProps) {
  const { showSuccess } = useAppSnackbar()
  // Rascunho local: o filtro só é propagado ao clicar em "Aplicar", para permitir
  // ajustar data inicial/final sem disparar buscas a cada tecla digitada.
  const [draft, setDraft] = useState<ReportsPeriodFilter>(filter)

  function handleShortcutClick(shortcut: ReportPeriodShortcut) {
    const range = shortcutToRange(shortcut)
    setDraft({ ...range, shortcut })
  }

  function handleClear() {
    setDraft(EMPTY_FILTER)
    onChange(EMPTY_FILTER)
  }

  function handleApply() {
    onChange(draft)
    showSuccess('Filtro aplicado.')
  }

  return (
    <Paper sx={{ p: 5, borderRadius: 2 }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DateRangeIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Filtro de Período
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
            alignItems: { xs: 'stretch', sm: 'flex-end' },
            flexWrap: 'wrap',
          }}
        >
          <Stack spacing={1} sx={{ width: { xs: '100%', sm: 180 } }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Data inicial
            </Typography>
            <TextField
              type="date"
              value={draft.from}
              onChange={(e) => setDraft({ from: e.target.value, to: draft.to, shortcut: null })}
            />
          </Stack>

          <Stack spacing={1} sx={{ width: { xs: '100%', sm: 180 } }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Data final
            </Typography>
            <TextField
              type="date"
              value={draft.to}
              onChange={(e) => setDraft({ from: draft.from, to: e.target.value, shortcut: null })}
            />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ pb: '2px', width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              onClick={handleClear}
              sx={{ flex: { xs: 1, sm: 'initial' } }}
            >
              Limpar
            </Button>
            <Button
              variant="contained"
              onClick={handleApply}
              sx={{ flex: { xs: 1, sm: 'initial' } }}
            >
              Aplicar
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexWrap: 'wrap',
            pt: 4,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {SHORTCUTS.map((shortcut) => (
            <Chip
              key={shortcut.value}
              label={shortcut.label}
              color="primary"
              variant={draft.shortcut === shortcut.value ? 'filled' : 'outlined'}
              onClick={() => handleShortcutClick(shortcut.value)}
            />
          ))}
        </Box>
      </Stack>
    </Paper>
  )
}
