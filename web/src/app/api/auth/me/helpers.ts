import { ACCESS_TOKEN_COOKIE_NAME, getApiBaseUrls } from '@/lib/auth/session'
import type { AuthMeResponse } from './types'

export function getErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object') {
    // A API Express responde erros como `{ error }`; `message` é mantido por compatibilidade.
    const { error, message } = payload as { error?: unknown; message?: unknown }

    for (const candidate of [error, message]) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate
      }
    }
  }

  return fallback
}

export async function safeReadJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function fetchAuthenticatedUser(accessToken: string): Promise<AuthMeResponse> {
  const baseUrls = getApiBaseUrls()

  for (const baseUrl of baseUrls) {
    try {
      const response = await fetch(`${baseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      })

      const payload = (await safeReadJson(response)) as AuthMeResponse | null

      if (!response.ok) {
        const shouldClearCookie = response.status === 401 || response.status === 403

        if (shouldClearCookie) {
          throw new AuthSessionError('Sessão inválida.', 401, true)
        }

        throw new AuthSessionError(
          getErrorMessage(payload, 'Não foi possível carregar a sessão.'),
          response.status || 500,
        )
      }

      if (!payload?.user) {
        throw new AuthSessionError('Resposta inválida do servidor.', 500)
      }

      return payload
    } catch (error) {
      const maybeLastUrl = baseUrl === baseUrls[baseUrls.length - 1]

      if (error instanceof AuthSessionError) {
        throw error
      }

      if (maybeLastUrl) {
        throw new AuthSessionError('Não foi possível conectar ao serviço de autenticação.', 502)
      }
    }
  }

  throw new AuthSessionError('Falha ao consultar sessão.', 500)
}

export class AuthSessionError extends Error {
  status: number
  clearCookie: boolean

  constructor(message: string, status: number, clearCookie = false) {
    super(message)
    this.name = 'AuthSessionError'
    this.status = status
    this.clearCookie = clearCookie
  }
}

export function clearAccessToken(cookieStore: { delete: (name: string) => void }): void {
  cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME)
}
