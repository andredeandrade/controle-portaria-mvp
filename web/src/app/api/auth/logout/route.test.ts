import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth/session'
import { mockFetch, type FetchMock } from '@test/fetch'
import { cookieStore, deletedCookies, resetCookies, signIn } from '@test/next-headers'

import { POST } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

describe('POST /api/auth/logout', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    resetCookies()
  })

  it('apaga o cookie de sessão e responde { success: true } sem chamar a API', async () => {
    signIn()

    const response = await POST()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true })
    expect(deletedCookies).toEqual([ACCESS_TOKEN_COOKIE_NAME])
    expect(cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)).toBeUndefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('é idempotente sem sessão ativa', async () => {
    const response = await POST()

    expect(response.status).toBe(200)
  })
})
