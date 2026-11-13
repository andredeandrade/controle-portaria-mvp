import {
  AuthorizationsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestAuthorizationsApi,
} from '../helpers'
import type { CreateAuthorizationRequest } from '../types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function parseUpdateBody(body: unknown): CreateAuthorizationRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  try {
    const payload = await requestAuthorizationsApi(`/${encodeURIComponent(id)}`, accessToken, {
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

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao consultar autorização.') },
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

  let body: CreateAuthorizationRequest

  try {
    body = parseUpdateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  try {
    const payload = await requestAuthorizationsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof AuthorizationsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao atualizar autorização.') },
      { status: 500 },
    )
  }
}
