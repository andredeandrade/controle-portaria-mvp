import {
  ReportsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestReportsApi,
} from '../helpers'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 })
  }

  try {
    const requestUrl = new URL(request.url)
    const params = new URLSearchParams()

    const forwarded = ['page', 'pageSize', 'name', 'day', 'month', 'from', 'to']
    for (const key of forwarded) {
      const val = requestUrl.searchParams.get(key)
      if (val) params.set(key, val)
    }

    const query = params.toString()
    const payload = await requestReportsApi(
      query ? `/service-providers?${query}` : '/service-providers',
      accessToken,
      { method: 'GET' },
    )

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof ReportsApiError) {
      if (error.clearCookie) clearAccessToken(cookieStore)
      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Erro inesperado ao consultar prestadores.') },
      { status: 500 },
    )
  }
}
