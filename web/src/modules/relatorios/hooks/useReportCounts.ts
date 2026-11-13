'use client'

import { useQueries } from '@tanstack/react-query'

import { REPORT_MODULES } from '@/services/relatorios/reportDefs'
import { fetchReportPage } from '@/services/relatorios/service'
import type { ReportModuleKey, ReportsPeriodFilter } from '@/types/relatorios'

function paramsFromFilter(filter: ReportsPeriodFilter): URLSearchParams {
  const params = new URLSearchParams()

  if (filter.from && filter.to) {
    params.set('from', filter.from)
    params.set('to', filter.to)
  }

  params.set('page', '1')
  params.set('pageSize', '1')

  return params
}

/**
 * Busca, em paralelo, o total de registros de cada módulo de relatório
 * respeitando o filtro de período atual.
 */
export function useReportCounts(filter: ReportsPeriodFilter) {
  const moduleKeys = Object.keys(REPORT_MODULES) as ReportModuleKey[]

  const results = useQueries({
    queries: moduleKeys.map((moduleKey) => ({
      queryKey: ['reports', 'count', moduleKey, filter.from, filter.to],
      queryFn: () =>
        fetchReportPage(REPORT_MODULES[moduleKey].bffPath, paramsFromFilter(filter)),
      staleTime: 30_000,
    })),
  })

  const counts: Partial<Record<ReportModuleKey, number>> = {}

  results.forEach((result, index) => {
    if (result.data) {
      counts[moduleKeys[index]] = result.data.pagination.total
    }
  })

  return {
    counts,
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
  }
}
