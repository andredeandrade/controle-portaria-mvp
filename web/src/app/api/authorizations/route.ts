import {
  AuthorizationsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestAuthorizationsApi,
} from './helpers'
import type { CreateAuthorizationRequest } from './types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function parseCreateBody(body: unknown): CreateAuthorizationRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisicao invalido.')
  }

  const payload = body as Record<string, unknown>

  return {
    authorizedName: String(payload['authorizedName'] ?? ''),
    personType: String(payload['personType'] ?? ''),
    document: String(payload['document'] ?? ''),
    phone: typeof payload['phone'] === 'string' ? payload['phone'] : undefined,
    company: typeof payload['company'] === 'string' ? payload['company'] : undefined,
    unit: String(payload['unit'] ?? ''),
    authorizedBy: String(payload['authorizedBy'] ?? ''),
    validFromDate: String(payload['validFromDate'] ?? ''),
    validFromTime: String(payload['validFromTime'] ?? ''),
    validToDate: String(payload['validToDate'] ?? ''),
    validToTime: String(payload['validToTime'] ?? ''),
    observations: typeof payload['observations'] === 'string' ? payload['observations'] : undefined,
  }
}

type DeleteAuthorizationBody = {
  id: string
}

function parseDeleteBody(body: unknown): DeleteAuthorizationBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisicao invalido.')
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
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 })
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

    const payload = await requestAuthorizationsApi(`?${params.toString()}`, accessToken, {
      method: 'GET',
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof AuthorizationsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json({ message: 'Falha ao listar autorizacoes.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 })
  }

  let body: CreateAuthorizationRequest

  try {
    body = parseCreateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisicao invalido.' }, { status: 400 })
  }

  try {
    const payload = await requestAuthorizationsApi('', accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (error instanceof AuthorizationsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao cadastrar autorizacao.') },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 })
  }

  let body: DeleteAuthorizationBody

  try {
    body = parseDeleteBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisicao invalido.' }, { status: 400 })
  }

  const id = body.id.trim()

  if (!id) {
    return NextResponse.json({ message: 'ID da autorizacao e obrigatorio.' }, { status: 400 })
  }

  try {
    await requestAuthorizationsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'DELETE',
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof AuthorizationsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao excluir autorizacao.') },
      { status: 500 },
    )
  }
}
