import {
  ResidentsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestResidentsApi,
} from './helpers'
import type { CreateResidentRequest } from './types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/** Lê `units` (lista) ou, por compatibilidade, `unit` (texto único). */
function parseUnits(payload: Record<string, unknown>): string[] {
  if (Array.isArray(payload['units'])) {
    return payload['units'].map((unit) => String(unit ?? ''))
  }

  return typeof payload['unit'] === 'string' ? [payload['unit']] : []
}

function parseCreateBody(body: unknown): CreateResidentRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    fullName: String(payload['fullName'] ?? ''),
    units: parseUnits(payload),
    relation: String(payload['relation'] ?? '') as CreateResidentRequest['relation'],
    email: typeof payload['email'] === 'string' ? payload['email'] : undefined,
    phone: typeof payload['phone'] === 'string' ? payload['phone'] : undefined,
    document: String(payload['document'] ?? ''),
    observations: typeof payload['observations'] === 'string' ? payload['observations'] : undefined,
    vehicles: Array.isArray(payload['vehicles'])
      ? (payload['vehicles'] as CreateResidentRequest['vehicles'])
      : undefined,
  }
}

type DeleteResidentBody = {
  id: string
}

function parseDeleteBody(body: unknown): DeleteResidentBody {
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

    const payload = await requestResidentsApi(`?${params.toString()}`, accessToken, {
      method: 'GET',
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof ResidentsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json({ message: 'Falha ao listar moradores.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  let body: CreateResidentRequest

  try {
    body = parseCreateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  try {
    const payload = await requestResidentsApi('', accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (error instanceof ResidentsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao cadastrar morador.') },
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

  let body: DeleteResidentBody

  try {
    body = parseDeleteBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  const id = body.id.trim()

  if (!id) {
    return NextResponse.json({ message: 'ID do morador é obrigatório.' }, { status: 400 })
  }

  try {
    await requestResidentsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'DELETE',
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof ResidentsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao excluir morador.') },
      { status: 500 },
    )
  }
}
