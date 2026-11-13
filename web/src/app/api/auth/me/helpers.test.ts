import { beforeEach, describe, expect, it } from 'vitest'

import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth/session'
import { getFetchCall, jsonResponse, mockFetch, textResponse, type FetchMock } from '@test/fetch'

import {
  AuthSessionError,
  clearAccessToken,
  fetchAuthenticatedUser,
  getErrorMessage,
} from './helpers'
import { UserRole, type AuthMeResponse } from './types'

const TOKEN = 'jwt-ficticio-condominio-a'

const ME_OK: AuthMeResponse = {
  user: {
    id: 'usuario-1',
    condominiumId: 'condominio-a',
    email: 'admin@demo.local',
    name: 'Admin Demo',
    role: UserRole.ADMIN,
  },
}

describe('fetchAuthenticatedUser (BFF auth/me)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it('consulta /auth/me com o JWT como Bearer e sem cache', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(ME_OK))

    await expect(fetchAuthenticatedUser(TOKEN)).resolves.toEqual(ME_OK)

    const call = getFetchCall(fetchMock)
    expect(call.url).toBe('http://api.test/api/auth/me')
    expect(call.init.method).toBe('GET')
    expect(call.init.cache).toBe('no-store')
    expect(call.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`)
  })

  it.each([401, 403])('normaliza %i em 401 "Sessão inválida." com clearCookie', async (status) => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Token expirado.' }, status))

    const error = await fetchAuthenticatedUser(TOKEN).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(AuthSessionError)
    expect(error).toMatchObject({ status: 401, clearCookie: true, message: 'Sessão inválida.' })
  })

  it('repassa status e mensagem `{ error }` de outros erros, sem limpar o cookie', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Usuário inativo.' }, 404))

    await expect(fetchAuthenticatedUser(TOKEN)).rejects.toMatchObject({
      status: 404,
      clearCookie: false,
      message: 'Usuário inativo.',
    })
  })

  it('usa a mensagem padrão quando o erro não tem corpo JSON', async () => {
    fetchMock.mockResolvedValueOnce(textResponse('<html>Bad Gateway</html>', 502))

    await expect(fetchAuthenticatedUser(TOKEN)).rejects.toMatchObject({
      status: 502,
      message: 'Não foi possível carregar a sessão.',
    })
  })

  it('rejeita resposta 200 sem `user` como 500', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}))

    await expect(fetchAuthenticatedUser(TOKEN)).rejects.toMatchObject({
      status: 500,
      message: 'Resposta inválida do servidor.',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('tenta as URLs base seguintes em falha de rede e devolve 502 se todas falharem', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))

    await expect(fetchAuthenticatedUser(TOKEN)).rejects.toMatchObject({
      status: 502,
      clearCookie: false,
      message: 'Não foi possível conectar ao serviço de autenticação.',
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})

describe('utilitários de auth/me', () => {
  it('clearAccessToken apaga apenas o cookie de sessão', () => {
    const deleted: string[] = []

    clearAccessToken({ delete: (name) => deleted.push(name) })

    expect(deleted).toEqual([ACCESS_TOKEN_COOKIE_NAME])
  })

  it('getErrorMessage prioriza `error` e cai no fallback', () => {
    expect(getErrorMessage({ error: 'A', message: 'B' }, 'fb')).toBe('A')
    expect(getErrorMessage({ message: 'B' }, 'fb')).toBe('B')
    expect(getErrorMessage({ error: '  ' }, 'fb')).toBe('fb')
  })
})
