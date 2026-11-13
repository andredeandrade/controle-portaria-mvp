import {
  extractTenantSlugFromHost,
  getDefaultTenantSlug,
  getApiBaseUrls,
  isValidTenantSlug,
  normalizeTenantSlug,
} from '@/lib/auth/session'
import type { CondominiumIdResponse, LoginRequestBody } from './types'

export class ApiRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
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

export async function safeReadJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function fetchCondominiumIdBySlug(
  slug: string,
): Promise<{ condominiumId: string; apiBaseUrl: string }> {
  const baseUrls = getApiBaseUrls()

  for (const baseUrl of baseUrls) {
    try {
      const response = await fetch(`${baseUrl}/condominiums/slug/${encodeURIComponent(slug)}/id`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })

      if (!response.ok) {
        const errorPayload = await safeReadJson(response)

        if (response.status === 404) {
          throw new ApiRequestError('Condomínio não encontrado para o slug informado.', 404)
        }

        throw new ApiRequestError(
          getErrorMessage(errorPayload, 'Não foi possível identificar o condomínio.'),
          response.status || 502,
        )
      }

      const payload = (await response.json()) as CondominiumIdResponse

      if (!payload.id) {
        throw new ApiRequestError('Resposta inválida ao identificar condomínio.', 502)
      }

      return {
        condominiumId: payload.id,
        apiBaseUrl: baseUrl,
      }
    } catch (error) {
      const maybeLastUrl = baseUrl === baseUrls[baseUrls.length - 1]

      if (maybeLastUrl) {
        if (error instanceof ApiRequestError) {
          throw error
        }

        if (error instanceof Error) {
          throw new ApiRequestError(error.message, 502)
        }

        throw new ApiRequestError('Não foi possível conectar ao serviço de autenticação.', 502)
      }
    }
  }

  throw new ApiRequestError('Não foi possível identificar o condomínio.', 500)
}

export function resolveTenantSlugFromRequest(request: Request, body: LoginRequestBody): string {
  const bodySlug = typeof body.condominiumSlug === 'string' ? body.condominiumSlug : ''
  const normalizedBodySlug = normalizeTenantSlug(bodySlug)

  if (normalizedBodySlug) {
    if (!isValidTenantSlug(normalizedBodySlug)) {
      throw new Error('Slug de condomínio inválido.')
    }

    return normalizedBodySlug
  }

  const tenantSlug =
    extractTenantSlugFromHost(request.headers.get('host')) ?? getDefaultTenantSlug()

  if (!tenantSlug) {
    throw new Error(
      'Não foi possível identificar o condomínio pelo subdomínio. Informe o slug do condomínio.',
    )
  }

  return tenantSlug
}
