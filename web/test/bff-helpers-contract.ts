import { beforeEach, describe, expect, it } from 'vitest'

import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth/session'

import { getFetchCall, jsonResponse, mockFetch, textResponse, type FetchMock } from './fetch'

type DomainApiError = Error & { status: number; clearCookie: boolean }

type DomainHelpersContract = {
  /** Caminho do recurso na API Express, ex.: `/residents`. */
  resourcePath: string
  request: (path: string, accessToken: string, init: RequestInit) => Promise<unknown>
  ApiError: new (message: string, status: number, clearCookie?: boolean) => DomainApiError
  /** Opcional: alguns domínios (ex.: `reports`) não exportam o utilitário. */
  getErrorMessage?: (payload: unknown, fallback: string) => string
  readAccessToken: (cookieStore: {
    get: (name: string) => { value: string } | undefined
  }) => string | null
  clearAccessToken: (cookieStore: { delete: (name: string) => void }) => void
  fallbackMessage: string
  networkErrorMessage: string
  /**
   * A API Express responde erros como `{ error: string }` (`api/src/app.ts`).
   * `false` marca o teste correspondente como `it.fails` (bug conhecido).
   */
  readsExpressErrorField: boolean
}

const TOKEN = 'jwt-ficticio-condominio-a'

/**
 * Contrato comum dos `helpers.ts` do BFF (`request<Domain>Api` + utilitários de
 * cookie/erro), que são duplicados por domínio. Cada `helpers.test.ts` chama
 * esta função com as peças do seu domínio.
 */
export function describeDomainHelpersContract(contract: DomainHelpersContract): void {
  const { resourcePath, request, ApiError } = contract

  describe(`request${resourcePath}Api (contrato do BFF)`, () => {
    let fetchMock: FetchMock

    beforeEach(() => {
      fetchMock = mockFetch()
    })

    it('repassa o JWT como Bearer, sem cache, na URL do recurso', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ items: [] }))

      await expect(request('?page=1', TOKEN, { method: 'GET' })).resolves.toEqual({ items: [] })

      const call = getFetchCall(fetchMock)
      expect(call.url).toBe(`http://api.test/api${resourcePath}?page=1`)
      expect(call.init.method).toBe('GET')
      expect(call.init.cache).toBe('no-store')
      expect(call.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`)
      expect(call.headers.get('Accept')).toBe('application/json')
    })

    it('não envia condominiumId: o tenant vem só do JWT', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'x' }, 201))
      const body = JSON.stringify({ fullName: 'Pessoa Fictícia' })

      await request('', TOKEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })

      const call = getFetchCall(fetchMock)
      expect(call.init.body).toBe(body)
      expect(call.headers.get('Content-Type')).toBe('application/json')
      expect(call.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`)
      expect(call.url).not.toMatch(/condominiumId/i)
      expect([...call.headers.keys()].join(',')).not.toMatch(/condominium|tenant/i)
    })

    it.each([401, 403])('traduz %i em erro com clearCookie=true', async (status) => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Sessão inválida.' }, status))

      const error = await request('', TOKEN, { method: 'GET' }).catch((e: unknown) => e)

      expect(error).toBeInstanceOf(ApiError)
      expect(error).toMatchObject({ status, clearCookie: true, message: 'Sessão inválida.' })
    })

    it.each([400, 404, 409, 500])(
      'traduz %i em erro com o mesmo status, sem limpar o cookie',
      async (status) => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Falha de negócio.' }, status))

        const error = await request('/id-do-condominio-b', TOKEN, { method: 'GET' }).catch(
          (e: unknown) => e,
        )

        expect(error).toBeInstanceOf(ApiError)
        expect(error).toMatchObject({ status, clearCookie: false })
      },
    )

    it('usa a mensagem padrão quando o corpo do erro não é JSON', async () => {
      fetchMock.mockResolvedValueOnce(textResponse('<html>Bad Gateway</html>', 502))

      await expect(request('', TOKEN, { method: 'GET' })).rejects.toMatchObject({
        status: 502,
        message: contract.fallbackMessage,
      })
    })

    const itExpressError = contract.readsExpressErrorField ? it : it.fails

    itExpressError('repassa a mensagem do formato de erro da API Express ({ error })', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ error: 'Registro não encontrado neste condomínio.' }, 404),
      )

      await expect(request('/id-do-condominio-b', TOKEN, { method: 'GET' })).rejects.toThrow(
        'Registro não encontrado neste condomínio.',
      )
    })

    it('não tenta outra URL base quando a API respondeu (mesmo com erro)', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'x' }, 500))

      await expect(request('', TOKEN, { method: 'GET' })).rejects.toBeInstanceOf(ApiError)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('tenta as URLs base seguintes em falha de rede e devolve 502 se todas falharem', async () => {
      fetchMock.mockRejectedValue(new TypeError('fetch failed'))

      await expect(request('', TOKEN, { method: 'GET' })).rejects.toMatchObject({
        status: 502,
        clearCookie: false,
        message: contract.networkErrorMessage,
      })

      expect(fetchMock.mock.calls.map((_, index) => getFetchCall(fetchMock, index).url)).toEqual([
        `http://api.test/api${resourcePath}`,
        `http://localhost:3333/api${resourcePath}`,
        `http://api:3333/api${resourcePath}`,
      ])
    })

    it('usa a URL seguinte quando só a primeira falha na rede', async () => {
      fetchMock
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValueOnce(jsonResponse({ ok: true }))

      await expect(request('', TOKEN, { method: 'GET' })).resolves.toEqual({ ok: true })
    })
  })

  describe('utilitários de cookie e erro', () => {
    it('lê o token do cookie de sessão', () => {
      const store = new Map([[ACCESS_TOKEN_COOKIE_NAME, { value: TOKEN }]])

      expect(contract.readAccessToken({ get: (name) => store.get(name) })).toBe(TOKEN)
      expect(contract.readAccessToken({ get: () => undefined })).toBeNull()
    })

    it('apaga apenas o cookie de sessão', () => {
      const deleted: string[] = []

      contract.clearAccessToken({ delete: (name) => deleted.push(name) })

      expect(deleted).toEqual([ACCESS_TOKEN_COOKIE_NAME])
    })

    const { getErrorMessage } = contract

    it.runIf(getErrorMessage)('getErrorMessage usa error/message ou cai no fallback', () => {
      if (!getErrorMessage) return

      expect(getErrorMessage({ error: 'Erro da API' }, 'fb')).toBe('Erro da API')
      expect(getErrorMessage({ message: 'Erro X' }, 'fb')).toBe('Erro X')
      expect(getErrorMessage({ message: '  ' }, 'fb')).toBe('fb')
      expect(getErrorMessage(null, 'fb')).toBe('fb')
    })
  })
}
