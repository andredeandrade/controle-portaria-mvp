import {
  IncidentsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestIncidentsApi,
} from './helpers'
import type { CreateIncidentRequest } from './types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function parseCreateBody(body: unknown): CreateIncidentRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisicao invalido.')
  }

  const payload = body as Record<string, unknown>

  return {
    occurrenceType: String(payload['occurrenceType'] ?? ''),
    date: String(payload['date'] ?? ''),
    time: String(payload['time'] ?? ''),
    report: String(payload['report'] ?? ''),
    place: String(payload['place'] ?? ''),
  }
}

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 })
  }

  try {
    const requestUrl = new URL(request.url)
    const page = requestUrl.searchParams.get('page') ?? '1'
    const pageSize = requestUrl.searchParams.get('pageSize') ?? '10'
    const search = requestUrl.searchParams.get('search')?.trim() ?? ''

    const params = new URLSearchParams({ page, pageSize })

    if (search) {
      params.set('search', search)
    }

    const payload = await requestIncidentsApi(`?${params.toString()}`, accessToken, {
      method: 'GET',
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof IncidentsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json({ message: 'Falha ao listar ocorrencias.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 })
  }

  let body: CreateIncidentRequest

  try {
    body = parseCreateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisicao invalido.' }, { status: 400 })
  }

  try {
    const payload = await requestIncidentsApi('', accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (error instanceof IncidentsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao cadastrar ocorrencia.') },
      { status: 500 },
    )
  }
}
