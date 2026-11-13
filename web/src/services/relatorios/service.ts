import { getApiErrorMessage, safeReadJson } from '@/services/shared/http'

export class ReportsServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ReportsServiceError'
  }
}

export type ReportPage<T> = {
  items: T[]
  pagination: { total: number; page: number; pageSize: number; totalPages: number }
}

export async function fetchReportPage<T>(
  path: string,
  params?: URLSearchParams,
): Promise<ReportPage<T>> {
  const query = params?.toString()
  const url = query ? `${path}?${query}` : path

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  const payload = (await safeReadJson(response)) as ReportPage<T>

  if (!response.ok) {
    throw new ReportsServiceError(
      getApiErrorMessage(payload, 'Não foi possível carregar os dados do relatório.'),
    )
  }

  return payload
}
