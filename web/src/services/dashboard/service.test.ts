import { beforeEach, describe, expect, it } from 'vitest'

import { getFetchCall, jsonResponse, mockFetch, textResponse, type FetchMock } from '@test/fetch'

import { DashboardServiceError, getDashboardSummary } from './service'

describe('services/dashboard', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it('consulta /api/dashboard com o período', async () => {
    const resumo = { totalActiveAccesses: 3, totalAuthorizations: 2, totalEvents: 1 }
    fetchMock.mockResolvedValueOnce(jsonResponse(resumo))

    await expect(getDashboardSummary('last7days')).resolves.toEqual(resumo)

    const call = getFetchCall(fetchMock)
    expect(call.url).toBe('/api/dashboard?period=last7days')
    expect(call.init.method).toBe('GET')
  })

  it('lança DashboardServiceError com a mensagem do BFF ou o fallback', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'Não autenticado.' }, 401))
      .mockResolvedValueOnce(textResponse('<html>502</html>', 502))

    const error = await getDashboardSummary('today').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(DashboardServiceError)
    expect(error).toHaveProperty('message', 'Não autenticado.')

    await expect(getDashboardSummary('today')).rejects.toThrow(
      'Não foi possível carregar os indicadores do dashboard.',
    )
  })
})
