import {
  IncidentsApiError,
  clearAccessToken,
  getThrowableMessage,
  readAccessToken,
  requestIncidentsApi,
} from '../helpers'
import type { CreateIncidentRequest } from '../types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function parseUpdateBody(body: unknown): CreateIncidentRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisicao invalido.')
  }

  const payload = body as Record<string, unknown>

  return {
    occurrenceType: String(payload['occurrenceType'] ?? ''),
    date: String(payload['date'] ?? ''),
    time: String(payload['time'] ?? ''),
    report: String(payload['report'] ?? ''),
    place: String(payload['place'] ?? ''),
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 })
  }

  try {
    const payload = await requestIncidentsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'GET',
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof IncidentsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao consultar ocorrencia.') },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 })
  }

  let body: CreateIncidentRequest

  try {
    body = parseUpdateBody(await request.json())
  } catch {
    return NextResponse.json({ message: 'Corpo da requisicao invalido.' }, { status: 400 })
  }

  try {
    const payload = await requestIncidentsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    if (error instanceof IncidentsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao atualizar ocorrencia.') },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const accessToken = readAccessToken(cookieStore)

  if (!accessToken) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 })
  }

  try {
    await requestIncidentsApi(`/${encodeURIComponent(id)}`, accessToken, {
      method: 'DELETE',
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof IncidentsApiError) {
      if (error.clearCookie) {
        clearAccessToken(cookieStore)
      }

      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { message: getThrowableMessage(error, 'Falha ao excluir ocorrencia.') },
      { status: 500 },
    )
  }
}
