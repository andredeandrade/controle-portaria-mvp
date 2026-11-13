import {
  EventsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestEventsApi,
} from '../helpers'
import type { CreateEventGuestRequest } from '../types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type CreateGuestBody = CreateEventGuestRequest & {
  eventId: string
}

function parseCreateBody(body: unknown): CreateGuestBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    eventId: String(payload['eventId'] ?? ''),
    name: String(payload['name'] ?? ''),
    document: typeof payload['document'] === 'string' ? payload['document'] : undefined,
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  let body: CreateGuestBody

  try {
    body = parseCreateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  const eventId = body.eventId.trim()
  const name = body.name.trim()

  if (!eventId || !name) {
    return NextResponse.json(
      { message: 'ID do evento e nome do convidado são obrigatórios.' },
      { status: 400 },
    )
  }

  try {
    const payload = await requestEventsApi(`/${encodeURIComponent(eventId)}/guests`, accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        document: body.document,
      }),
    })

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (error instanceof EventsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao adicionar convidado.') },
      { status: 500 },
    )
  }
}
