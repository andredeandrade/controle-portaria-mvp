import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth/session'
import { AuthSessionError, clearAccessToken, fetchAuthenticatedUser } from './helpers'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  try {
    const payload = await fetchAuthenticatedUser(accessToken)
    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof AuthSessionError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json({ message: 'Falha ao consultar sessão.' }, { status: 500 })
  }
}
