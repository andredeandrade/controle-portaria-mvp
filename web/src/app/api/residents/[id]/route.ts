import {
  ResidentsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestResidentsApi,
} from '../helpers'
import type { CreateResidentRequest } from '../types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/** Lê `units` (lista) ou, por compatibilidade, `unit` (texto único). */
function parseUnits(payload: Record<string, unknown>): string[] {
  if (Array.isArray(payload['units'])) {
    return payload['units'].map((unit) => String(unit ?? ''))
  }

  return typeof payload['unit'] === 'string' ? [payload['unit']] : []
}

function parseUpdateBody(body: unknown): CreateResidentRequest {
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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  try {
    const payload = await requestResidentsApi(`/${encodeURIComponent(id)}`, accessToken, {
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

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao consultar morador.') },
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

  let body: CreateResidentRequest

  try {
    body = parseUpdateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  try {
    const payload = await requestResidentsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof ResidentsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao atualizar morador.') },
      { status: 500 },
    )
  }
}
