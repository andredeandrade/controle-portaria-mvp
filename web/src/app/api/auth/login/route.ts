import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth/session'
import {
  ApiRequestError,
  fetchCondominiumIdBySlug,
  getErrorMessage,
  resolveTenantSlugFromRequest,
  safeReadJson,
} from './helpers'
import type { LoginApiResponse, LoginRequestBody } from './types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body: LoginRequestBody

  try {
    body = (await request.json()) as LoginRequestBody
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    return NextResponse.json({ message: 'Informe e-mail e senha.' }, { status: 400 })
  }

  let tenantSlug: string

  try {
    tenantSlug = resolveTenantSlugFromRequest(request, body)
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Slug de condomínio inválido.' },
      { status: 400 },
    )
  }

  try {
    const { condominiumId, apiBaseUrl } = await fetchCondominiumIdBySlug(tenantSlug)

    const loginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        condominiumId,
        email,
        password,
      }),
      cache: 'no-store',
    })

    const payload = (await safeReadJson(loginResponse)) as LoginApiResponse | null

    if (!loginResponse.ok || !payload?.token || !payload.user) {
      return NextResponse.json(
        { message: getErrorMessage(payload, 'Falha ao autenticar usuário.') },
        { status: loginResponse.status || 401 },
      )
    }

    const cookieStore = await cookies()

    cookieStore.set({
      name: ACCESS_TOKEN_COOKIE_NAME,
      value: payload.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return NextResponse.json({ user: payload.user }, { status: 200 })
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    const message = error instanceof Error ? error.message : 'Erro inesperado no login.'

    return NextResponse.json({ message }, { status: 500 })
  }
}
