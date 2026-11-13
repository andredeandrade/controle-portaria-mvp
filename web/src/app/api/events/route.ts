import {
  EventsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestEventsApi,
} from './helpers'
import type { CreateEventRequest } from './types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type DeleteEventBody = {
  id: string
}

function parseDeleteBody(body: unknown): DeleteEventBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    id: String(payload['id'] ?? ''),
  }
}

function parseCreateBody(body: unknown): CreateEventRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido.')
  }

  const payload = body as Record<string, unknown>

  return {
    title: String(payload['title'] ?? ''),
    date: String(payload['date'] ?? ''),
    startTime: String(payload['startTime'] ?? ''),
    endTime: typeof payload['endTime'] === 'string' ? payload['endTime'] : undefined,
    unit: String(payload['unit'] ?? ''),
    space: typeof payload['space'] === 'string' ? payload['space'] : undefined,
    responsibleName: String(payload['responsibleName'] ?? ''),
    guests: Array.isArray(payload['guests'])
      ? (payload['guests'] as CreateEventRequest['guests'])
      : [],
    observations: typeof payload['observations'] === 'string' ? payload['observations'] : undefined,
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

    const payload = await requestEventsApi(`?${params.toString()}`, accessToken, {
      method: 'GET',
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof EventsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json({ message: 'Falha ao listar eventos.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  let body: CreateEventRequest

  try {
    body = parseCreateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  try {
    const payload = await requestEventsApi('', accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (error instanceof EventsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao cadastrar evento.') },
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

  let body: DeleteEventBody

  try {
    body = parseDeleteBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  const id = body.id.trim()

  if (!id) {
    return NextResponse.json({ message: 'ID do evento é obrigatório.' }, { status: 400 })
  }

  try {
    await requestEventsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'DELETE',
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof EventsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao excluir evento.') },
      { status: 500 },
    )
  }
}
