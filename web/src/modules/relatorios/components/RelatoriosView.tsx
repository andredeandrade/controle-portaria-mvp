'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { ReportModuleCardsGrid } from './ReportModuleCardsGrid'
import { ReportsPeriodFilterCard } from './ReportsPeriodFilterCard'
import { useReportCounts } from '../hooks/useReportCounts'
import { getPeriodLabel } from '../utils/periodLabel'
import { exportAllReports } from '@/services/relatorios/export'
import { useAppSnackbar } from '@/providers/AppSnackbarProvider'
import type { ReportsPeriodFilter } from '@/types/relatorios'

const DEFAULT_FILTER: ReportsPeriodFilter = { from: '', to: '', shortcut: 'todos' }

export function RelatoriosView() {
  const [filter, setFilter] = useState<ReportsPeriodFilter>(DEFAULT_FILTER)
  const [exportingAll, setExportingAll] = useState(false)

  const { showSuccess, showError } = useAppSnackbar()
  const { counts, isLoading, isError } = useReportCounts(filter)

  const totalGeral = Object.values(counts).reduce((sum, value) => sum + (value ?? 0), 0)

  async function handleExportAll() {
    setExportingAll(true)

    try {
      await exportAllReports(filter)
      showSuccess('Relatórios exportados com sucesso.')
    } catch {
      showError('Não foi possível exportar todos os relatórios.')
    } finally {
      setExportingAll(false)
    }
  }

  return (
    <Stack spacing={5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={4}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Box>
          <Typography variant="h2" fontWeight={700} color="text.primary">
            Relatórios
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: '4px' }}>
            Volume de registros por módulo no período selecionado. Exporte cada base individualmente
            ou todas de uma vez.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={exportingAll ? <CircularProgress size={16} color="inherit" /> : undefined}
          disabled={exportingAll}
          onClick={handleExportAll}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Exportar todos
        </Button>
      </Stack>

      <ReportsPeriodFilterCard filter={filter} onChange={setFilter} />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Período:{' '}
          <Box component="span" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
            {getPeriodLabel(filter)}
          </Box>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {totalGeral} registros no total
        </Typography>
      </Box>

      <ReportModuleCardsGrid
        filter={filter}
        counts={counts}
        isLoading={isLoading}
        isError={isError}
      />
    </Stack>
  )
}
