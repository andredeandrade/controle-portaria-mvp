import {
  VisitorsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestVisitorsApi,
} from '../helpers'
import type { CreateVisitorRequest } from '../types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function parseUpdateBody(body: unknown): CreateVisitorRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    fullName: String(payload['fullName'] ?? ''),
    document: String(payload['document'] ?? ''),
    phone: typeof payload['phone'] === 'string' ? payload['phone'] : undefined,
    email: typeof payload['email'] === 'string' ? payload['email'] : undefined,
    unit: String(payload['unit'] ?? ''),
    authorizedBy: String(payload['authorizedBy'] ?? ''),
    observations: typeof payload['observations'] === 'string' ? payload['observations'] : undefined,
    vehiclePlate: typeof payload['vehiclePlate'] === 'string' ? payload['vehiclePlate'] : undefined,
    vehicleBrandModel:
      typeof payload['vehicleBrandModel'] === 'string' ? payload['vehicleBrandModel'] : undefined,
    vehicleColor: typeof payload['vehicleColor'] === 'string' ? payload['vehicleColor'] : undefined,
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
    const payload = await requestVisitorsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'GET',
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof VisitorsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao consultar visitante.') },
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

  let body: CreateVisitorRequest

  try {
    body = parseUpdateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  try {
    const payload = await requestVisitorsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof VisitorsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao atualizar visitante.') },
      { status: 500 },
    )
  }
}
