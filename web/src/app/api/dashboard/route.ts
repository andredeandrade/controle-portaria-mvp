import {
  DashboardApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestDashboardApi,
} from './helpers'
import type { DashboardPeriod } from './types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const DASHBOARD_PERIODS: readonly DashboardPeriod[] = ['today', 'last7days', 'month']

function isDashboardPeriod(value: string): value is DashboardPeriod {
  return (DASHBOARD_PERIODS as readonly string[]).includes(value)
}

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  try {
    const requestUrl = new URL(request.url)
    const period = requestUrl.searchParams.get('period') ?? 'today'

    if (!isDashboardPeriod(period)) {
      return NextResponse.json(
        { message: 'Período inválido. Use today, last7days ou month.' },
        { status: 400 },
      )
    }

    const payload = await requestDashboardApi(`/summary?period=${period}`, accessToken, {
      method: 'GET',
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof DashboardApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao consultar os indicadores do dashboard.') },
      { status: 500 },
    )
  }
}
