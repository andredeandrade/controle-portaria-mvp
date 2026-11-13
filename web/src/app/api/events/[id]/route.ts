import {
  EventsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestEventsApi,
} from '../helpers'
import type { UpdateEventRequest } from '../types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function parseUpdateBody(body: unknown): UpdateEventRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    title: typeof payload['title'] === 'string' ? payload['title'] : undefined,
    date: typeof payload['date'] === 'string' ? payload['date'] : undefined,
    startTime: typeof payload['startTime'] === 'string' ? payload['startTime'] : undefined,
    endTime: typeof payload['endTime'] === 'string' ? payload['endTime'] : undefined,
    unit: typeof payload['unit'] === 'string' ? payload['unit'] : undefined,
    space: typeof payload['space'] === 'string' ? payload['space'] : undefined,
    responsibleName:
      typeof payload['responsibleName'] === 'string' ? payload['responsibleName'] : undefined,
    guests: Array.isArray(payload['guests'])
      ? (payload['guests'] as UpdateEventRequest['guests'])
      : undefined,
    observations: typeof payload['observations'] === 'string' ? payload['observations'] : undefined,
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  try {
    const payload = await requestEventsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'GET',
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof EventsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao consultar evento.') },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  let body: UpdateEventRequest

  try {
    body = parseUpdateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  try {
    const payload = await requestEventsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof EventsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao atualizar evento.') },
      { status: 500 },
    )
  }
}
