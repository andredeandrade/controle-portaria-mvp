import {
  EventsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestEventsApi,
} from '../helpers'
import type { CreateEventVehicleRequest } from '../types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type CreateVehicleBody = CreateEventVehicleRequest & {
  eventId: string
}

type DeleteVehicleBody = {
  eventId: string
  vehicleId: string
}

function parseCreateBody(body: unknown): CreateVehicleBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    eventId: String(payload['eventId'] ?? ''),
    plate: String(payload['plate'] ?? ''),
    brandModel: typeof payload['brandModel'] === 'string' ? payload['brandModel'] : undefined,
    driverName: typeof payload['driverName'] === 'string' ? payload['driverName'] : undefined,
    driverDocument:
      typeof payload['driverDocument'] === 'string' ? payload['driverDocument'] : undefined,
    color: typeof payload['color'] === 'string' ? payload['color'] : undefined,
  }
}

function parseDeleteBody(body: unknown): DeleteVehicleBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    eventId: String(payload['eventId'] ?? ''),
    vehicleId: String(payload['vehicleId'] ?? ''),
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  let body: CreateVehicleBody

  try {
    body = parseCreateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  const eventId = body.eventId.trim()
  const plate = body.plate.trim()

  if (!eventId || !plate) {
    return NextResponse.json(
      { message: 'ID do evento e placa do veículo são obrigatórios.' },
      { status: 400 },
    )
  }

  try {
    const payload = await requestEventsApi(
      `/${encodeURIComponent(eventId)}/vehicles`,
      accessToken,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plate,
          brandModel: body.brandModel,
          driverName: body.driverName,
          driverDocument: body.driverDocument,
          color: body.color,
        }),
      },
    )

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (error instanceof EventsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao adicionar veículo.') },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  let body: DeleteVehicleBody

  try {
    body = parseDeleteBody(await request.json())
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
      `/${encodeURIComponent(eventId)}/vehicles/${encodeURIComponent(vehicleId)}`,
      accessToken,
      {
        method: 'DELETE',
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
      { message: getThrowableMessage(error, 'Falha ao remover veículo.') },
      { status: 500 },
    )
  }
}
