import {
  AccessRecordsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestAccessRecordsApi,
} from '../helpers'
import type { CheckOutAccessRecordRequest } from '../types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function parseCheckOutBody(body: unknown): CheckOutAccessRecordRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisicao invalido.')
  }

  const payload = body as Record<string, unknown>

  return {
    id: String(payload['id'] ?? ''),
    observations: typeof payload['observations'] === 'string' ? payload['observations'] : undefined,
    personIds: Array.isArray(payload['personIds'])
      ? payload['personIds'].map((personId) => String(personId ?? '').trim())
      : undefined,
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 })
  }

  let body: CheckOutAccessRecordRequest

  try {
    body = parseCheckOutBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisicao invalido.' }, { status: 400 })
  }

  const id = body.id.trim()

  if (!id) {
    return NextResponse.json(
      { message: 'ID do registro de acesso e obrigatorio.' },
      { status: 400 },
    )
  }

  try {
    const payload = await requestAccessRecordsApi(
      `/${encodeURIComponent(id)}/check-out`,
      accessToken,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ observations: body.observations, personIds: body.personIds }),
      },
    )

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof AccessRecordsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao registrar saida.') },
      { status: 500 },
    )
  }
}
