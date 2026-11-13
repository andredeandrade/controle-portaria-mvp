import { ACCESS_TOKEN_COOKIE_NAME, getApiBaseUrls } from '@/lib/auth/session'

export class ServiceProvidersApiError extends Error {
  status: number
  clearCookie: boolean

  constructor(message: string, status: number, clearCookie = false) {
    super(message)
    this.name = 'ServiceProvidersApiError'
    this.status = status
    this.clearCookie = clearCookie
  }
}

type CookieStore = {
  delete: (name: string) => void
}

export function clearAccessToken(cookieStore: CookieStore): void {
  cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME)
}

export function readAccessToken(cookieStore: {
  get: (name: string) => { value: string } | undefined
}): string | null {
  return cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? null
}

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

export function getThrowableMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
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

export async function requestServiceProvidersApi(
  path: string,
  accessToken: string,
  init: RequestInit,
): Promise<unknown> {
  const baseUrls = getApiBaseUrls()

  for (const baseUrl of baseUrls) {
    try {
      const response = await fetch(`${baseUrl}/service-providers${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...(init.headers ?? {}),
        },
        cache: 'no-store',
      })

      const payload = await safeReadJson(response)

      if (!response.ok) {
        const clearCookie = response.status === 401 || response.status === 403

        throw new ServiceProvidersApiError(
          getErrorMessage(payload, 'Falha ao consultar prestadores de serviço.'),
          response.status || 500,
          clearCookie,
        )
      }

      return payload
    } catch (error) {
      const isLastAttempt = baseUrl === baseUrls[baseUrls.length - 1]

      if (error instanceof ServiceProvidersApiError) {
        throw error
      }

      if (isLastAttempt) {
        throw new ServiceProvidersApiError(
          'Não foi possível conectar ao serviço de prestadores.',
          502,
        )
      }
    }
  }

  throw new ServiceProvidersApiError('Falha ao consultar prestadores de serviço.', 500)
}
