import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth/session'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { TEST_ACCESS_TOKEN, deletedCookies, resetCookies, signIn } from '@test/next-headers'

import { GET } from './route'
import { UserRole, type AuthMeResponse } from './types'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

const ME_OK: AuthMeResponse = {
  user: {
    id: 'usuario-1',
    condominiumId: 'condominio-a',
    email: 'admin@demo.local',
    name: 'Admin Demo',
    role: UserRole.ADMIN,
  },
}

describe('GET /api/auth/me', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    resetCookies()
  })

  it('responde 401 sem cookie e não chama a API', async () => {
    const response = await GET()

    expect(response.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('devolve o usuário autenticado repassando o JWT do cookie', async () => {
    signIn()
    fetchMock.mockResolvedValueOnce(jsonResponse(ME_OK))

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(ME_OK)
    expect(getFetchCall(fetchMock).headers.get('Authorization')).toBe(`Bearer ${TEST_ACCESS_TOKEN}`)
  })

  it.each([401, 403])('em %i da API responde 401 e apaga o cookie', async (status) => {
    signIn()
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Token inválido.' }, status))

    const response = await GET()

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ message: 'Sessão inválida.' })
    expect(deletedCookies).toEqual([ACCESS_TOKEN_COOKIE_NAME])
  })

  it('em outros erros repassa o status sem apagar o cookie', async () => {
    signIn()
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Erro interno.' }, 500))

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ message: 'Erro interno.' })
    expect(deletedCookies).toEqual([])
  })
})
