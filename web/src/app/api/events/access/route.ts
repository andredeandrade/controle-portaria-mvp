import {
  EventsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestEventsApi,
} from '../helpers'
import type { RegisterEventAccessRequest } from '../types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type RegisterAccessBody = RegisterEventAccessRequest & {
  eventId: string
}

function parseVehicle(
  value: unknown,
): RegisterEventAccessRequest['vehicle'] {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const payload = value as Record<string, unknown>

  return {
    driverName: typeof payload['driverName'] === 'string' ? payload['driverName'] : undefined,
    driverDocument:
      typeof payload['driverDocument'] === 'string' ? payload['driverDocument'] : undefined,
    plate: typeof payload['plate'] === 'string' ? payload['plate'] : undefined,
    brandModel: typeof payload['brandModel'] === 'string' ? payload['brandModel'] : undefined,
    color: typeof payload['color'] === 'string' ? payload['color'] : undefined,
  }
}

function parseGuests(value: unknown): RegisterEventAccessRequest['guests'] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      guestId: String(item['guestId'] ?? ''),
      document: typeof item['document'] === 'string' ? item['document'] : undefined,
    }))
    .filter((item) => item.guestId)
}

function parseNewGuests(value: unknown): RegisterEventAccessRequest['newGuests'] {
  if (!Array.isArray(value)) {
    return undefined
  }

  const newGuests = value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      name: String(item['name'] ?? ''),
      document: typeof item['document'] === 'string' ? item['document'] : undefined,
    }))
    .filter((item) => item.name)

  return newGuests.length ? newGuests : undefined
}

function parseRegisterAccessBody(body: unknown): RegisterAccessBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    eventId: String(payload['eventId'] ?? ''),
    movementType: payload['movementType'] as RegisterEventAccessRequest['movementType'],
    vehicle: parseVehicle(payload['vehicle']),
    guests: parseGuests(payload['guests']),
    newGuests: parseNewGuests(payload['newGuests']),
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  let body: RegisterAccessBody

  try {
    body = parseRegisterAccessBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  const eventId = body.eventId.trim()

  if (!eventId || !body.movementType) {
    return NextResponse.json(
      { message: 'ID do evento e tipo de movimentação são obrigatórios.' },
      { status: 400 },
    )
  }

  try {
    const payload = await requestEventsApi(`/${encodeURIComponent(eventId)}/access`, accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        movementType: body.movementType,
        vehicle: body.vehicle,
        guests: body.guests,
        newGuests: body.newGuests,
      }),
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
      { message: getThrowableMessage(error, 'Falha ao registrar acesso do evento.') },
      { status: 500 },
    )
  }
}
