import { vi, type Mock } from 'vitest'

export type FetchMock = Mock<typeof fetch>

/**
 * Substitui o `fetch` global por um `vi.fn()` tipado (restaurado após cada teste
 * via `unstubGlobals`). Cada chamada não configurada falha alto, para não
 * mascarar requisições inesperadas.
 */
export function mockFetch(): FetchMock {
  const fetchMock: FetchMock = vi.fn<typeof fetch>(async (input) => {
    throw new Error(`fetch não esperado: ${String(input)}`)
  })

  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

/** Resposta JSON como a API Express/BFF devolveria. */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Resposta com corpo que não é JSON (ex.: HTML de erro de proxy reverso). */
export function textResponse(body: string, status: number): Response {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html' } })
}

export type FetchCall = {
  url: string
  init: RequestInit
  headers: Headers
}

/** Normaliza a n-ésima chamada do mock para asserts de URL/headers/corpo. */
export function getFetchCall(fetchMock: FetchMock, index = 0): FetchCall {
  const call = fetchMock.mock.calls[index]

  if (!call) {
    throw new Error(`fetch não foi chamado ${index + 1} vez(es)`)
  }

  const [input, init = {}] = call

  return {
    url: input instanceof Request ? input.url : String(input),
    init,
    headers: new Headers(init.headers),
  }
}
