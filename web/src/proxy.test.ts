import { NextRequest } from 'next/server'
import { getRedirectUrl, unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { beforeEach, describe, expect, it } from 'vitest'

import { UserRole, type AuthenticatedUser } from '@/app/api/auth/me/types'
import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth/session'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'

import { config, proxy } from './proxy'

const ORIGIN = 'http://demo.localhost:3000'
const TOKEN = 'jwt-ficticio-do-condominio-demo'

function buildRequest(pathname: string, token?: string): NextRequest {
  const headers = new Headers()

  if (token) {
    headers.set('cookie', `${ACCESS_TOKEN_COOKIE_NAME}=${token}`)
  }

  return new NextRequest(`${ORIGIN}${pathname}`, { headers })
}

function buildUser(role: UserRole): AuthenticatedUser {
  return {
    id: 'usuario-1',
    condominiumId: 'condominio-demo',
    name: 'Usuária Fictícia',
    email: 'usuaria@demo.local',
    role,
  }
}

function isPassThrough(response: Response): boolean {
  return response.headers.get('x-middleware-next') === '1'
}

describe('proxy', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  describe('sem cookie de sessão', () => {
    it.each(['/dashboard', '/moradores', '/moradores/cadastrar', '/relatorios'])(
      'redireciona %s para / sem consultar a API',
      async (pathname) => {
        const response = await proxy(buildRequest(pathname))

        expect(getRedirectUrl(response)).toBe(`${ORIGIN}/`)
        expect(fetchMock).not.toHaveBeenCalled()
      },
    )

    it('deixa a página de login (/) passar', async () => {
      const response = await proxy(buildRequest('/'))

      expect(isPassThrough(response)).toBe(true)
    })
  })

  describe('com cookie inválido', () => {
    it('redireciona para / e apaga o cookie quando /auth/me responde 401', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Token inválido.' }, 401))

      const response = await proxy(buildRequest('/acessos', 'token-expirado'))

      expect(getRedirectUrl(response)).toBe(`${ORIGIN}/`)
      expect(response.headers.get('set-cookie')).toMatch(
        new RegExp(`${ACCESS_TOKEN_COOKIE_NAME}=;.*Expires=Thu, 01 Jan 1970`, 'i'),
      )
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('redireciona para / quando nenhuma URL da API responde (falha de rede)', async () => {
      fetchMock.mockRejectedValue(new TypeError('fetch failed'))

      const response = await proxy(buildRequest('/dashboard', TOKEN))

      expect(getRedirectUrl(response)).toBe(`${ORIGIN}/`)
      // API_BASE_URL + 2 defaults
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })
  })

  describe('com sessão válida', () => {
    it('valida o cookie em /auth/me repassando o JWT como Bearer', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ user: buildUser(UserRole.ADMIN) }))

      const response = await proxy(buildRequest('/dashboard', TOKEN))
      const call = getFetchCall(fetchMock)

      expect(isPassThrough(response)).toBe(true)
      expect(call.url).toBe('http://api.test/api/auth/me')
      expect(call.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`)
      expect(call.init.cache).toBe('no-store')
    })

    it('redireciona / para /dashboard', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ user: buildUser(UserRole.SEGURANCA) }))

      const response = await proxy(buildRequest('/', TOKEN))

      expect(getRedirectUrl(response)).toBe(`${ORIGIN}/dashboard`)
    })

    it('tenta a próxima URL base quando a primeira falha na rede', async () => {
      fetchMock
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValueOnce(jsonResponse({ user: buildUser(UserRole.ADMIN) }))

      const response = await proxy(buildRequest('/moradores', TOKEN))

      expect(isPassThrough(response)).toBe(true)
      expect(getFetchCall(fetchMock, 1).url).toBe('http://localhost:3333/api/auth/me')
    })

    it.each([
      ['/moradores/cadastrar', '/moradores'],
      ['/visitantes/v-1/editar', '/visitantes'],
      ['/autorizacoes/cadastrar', '/autorizacoes'],
      ['/relatorios', '/dashboard'],
    ])(
      'SEGURANCA (portaria) em %s (rota de ADMIN) é redirecionado para %s',
      async (pathname, target) => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ user: buildUser(UserRole.SEGURANCA) }))

        const response = await proxy(buildRequest(pathname, TOKEN))

        expect(getRedirectUrl(response)).toBe(`${ORIGIN}${target}`)
      },
    )

    it('SEGURANCA (portaria) pode registrar acesso', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ user: buildUser(UserRole.SEGURANCA) }))

      const response = await proxy(buildRequest('/acessos/registrar', TOKEN))

      expect(isPassThrough(response)).toBe(true)
    })

    it('SINDICO não registra acesso e volta para /acessos', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ user: buildUser(UserRole.SINDICO) }))

      const response = await proxy(buildRequest('/acessos/registrar', TOKEN))

      expect(getRedirectUrl(response)).toBe(`${ORIGIN}/acessos`)
    })

    it.each(['/moradores/cadastrar', '/visitantes/v-1/editar', '/relatorios'])(
      'ADMIN acessa %s',
      async (pathname) => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ user: buildUser(UserRole.ADMIN) }))

        const response = await proxy(buildRequest(pathname, TOKEN))

        expect(isPassThrough(response)).toBe(true)
      },
    )
  })

  describe('matcher', () => {
    it.each(['/', '/dashboard', '/moradores/m-1/editar', '/relatorios'])('executa em %s', (url) => {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true)
    })

    it.each(['/api/residents', '/_next/static/chunk.js', '/favicon.ico'])(
      'não executa em %s',
      (url) => {
        expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false)
      },
    )
  })
})
