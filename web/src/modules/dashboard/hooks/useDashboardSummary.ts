'use client'

import { useQuery } from '@tanstack/react-query'

import { getDashboardSummary } from '@/services/dashboard/service'
import type { DashboardPeriod } from '@/types/dashboard'

/**
 * Busca os indicadores de resumo do dashboard (acessos ativos, autorizações e eventos)
 * para o período selecionado.
 */
export function useDashboardSummary(period: DashboardPeriod) {
  return useQuery({
    queryKey: ['dashboard', 'summary', period],
    queryFn: () => getDashboardSummary(period),
  })
}
