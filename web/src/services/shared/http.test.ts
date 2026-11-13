import { describe, expect, it } from 'vitest'

import { jsonResponse, textResponse } from '@test/fetch'
import { getApiErrorMessage, safeReadJson } from './http'

describe('getApiErrorMessage', () => {
  it('usa o campo message do payload do BFF', () => {
    expect(getApiErrorMessage({ message: 'Morador não encontrado.' }, 'fallback')).toBe(
      'Morador não encontrado.',
    )
  })

  it.each([
    ['nulo', null],
    ['string', 'erro'],
    ['message vazio', { message: '   ' }],
    ['message não-string', { message: 42 }],
    ['objeto sem message', { foo: 'bar' }],
  ])('retorna o fallback para payload %s', (_label, payload) => {
    expect(getApiErrorMessage(payload, 'Falha genérica.')).toBe('Falha genérica.')
  })
})

describe('safeReadJson', () => {
  it('devolve o corpo JSON', async () => {
    await expect(safeReadJson(jsonResponse({ id: 'r1' }))).resolves.toEqual({ id: 'r1' })
  })

  it('devolve null para corpo que não é JSON', async () => {
    await expect(safeReadJson(textResponse('<html>Bad Gateway</html>', 502))).resolves.toBeNull()
  })

  it('devolve null para corpo vazio (ex.: 204)', async () => {
    await expect(safeReadJson(new Response(null, { status: 204 }))).resolves.toBeNull()
  })
})
