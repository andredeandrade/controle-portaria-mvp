import { getApiErrorMessage, safeReadJson } from '@/services/shared/http'
import type { DashboardPeriod, DashboardSummary } from '@/types/dashboard'

export class DashboardServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DashboardServiceError'
  }
}

export async function getDashboardSummary(period: DashboardPeriod): Promise<DashboardSummary> {
  const response = await fetch(`/api/dashboard?period=${period}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  const payload = (await safeReadJson(response)) as DashboardSummary

  if (!response.ok) {
    throw new DashboardServiceError(
      getApiErrorMessage(payload, 'Não foi possível carregar os indicadores do dashboard.'),
    )
  }

  return payload
}
