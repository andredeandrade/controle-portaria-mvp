import { beforeEach, describe, expect, it } from 'vitest'

import { getFetchCall, jsonResponse, mockFetch, textResponse, type FetchMock } from '@test/fetch'

import { ReportsServiceError, fetchReportPage } from './service'

const PAGINA = {
  items: [{ id: 'r-1' }],
  pagination: { total: 1, page: 1, pageSize: 50, totalPages: 1 },
}

describe('services/relatorios fetchReportPage', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it('anexa os parâmetros à rota do BFF', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(PAGINA))

    await expect(
      fetchReportPage('/api/reports/visitors', new URLSearchParams({ from: '2026-11-01' })),
    ).resolves.toEqual(PAGINA)

    expect(getFetchCall(fetchMock).url).toBe('/api/reports/visitors?from=2026-11-01')
  })

  it('não adiciona "?" sem parâmetros', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(PAGINA))

    await fetchReportPage('/api/reports/visitors', new URLSearchParams())

    expect(getFetchCall(fetchMock).url).toBe('/api/reports/visitors')
  })

  it('lança ReportsServiceError com a mensagem do BFF ou o fallback', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'Sem permissão.' }, 403))
      .mockResolvedValueOnce(textResponse('<html>500</html>', 500))

    const error = await fetchReportPage('/api/reports/events').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ReportsServiceError)
    expect(error).toHaveProperty('message', 'Sem permissão.')

    await expect(fetchReportPage('/api/reports/events')).rejects.toThrow(
      'Não foi possível carregar os dados do relatório.',
    )
  })
})
