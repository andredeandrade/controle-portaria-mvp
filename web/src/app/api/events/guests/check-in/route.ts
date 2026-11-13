import {
  EventsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestEventsApi,
} from '../../helpers'
import type { CheckInEventGuestRequest } from '../../types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type CheckInGuestBody = CheckInEventGuestRequest & {
  eventId: string
  guestId: string
}

function parseVehicle(value: unknown): CheckInEventGuestRequest['vehicle'] {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const payload = value as Record<string, unknown>

  return {
    plate: typeof payload['plate'] === 'string' ? payload['plate'] : undefined,
    brandModel: typeof payload['brandModel'] === 'string' ? payload['brandModel'] : undefined,
    color: typeof payload['color'] === 'string' ? payload['color'] : undefined,
  }
}

function parseCheckInBody(body: unknown): CheckInGuestBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    eventId: String(payload['eventId'] ?? ''),
    guestId: String(payload['guestId'] ?? ''),
    document: typeof payload['document'] === 'string' ? payload['document'] : undefined,
    vehicle: parseVehicle(payload['vehicle']),
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  let body: CheckInGuestBody

  try {
    body = parseCheckInBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  const eventId = body.eventId.trim()
  const guestId = body.guestId.trim()

  if (!eventId || !guestId) {
    return NextResponse.json(
      { message: 'ID do evento e do convidado são obrigatórios.' },
      { status: 400 },
    )
  }

  try {
    const payload = await requestEventsApi(
      `/${encodeURIComponent(eventId)}/guests/${encodeURIComponent(guestId)}/check-in`,
      accessToken,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document: body.document,
          vehicle: body.vehicle,
        }),
      },
    )

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof EventsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao registrar entrada do convidado.') },
      { status: 500 },
    )
  }
}
