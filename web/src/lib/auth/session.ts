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

/**
 * Extrai o slug do condomínio a partir do header `Host`.
 *
 * - `*.localhost` (dev): o primeiro label é o slug.
 * - Com `APP_ROOT_DOMAIN` definido (ex.: `portaria.com.br`): só hosts que são
 *   subdomínios desse domínio têm tenant; o domínio raiz em si retorna `null`.
 *   Em hospedagens sem subdomínio por tenant (ex.: `app.vercel.app`), aponte
 *   `APP_ROOT_DOMAIN` para o próprio host e use `DEFAULT_TENANT_SLUG`.
 * - Sem `APP_ROOT_DOMAIN`: heurística legada (3+ labels, o primeiro é o slug).
 *
 * `www` nunca é tenant. Retorna `null` quando não há tenant no host.
 */
export function extractTenantSlugFromHost(hostHeader: string | null): string | null {
  if (!hostHeader) {
    return null
  }

  const host = hostHeader.split(':')[0]?.toLowerCase().trim() ?? ''

  if (!host || host === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return null
  }

  const hostParts = host.split('.').filter(Boolean)
  const rootDomain = getAppRootDomain()

  let tenantSlug: string | undefined

  if (host.endsWith('.localhost') && hostParts.length >= 2) {
    tenantSlug = hostParts[0]
  } else if (rootDomain) {
    tenantSlug = host.endsWith(`.${rootDomain}`) ? hostParts[0] : undefined
  } else if (hostParts.length >= 3) {
    tenantSlug = hostParts[0]
  }

  if (!tenantSlug || tenantSlug === 'www') {
    return null
  }

  return tenantSlug
}

function getAppRootDomain(): string | null {
  const value = process.env.APP_ROOT_DOMAIN?.trim()
    .toLowerCase()
    .replace(/^\.+|\.+$/g, '')

  return value ? value : null
}

/**
 * Slug do condomínio usado quando o host não traz tenant (ex.: demo pública em
 * `*.vercel.app`). Definido por `DEFAULT_TENANT_SLUG`; `null` se ausente ou inválido.
 * Somente servidor: não use no cliente.
 */
export function getDefaultTenantSlug(): string | null {
  const value = normalizeTenantSlug(process.env.DEFAULT_TENANT_SLUG ?? '')

  return isValidTenantSlug(value) ? value : null
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
