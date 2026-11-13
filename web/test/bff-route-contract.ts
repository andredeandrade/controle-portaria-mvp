import { beforeEach, describe, expect, it } from 'vitest'

import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth/session'

import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from './fetch'
import { TEST_ACCESS_TOKEN, deletedCookies, resetCookies, signIn } from './next-headers'

type RouteContract = {
  /** Ex.: `GET /api/residents`. */
  name: string
  /** Invoca o handler com uma `Request` nova a cada chamada. */
  invoke: () => Promise<Response>
  /** Mensagem do 401 quando não há cookie (há variações com/sem acento). */
  unauthenticatedMessage: string
  /** Requisição esperada para a API Express. */
  upstream: { method: string; url: string; body?: unknown }
  /** Resposta da API Express no caminho feliz. */
  apiResponse: { body: unknown; status?: number }
  /** Status devolvido pelo BFF no caminho feliz (`204` implica corpo vazio). */
  successStatus: number
  networkErrorMessage: string
}

const API_BASE = 'http://api.test/api'

/**
 * Contrato comum dos Route Handlers autenticados do BFF: cookie → 401, repasse
 * do JWT, tradução de erro da API Express e limpeza do cookie em 401/403.
 * Os `fetch` à API são a fronteira mockada; `cookies()` vem de `next-headers.ts`
 * (o arquivo de teste precisa declarar o `vi.mock('next/headers', ...)`).
 */
export function describeProtectedRouteContract(contract: RouteContract): void {
  const { invoke, upstream } = contract

  describe(`${contract.name} (contrato do BFF)`, () => {
    let fetchMock: FetchMock

    beforeEach(() => {
      fetchMock = mockFetch()
      resetCookies()
    })

    it('responde 401 sem cookie de sessão e não chama a API', async () => {
      const response = await invoke()

      expect(response.status).toBe(401)
      await expect(response.json()).resolves.toEqual({ message: contract.unauthenticatedMessage })
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('repassa o JWT do cookie e devolve o payload da API', async () => {
      signIn()
      fetchMock.mockResolvedValueOnce(
        contract.apiResponse.status === 204
          ? new Response(null, { status: 204 })
          : jsonResponse(contract.apiResponse.body, contract.apiResponse.status ?? 200),
      )

      const response = await invoke()

      expect(response.status).toBe(contract.successStatus)
      if (contract.successStatus === 204) {
        await expect(response.text()).resolves.toBe('')
      } else {
        await expect(response.json()).resolves.toEqual(contract.apiResponse.body)
      }

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const call = getFetchCall(fetchMock)
      expect(call.url).toBe(`${API_BASE}${upstream.url}`)
      expect(call.init.method).toBe(upstream.method)
      expect(call.headers.get('Authorization')).toBe(`Bearer ${TEST_ACCESS_TOKEN}`)
      if (upstream.body !== undefined) {
        expect(JSON.parse(String(call.init.body))).toEqual(upstream.body)
      }
      expect(deletedCookies).toEqual([])
    })

    it.each([401, 403])('em %i da API repassa o status e apaga o cookie', async (status) => {
      signIn()
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Token inválido.' }, status))

      const response = await invoke()

      expect(response.status).toBe(status)
      await expect(response.json()).resolves.toEqual({ message: 'Token inválido.' })
      expect(deletedCookies).toEqual([ACCESS_TOKEN_COOKIE_NAME])
    })

    it.each([
      [404, 'Registro não encontrado neste condomínio.'],
      [409, 'Conflito de negócio.'],
      [500, 'Erro interno.'],
    ])('em %i da API repassa status e mensagem sem apagar o cookie', async (status, error) => {
      signIn()
      fetchMock.mockResolvedValueOnce(jsonResponse({ error }, status))

      const response = await invoke()

      expect(response.status).toBe(status)
      await expect(response.json()).resolves.toEqual({ message: error })
      expect(deletedCookies).toEqual([])
    })

    it('responde 502 quando a API está inacessível', async () => {
      signIn()
      fetchMock.mockRejectedValue(new TypeError('fetch failed'))

      const response = await invoke()

      expect(response.status).toBe(502)
      await expect(response.json()).resolves.toEqual({ message: contract.networkErrorMessage })
      expect(deletedCookies).toEqual([])
    })
  })
}

/** Monta uma `Request` para o BFF no host do tenant de demonstração. */
export function bffRequest(path: string, init: { method?: string; body?: unknown } = {}): Request {
  const { method = 'GET', body } = init

  return new Request(`http://demo.localhost:3000${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  })
}

/** Segundo argumento dos handlers de rotas dinâmicas (`[id]`). */
export function routeParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) }
}
