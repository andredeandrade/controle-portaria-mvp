import {
  VisitorsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestVisitorsApi,
} from './helpers'
import type { CreateVisitorRequest } from './types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function parseCreateBody(body: unknown): CreateVisitorRequest {
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

type DeleteVisitorBody = {
  id: string
}

function parseDeleteBody(body: unknown): DeleteVisitorBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    id: String(payload['id'] ?? ''),
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

    const payload = await requestVisitorsApi(`?${params.toString()}`, accessToken, {
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

    return NextResponse.json({ message: 'Falha ao listar visitantes.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  let body: CreateVisitorRequest

  try {
    body = parseCreateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  try {
    const payload = await requestVisitorsApi('', accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (error instanceof VisitorsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao cadastrar visitante.') },
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

  let body: DeleteVisitorBody

  try {
    body = parseDeleteBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  const id = body.id.trim()

  if (!id) {
    return NextResponse.json({ message: 'ID do visitante é obrigatório.' }, { status: 400 })
  }

  try {
    await requestVisitorsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'DELETE',
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof VisitorsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao excluir visitante.') },
      { status: 500 },
    )
  }
}
