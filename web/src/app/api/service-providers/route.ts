import {
  ServiceProvidersApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestServiceProvidersApi,
} from './helpers'
import type { CreateServiceProviderRequest } from './types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type DeleteServiceProviderBody = {
  id: string
}

function parseDeleteBody(body: unknown): DeleteServiceProviderBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    id: String(payload['id'] ?? ''),
  }
}

function parseCreateBody(body: unknown): CreateServiceProviderRequest {
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

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
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

    const payload = await requestServiceProvidersApi(`?${params.toString()}`, accessToken, {
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
      { message: 'Falha ao listar prestadores de serviço.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  let body: CreateServiceProviderRequest

  try {
    body = parseCreateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  try {
    const payload = await requestServiceProvidersApi('', accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (error instanceof ServiceProvidersApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao cadastrar prestador de serviço.') },
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

  let body: DeleteServiceProviderBody

  try {
    body = parseDeleteBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  const id = body.id.trim()

  if (!id) {
    return NextResponse.json(
      { message: 'ID do prestador de serviço é obrigatório.' },
      { status: 400 },
    )
  }

  try {
    await requestServiceProvidersApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'DELETE',
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof ServiceProvidersApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao excluir prestador de serviço.') },
      { status: 500 },
    )
  }
}
