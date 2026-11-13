'use client'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

import { ReportModuleCard } from './ReportModuleCard'
import { REPORT_MODULES } from '@/services/relatorios/reportDefs'
import type { ReportModuleKey, ReportsPeriodFilter } from '@/types/relatorios'

type ReportModuleCardsGridProps = {
  filter: ReportsPeriodFilter
  counts: Partial<Record<ReportModuleKey, number>>
  isLoading: boolean
  isError: boolean
}

export function ReportModuleCardsGrid({
  filter,
  counts,
  isLoading,
  isError,
}: ReportModuleCardsGridProps) {
  if (isError) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        Não foi possível carregar os indicadores dos relatórios. Tente novamente.
      </Alert>
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 4,
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      }}
    >
      {Object.values(REPORT_MODULES).map((def) => (
        <ReportModuleCard
          key={def.key}
          def={def}
          total={counts[def.key]}
          isLoading={isLoading}
          filter={filter}
        />
      ))}
    </Box>
  )
}
