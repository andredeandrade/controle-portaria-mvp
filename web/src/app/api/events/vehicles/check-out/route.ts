import {
  EventsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestEventsApi,
} from '../../helpers'
import type { CheckOutEventVehicleRequest } from '../../types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type CheckOutVehicleBody = CheckOutEventVehicleRequest & {
  eventId: string
  vehicleId: string
}

function parseGuestIds(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const guestIds = value.filter((item): item is string => typeof item === 'string')

  return guestIds.length ? guestIds : undefined
}

function parseCheckOutBody(body: unknown): CheckOutVehicleBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    eventId: String(payload['eventId'] ?? ''),
    vehicleId: String(payload['vehicleId'] ?? ''),
    guestIds: parseGuestIds(payload['guestIds']),
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  let body: CheckOutVehicleBody

  try {
    body = parseCheckOutBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  const eventId = body.eventId.trim()
  const vehicleId = body.vehicleId.trim()

  if (!eventId || !vehicleId) {
    return NextResponse.json(
      { message: 'ID do evento e do veículo são obrigatórios.' },
      { status: 400 },
    )
  }

  try {
    const payload = await requestEventsApi(
      `/${encodeURIComponent(eventId)}/vehicles/${encodeURIComponent(vehicleId)}/check-out`,
      accessToken,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestIds: body.guestIds,
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
      { message: getThrowableMessage(error, 'Falha ao registrar saída do veículo.') },
      { status: 500 },
    )
  }
}
