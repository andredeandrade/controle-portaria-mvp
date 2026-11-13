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

    const day = requestUrl.searchParams.get('day')
    const month = requestUrl.searchParams.get('month')

    if (day) params.set('day', day)
    if (month) params.set('month', month)

    const query = params.toString()
    const path = query ? `/dashboard-summary?${query}` : '/dashboard-summary'

    const payload = await requestReportsApi(path, accessToken, { method: 'GET' })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof ReportsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Erro inesperado ao consultar relatórios.') },
      { status: 500 },
    )
  }
}
