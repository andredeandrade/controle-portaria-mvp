export const ACCESS_TOKEN_COOKIE_NAME = 'cp_access_token'

const DEFAULT_API_BASE_URLS = ['http://localhost:3333/api', 'http://api:3333/api'] as const

export function getApiBaseUrls(): string[] {
  const configured = [process.env.API_BASE_URL, process.env.NEXT_PUBLIC_API_BASE_URL].filter(
    (value): value is string => Boolean(value?.trim()),
  )

  const normalized = [...configured, ...DEFAULT_API_BASE_URLS].map((url) =>
    url.trim().replace(/\/$/, ''),
  )

  return Array.from(new Set(normalized))
}

export function extractTenantSlugFromHost(hostHeader: string | null): string | null {
  if (!hostHeader) {
    return null
  }

  const host = hostHeader.split(':')[0]?.toLowerCase().trim() ?? ''

  if (!host || host === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return null
  }

  const hostParts = host.split('.').filter(Boolean)

  if (host.endsWith('.localhost') && hostParts.length >= 2) {
    const tenantSlug = hostParts[0]

    if (!tenantSlug || tenantSlug === 'www') {
      return null
    }

    return tenantSlug
  }

  if (hostParts.length < 3) {
    return null
  }

  const tenantSlug = hostParts[0]

  if (!tenantSlug || tenantSlug === 'www') {
    return null
  }

  return tenantSlug
}

export function normalizeTenantSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isValidTenantSlug(value: string): boolean {
  return /^[a-z0-9-]{3,}$/.test(value)
}
