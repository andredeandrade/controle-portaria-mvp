import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UserRole } from '@/app/api/auth/me/types'
import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth/session'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'

import type { LoginApiResponse } from './types'

type CookieSetOptions = { name: string; value: string; httpOnly?: boolean } & Record<
  string,
  unknown
>

const cookieStore = vi.hoisted(() => ({ set: vi.fn<(options: CookieSetOptions) => void>() }))

// Fronteira do framework: `cookies()` só existe dentro do request scope do Next.
vi.mock('next/headers', () => ({ cookies: async () => cookieStore }))

const { POST } = await import('./route')

const LOGIN_OK: LoginApiResponse = {
  token: 'jwt-ficticio',
  user: {
    id: 'usuario-1',
    condominiumId: 'condominio-demo-id',
    name: 'Admin Demo',
    email: 'admin@demo.local',
    role: UserRole.ADMIN,
  },
}

function loginRequest(body: unknown, host = 'demo.localhost:3000'): Request {
  return new Request('http://interno/api/auth/login', {
    method: 'POST',
    headers: { host, 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('POST /api/auth/login', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    cookieStore.set.mockReset()
  })

  it('resolve o tenant pelo subdomínio, envia condominiumId à API e grava o JWT em cookie httpOnly', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: 'condominio-demo-id' }))
      .mockResolvedValueOnce(jsonResponse(LOGIN_OK))

    const response = await POST(
      loginRequest({ email: ' Admin@Demo.Local ', password: 'Senha@123' }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ user: LOGIN_OK.user })

    expect(getFetchCall(fetchMock, 0).url).toBe('http://api.test/api/condominiums/slug/demo/id')

    const loginCall = getFetchCall(fetchMock, 1)
    expect(loginCall.url).toBe('http://api.test/api/auth/login')
    expect(JSON.parse(String(loginCall.init.body))).toEqual({
      condominiumId: 'condominio-demo-id',
      email: 'admin@demo.local',
      password: 'Senha@123',
    })

    expect(cookieStore.set).toHaveBeenCalledWith(
      expect.objectContaining({
        name: ACCESS_TOKEN_COOKIE_NAME,
        value: 'jwt-ficticio',
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }),
    )
  })

  it('não expõe o token no corpo da resposta', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: 'condominio-demo-id' }))
      .mockResolvedValueOnce(jsonResponse(LOGIN_OK))

    const response = await POST(loginRequest({ email: 'admin@demo.local', password: 'x' }))

    expect(JSON.stringify(await response.json())).not.toContain('jwt-ficticio')
  })

  it('responde 400 para corpo que não é JSON', async () => {
    const response = await POST(loginRequest('nao-json'))

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('responde 400 sem e-mail ou senha', async () => {
    const response = await POST(loginRequest({ email: 'admin@demo.local' }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ message: 'Informe e-mail e senha.' })
  })

  it('responde 400 quando não há tenant no host nem no corpo', async () => {
    const response = await POST(
      loginRequest({ email: 'admin@demo.local', password: 'x' }, 'localhost:3000'),
    )

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('repassa o status de credenciais inválidas e não grava cookie', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: 'condominio-demo-id' }))
      .mockResolvedValueOnce(jsonResponse({ error: 'Credenciais inválidas.' }, 401))

    const response = await POST(loginRequest({ email: 'admin@demo.local', password: 'errada' }))

    expect(response.status).toBe(401)
    expect(cookieStore.set).not.toHaveBeenCalled()
  })

  it('responde 404 quando o slug não corresponde a nenhum condomínio', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ error: 'Not found' }, 404))

    const response = await POST(
      loginRequest({ email: 'admin@demo.local', password: 'x' }, 'outro.localhost:3000'),
    )

    expect(response.status).toBe(404)
    expect(cookieStore.set).not.toHaveBeenCalled()
  })
})
