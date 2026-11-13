import {
  AccessRecordsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestAccessRecordsApi,
} from './helpers'
import type { CreateAccessRecordRequest } from './types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function parseCreateBody(body: unknown): CreateAccessRecordRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisicao invalido.')
  }

  const payload = body as Record<string, unknown>

  const people = Array.isArray(payload['people'])
    ? payload['people'].map((person) => {
        const personPayload = person as Record<string, unknown>

        return {
          category: String(personPayload['category'] ?? ''),
          name: String(personPayload['name'] ?? ''),
          document:
            typeof personPayload['document'] === 'string' ? personPayload['document'] : undefined,
          unit: typeof personPayload['unit'] === 'string' ? personPayload['unit'] : undefined,
        }
      })
    : []

  return {
    people,
    company: typeof payload['company'] === 'string' ? payload['company'] : undefined,
    locomotion: typeof payload['locomotion'] === 'string' ? payload['locomotion'] : undefined,
    color: typeof payload['color'] === 'string' ? payload['color'] : undefined,
    plate: typeof payload['plate'] === 'string' ? payload['plate'] : undefined,
    brandModel: typeof payload['brandModel'] === 'string' ? payload['brandModel'] : undefined,
    observations: typeof payload['observations'] === 'string' ? payload['observations'] : undefined,
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
    const status = requestUrl.searchParams.get('status')?.trim() ?? 'all'

    const params = new URLSearchParams({ page, pageSize, status })

    if (search) {
      params.set('search', search)
    }

    const payload = await requestAccessRecordsApi(`?${params.toString()}`, accessToken, {
      method: 'GET',
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof AccessRecordsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao listar registros de acesso.') },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 })
  }

  let body: CreateAccessRecordRequest

  try {
    body = parseCreateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisicao invalido.' }, { status: 400 })
  }

  try {
    const payload = await requestAccessRecordsApi('/check-in', accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (error instanceof AccessRecordsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao registrar entrada.') },
      { status: 500 },
    )
  }
}
