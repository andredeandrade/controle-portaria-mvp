import { beforeEach, describe, expect, it } from 'vitest'

import type { CreateVisitorRequest } from '@/app/api/visitors/types'
import { buildVisitor, buildVisitorsPage } from '@test/factories/visitors'
import { getFetchCall, jsonResponse, mockFetch, textResponse, type FetchMock } from '@test/fetch'

import {
  VisitorsServiceError,
  deleteVisitor,
  getVisitor,
  listVisitors,
  registerVisitor,
  updateVisitor,
} from './service'

const NOVO_VISITANTE: CreateVisitorRequest = {
  fullName: 'Joana Fictícia',
  document: '12345678',
  unit: 'Bloco A - 101',
  authorizedBy: 'Morador Fictício',
}

describe('services/visitantes', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  describe('listVisitors', () => {
    it('chama o BFF (nunca a API Express) com paginação e busca aparada', async () => {
      const page = buildVisitorsPage([buildVisitor()])
      fetchMock.mockResolvedValueOnce(jsonResponse(page))

      await expect(listVisitors(2, 20, '  joana ')).resolves.toEqual(page)

      const call = getFetchCall(fetchMock)
      expect(call.url).toBe('/api/visitors?page=2&pageSize=20&search=joana')
      expect(call.init.method).toBe('GET')
    })

    it('omite search quando vazio', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(buildVisitorsPage([])))

      await listVisitors(1, 10, '   ')

      expect(getFetchCall(fetchMock).url).toBe('/api/visitors?page=1&pageSize=10')
    })

    it('lança VisitorsServiceError com a mensagem do BFF em erro', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Não autenticado.' }, 401))

      const error = await listVisitors(1, 10, '').catch((e: unknown) => e)

      expect(error).toBeInstanceOf(VisitorsServiceError)
      expect(error).toHaveProperty('message', 'Não autenticado.')
    })

    it('usa a mensagem padrão quando o erro não tem corpo JSON', async () => {
      fetchMock.mockResolvedValueOnce(textResponse('<html>500</html>', 500))

      await expect(listVisitors(1, 10, '')).rejects.toThrow(
        'Nao foi possivel carregar os visitantes.',
      )
    })

    it('rejeita resposta 200 sem items/pagination', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ items: [] }))

      await expect(listVisitors(1, 10, '')).rejects.toThrow(
        'Resposta invalida ao carregar visitantes.',
      )
    })
  })

  describe('registerVisitor', () => {
    it('envia o payload em JSON via POST', async () => {
      const created = buildVisitor()
      fetchMock.mockResolvedValueOnce(jsonResponse(created, 201))

      await expect(registerVisitor(NOVO_VISITANTE)).resolves.toEqual(created)

      const call = getFetchCall(fetchMock)
      expect(call.url).toBe('/api/visitors')
      expect(call.init.method).toBe('POST')
      expect(call.headers.get('Content-Type')).toBe('application/json')
      expect(JSON.parse(String(call.init.body))).toEqual(NOVO_VISITANTE)
    })

    it('propaga a mensagem de validação do BFF', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Documento já cadastrado.' }, 409))

      await expect(registerVisitor(NOVO_VISITANTE)).rejects.toThrow('Documento já cadastrado.')
    })

    it('rejeita resposta de sucesso sem id', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({}, 201))

      await expect(registerVisitor(NOVO_VISITANTE)).rejects.toThrow(
        'Resposta invalida ao cadastrar visitante.',
      )
    })
  })

  describe('getVisitor / updateVisitor / deleteVisitor', () => {
    it('getVisitor usa o id na URL', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(buildVisitor({ id: 'v-9' })))

      await expect(getVisitor('v-9')).resolves.toMatchObject({ id: 'v-9' })
      expect(getFetchCall(fetchMock).url).toBe('/api/visitors/v-9')
    })

    it('getVisitor traduz 404 (ex.: id de outro condomínio) em VisitorsServiceError', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Visitante não encontrado.' }, 404))

      await expect(getVisitor('v-condominio-b')).rejects.toBeInstanceOf(VisitorsServiceError)
    })

    it('updateVisitor envia PATCH com o payload', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(buildVisitor({ id: 'v-9' })))

      await updateVisitor('v-9', NOVO_VISITANTE)

      const call = getFetchCall(fetchMock)
      expect(call.url).toBe('/api/visitors/v-9')
      expect(call.init.method).toBe('PATCH')
      expect(JSON.parse(String(call.init.body))).toEqual(NOVO_VISITANTE)
    })

    it('deleteVisitor envia o id no corpo e aceita 204', async () => {
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))

      await expect(deleteVisitor('v-9')).resolves.toBeUndefined()

      const call = getFetchCall(fetchMock)
      expect(call.init.method).toBe('DELETE')
      expect(JSON.parse(String(call.init.body))).toEqual({ id: 'v-9' })
    })

    it('deleteVisitor lança erro com fallback quando o BFF falha sem corpo', async () => {
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }))

      await expect(deleteVisitor('v-9')).rejects.toThrow('Não foi possível excluir o visitante.')
    })
  })
})
