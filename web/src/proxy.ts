import { ACCESS_TOKEN_COOKIE_NAME, getApiBaseUrls } from './lib/auth/session'
import { hasPermission, type ResourceActionMap } from './lib/permissions/permissions'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { AuthenticatedUser, AuthMeResponse } from './app/api/auth/me/types'

const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/acessos',
  '/moradores',
  '/visitantes',
  '/prestadores-servicos',
  '/eventos',
  '/ocorrencias',
  '/autorizacoes',
  '/relatorios',
] as const

type PermissionRule = {
  [Resource in keyof ResourceActionMap]: {
    pattern: RegExp
    resource: Resource
    action: ResourceActionMap[Resource]
    redirectTo: string
  }
}[keyof ResourceActionMap]

const PERMISSION_RULES: PermissionRule[] = [
  {
    pattern: /^\/moradores\/cadastrar$/,
    resource: 'residents',
    action: 'create',
    redirectTo: '/moradores',
  },
  {
    pattern: /^\/moradores\/[^/]+\/editar$/,
    resource: 'residents',
    action: 'update',
    redirectTo: '/moradores',
  },
  {
    pattern: /^\/visitantes\/cadastrar$/,
    resource: 'visitors',
    action: 'create',
    redirectTo: '/visitantes',
  },
  {
    pattern: /^\/visitantes\/[^/]+\/editar$/,
    resource: 'visitors',
    action: 'update',
    redirectTo: '/visitantes',
  },
  {
    pattern: /^\/prestadores-servicos\/cadastrar$/,
    resource: 'service-providers',
    action: 'create',
    redirectTo: '/prestadores-servicos',
  },
  {
    pattern: /^\/prestadores-servicos\/[^/]+\/editar$/,
    resource: 'service-providers',
    action: 'update',
    redirectTo: '/prestadores-servicos',
  },
  {
    pattern: /^\/autorizacoes\/cadastrar$/,
    resource: 'authorizations',
    action: 'create',
    redirectTo: '/autorizacoes',
  },
  {
    pattern: /^\/autorizacoes\/[^/]+\/editar$/,
    resource: 'authorizations',
    action: 'update',
    redirectTo: '/autorizacoes',
  },
  {
    pattern: /^\/eventos\/cadastrar$/,
    resource: 'events',
    action: 'create',
    redirectTo: '/eventos',
  },
  {
    pattern: /^\/eventos\/[^/]+\/editar$/,
    resource: 'events',
    action: 'update',
    redirectTo: '/eventos',
  },
  {
    pattern: /^\/ocorrencias\/registrar$/,
    resource: 'incidents',
    action: 'create',
    redirectTo: '/ocorrencias',
  },
  {
    pattern: /^\/ocorrencias\/[^/]+\/editar$/,
    resource: 'incidents',
    action: 'update',
    redirectTo: '/ocorrencias',
  },
  {
    pattern: /^\/acessos\/registrar$/,
    resource: 'access-records',
    action: 'checkIn',
    redirectTo: '/acessos',
  },
]

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

function isReportsPath(pathname: string): boolean {
  return pathname === '/relatorios' || pathname.startsWith('/relatorios/')
}

async function fetchAuthenticatedUser(accessToken: string): Promise<AuthenticatedUser | null> {
  const apiBaseUrls = getApiBaseUrls()

  for (const apiBaseUrl of apiBaseUrls) {
    try {
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      })

      if (response.ok) {
        const body: AuthMeResponse = await response.json()
        return body.user
      }

      if (response.status === 401 || response.status === 403) {
        return null
      }
    } catch {
      const isLastAttempt = apiBaseUrl === apiBaseUrls[apiBaseUrls.length - 1]

      if (isLastAttempt) {
        return null
      }
    }
  }

  return null
}

function redirectToLoginAndClearCookie(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME)

  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value

  if (!accessToken) {
    if (isProtectedPath(pathname)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  }

  const user = await fetchAuthenticatedUser(accessToken)

  if (!user) {
    if (pathname === '/' || isProtectedPath(pathname)) {
      return redirectToLoginAndClearCookie(request)
    }

    return NextResponse.next()
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isReportsPath(pathname) && !hasPermission(user.role, 'reports', 'view')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const matchedRule = PERMISSION_RULES.find((rule) => rule.pattern.test(pathname))

  if (matchedRule && !hasPermission(user.role, matchedRule.resource, matchedRule.action)) {
    return NextResponse.redirect(new URL(matchedRule.redirectTo, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/acessos/:path*',
    '/moradores/:path*',
    '/visitantes/:path*',
    '/prestadores-servicos/:path*',
    '/eventos/:path*',
    '/ocorrencias/:path*',
    '/autorizacoes/:path*',
    '/relatorios/:path*',
  ],
}
