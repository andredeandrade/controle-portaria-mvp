import {
  ServiceProvidersApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestServiceProvidersApi,
} from '../helpers'
import type { CreateServiceProviderRequest } from '../types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function parseUpdateBody(body: unknown): CreateServiceProviderRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    companyName: String(payload['companyName'] ?? ''),
    responsibleName: String(payload['responsibleName'] ?? ''),
    document: String(payload['document'] ?? ''),
    phone: typeof payload['phone'] === 'string' ? payload['phone'] : undefined,
    email: typeof payload['email'] === 'string' ? payload['email'] : undefined,
    serviceType: String(payload['serviceType'] ?? ''),
    unit: typeof payload['unit'] === 'string' ? payload['unit'] : undefined,
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
    const payload = await requestServiceProvidersApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'GET',
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof ServiceProvidersApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao consultar prestador de serviço.') },
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

  let body: CreateServiceProviderRequest

  try {
    body = parseUpdateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  try {
    const payload = await requestServiceProvidersApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof ServiceProvidersApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao atualizar prestador de serviço.') },
      { status: 500 },
    )
  }
}
