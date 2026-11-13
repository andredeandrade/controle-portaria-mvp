import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getFetchCall, jsonResponse, mockFetch, textResponse, type FetchMock } from '@test/fetch'

import {
  ApiRequestError,
  fetchCondominiumIdBySlug,
  getErrorMessage,
  resolveTenantSlugFromRequest,
} from './helpers'

function requestWithHost(host: string | null): Request {
  const headers = new Headers()

  if (host) {
    headers.set('host', host)
  }

  return new Request('http://interno/api/auth/login', { method: 'POST', headers })
}

describe('resolveTenantSlugFromRequest', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('usa o slug do subdomínio quando o corpo não informa', () => {
    expect(resolveTenantSlugFromRequest(requestWithHost('demo.localhost:3000'), {})).toBe('demo')
  })

  it('prioriza condominiumSlug do corpo, normalizado, sobre o host', () => {
    expect(
      resolveTenantSlugFromRequest(requestWithHost('demo.localhost:3000'), {
        condominiumSlug: ' Residencial Álamo ',
      }),
    ).toBe('residencial-alamo')
  })

  it('rejeita slug do corpo inválido mesmo com host válido', () => {
    expect(() =>
      resolveTenantSlugFromRequest(requestWithHost('demo.localhost:3000'), {
        condominiumSlug: 'ab',
      }),
    ).toThrow('Slug de condomínio inválido.')
  })

  it('ignora condominiumSlug que não é string', () => {
    expect(
      resolveTenantSlugFromRequest(requestWithHost('demo.localhost'), { condominiumSlug: 123 }),
    ).toBe('demo')
  })

  it('usa DEFAULT_TENANT_SLUG quando o host não traz tenant', () => {
    vi.stubEnv('DEFAULT_TENANT_SLUG', 'demo')

    expect(resolveTenantSlugFromRequest(requestWithHost('localhost:3000'), {})).toBe('demo')
    expect(resolveTenantSlugFromRequest(requestWithHost(null), {})).toBe('demo')
  })

  it('na demo (APP_ROOT_DOMAIN = host do app) cai no tenant padrão em vez do 1º label', () => {
    vi.stubEnv('APP_ROOT_DOMAIN', 'controle-portaria.vercel.app')
    vi.stubEnv('DEFAULT_TENANT_SLUG', 'demo')

    expect(resolveTenantSlugFromRequest(requestWithHost('controle-portaria.vercel.app'), {})).toBe(
      'demo',
    )
  })

  it('o subdomínio do host tem prioridade sobre DEFAULT_TENANT_SLUG', () => {
    vi.stubEnv('DEFAULT_TENANT_SLUG', 'demo')

    expect(resolveTenantSlugFromRequest(requestWithHost('alfa.localhost:3000'), {})).toBe('alfa')
  })

  it('o slug do corpo tem prioridade sobre DEFAULT_TENANT_SLUG', () => {
    vi.stubEnv('DEFAULT_TENANT_SLUG', 'demo')

    expect(
      resolveTenantSlugFromRequest(requestWithHost('localhost:3000'), { condominiumSlug: 'beta' }),
    ).toBe('beta')
  })

  it.each(['localhost:3000', '127.0.0.1:3000', null])(
    'falha sem slug no corpo e host sem subdomínio (%s)',
    (host) => {
      expect(() => resolveTenantSlugFromRequest(requestWithHost(host), {})).toThrow(/subdomínio/)
    },
  )
})

describe('fetchCondominiumIdBySlug', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it('resolve o condominiumId e devolve a URL base que respondeu', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'condominio-demo-id' }))

    await expect(fetchCondominiumIdBySlug('demo')).resolves.toEqual({
      condominiumId: 'condominio-demo-id',
      apiBaseUrl: 'http://api.test/api',
    })

    const call = getFetchCall(fetchMock)
    expect(call.url).toBe('http://api.test/api/condominiums/slug/demo/id')
    expect(call.init.cache).toBe('no-store')
    expect(call.headers.has('Authorization')).toBe(false)
  })

  it('codifica o slug na URL', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'x' }))

    await fetchCondominiumIdBySlug('a/b?c')

    expect(getFetchCall(fetchMock).url).toBe('http://api.test/api/condominiums/slug/a%2Fb%3Fc/id')
  })

  it('traduz 404 em "Condomínio não encontrado" com status 404', async () => {
    // Todas as URLs base respondem 404 (o loop só propaga o erro na última).
    fetchMock.mockImplementation(async () => jsonResponse({ error: 'Not found' }, 404))

    await expect(fetchCondominiumIdBySlug('inexistente')).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 404,
      message: 'Condomínio não encontrado para o slug informado.',
    })
  })

  it('tenta as demais URLs base quando a primeira falha na rede', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(jsonResponse({ id: 'condominio-demo-id' }))

    await expect(fetchCondominiumIdBySlug('demo')).resolves.toEqual({
      condominiumId: 'condominio-demo-id',
      apiBaseUrl: 'http://localhost:3333/api',
    })
  })

  it('propaga erro 502 quando todas as URLs base falham na rede', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))

    const error = await fetchCondominiumIdBySlug('demo').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error).toMatchObject({ status: 502, message: 'fetch failed' })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('rejeita resposta 200 sem id como 502', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({}))

    await expect(fetchCondominiumIdBySlug('demo')).rejects.toMatchObject({
      status: 502,
      message: 'Resposta inválida ao identificar condomínio.',
    })
  })

  it('usa a mensagem padrão para erro não-JSON', async () => {
    fetchMock.mockImplementation(async () => textResponse('<html>erro</html>', 503))

    await expect(fetchCondominiumIdBySlug('demo')).rejects.toMatchObject({
      status: 503,
      message: 'Não foi possível identificar o condomínio.',
    })
  })

  it('repassa a mensagem do formato de erro da API Express ({ error })', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ error: 'Condomínio inativo.' }, 403))

    await expect(fetchCondominiumIdBySlug('demo')).rejects.toThrow('Condomínio inativo.')
  })
})

describe('getErrorMessage (login)', () => {
  it('lê o campo `error` das respostas da API Express', () => {
    expect(getErrorMessage({ error: 'Credenciais inválidas.' }, 'Falha ao autenticar.')).toBe(
      'Credenciais inválidas.',
    )
  })
})
