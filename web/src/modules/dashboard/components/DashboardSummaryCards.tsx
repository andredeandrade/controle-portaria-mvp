'use client'

import { useState } from 'react'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import EventIcon from '@mui/icons-material/Event'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { SummaryCard } from '@/modules/relatorios/components/SummaryCard'
import type { DashboardPeriod } from '@/types/dashboard'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import { DashboardSummaryPeriodSelect } from './DashboardSummaryPeriodSelect'

export function DashboardSummaryCards() {
  const [period, setPeriod] = useState<DashboardPeriod>('today')
  const { data, isLoading, isError } = useDashboardSummary(period)

  return (
    <Stack spacing={2}>
      <DashboardSummaryPeriodSelect value={period} onChange={setPeriod} />

      {isError ? (
        <Alert severity="error">Não foi possível carregar os indicadores. Tente novamente.</Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
          }}
        >
          <SummaryCard
            label="Acessos Ativos"
            value={data?.totalActiveAccesses}
            isLoading={isLoading}
            icon={AccessTimeIcon}
            color="success.main"
          />
          <SummaryCard
            label="Autorizações"
            value={data?.totalAuthorizations}
            isLoading={isLoading}
            icon={AssignmentIndIcon}
            color="secondary.main"
          />
          <Box sx={{ gridColumn: { xs: 'span 2', sm: 'auto' } }}>
            <SummaryCard
              label="Eventos"
              value={data?.totalEvents}
              isLoading={isLoading}
              icon={EventIcon}
              color="primary.main"
            />
          </Box>
        </Box>
      )}
    </Stack>
  )
}
