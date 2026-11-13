import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth/session'

/** JWT fictício do condomínio A usado nos testes de route handler. */
export const TEST_ACCESS_TOKEN = 'jwt-ficticio-condominio-a'

const jar = new Map<string, string>()

/** Nomes passados a `cookieStore.delete()` desde o último `resetCookies()`. */
export const deletedCookies: string[] = []

/**
 * Substituto mínimo do `ReadonlyRequestCookies` de `next/headers` (só o que os
 * Route Handlers usam). Funções puras, e não `vi.fn()`, para não depender de
 * `restoreMocks`.
 */
export const cookieStore = {
  get(name: string): { name: string; value: string } | undefined {
    const value = jar.get(name)
    return value === undefined ? undefined : { name, value }
  },
  delete(name: string): void {
    deletedCookies.push(name)
    jar.delete(name)
  },
}

/** Simula uma sessão ativa gravando o cookie httpOnly de acesso. */
export function signIn(token: string = TEST_ACCESS_TOKEN): void {
  jar.set(ACCESS_TOKEN_COOKIE_NAME, token)
}

export function resetCookies(): void {
  jar.clear()
  deletedCookies.length = 0
}

/**
 * Factory para `vi.mock('next/headers', ...)`: `cookies()` só existe dentro do
 * request scope do Next, então é a fronteira mockada.
 *
 * @example
 * vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)
 */
export const nextHeadersMock = {
  cookies: async () => cookieStore,
}
