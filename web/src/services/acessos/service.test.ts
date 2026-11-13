import { beforeEach, describe, expect, it } from 'vitest'

import { NOVA_ENTRADA as ENTRADA } from '@test/factories/payloads'
import { getFetchCall, jsonResponse, mockFetch, textResponse, type FetchMock } from '@test/fetch'

import {
  AccessRecordsServiceError,
  checkOutAccessRecord,
  listAccessRecords,
  registerAccessRecord,
} from './service'

const PAGINA = { items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 } }

describe('services/acessos', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  describe('listAccessRecords', () => {
    it('envia paginação, status e busca aparada ao BFF', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(PAGINA))

      await expect(listAccessRecords(2, 20, ' joana ', 'open')).resolves.toEqual(PAGINA)

      expect(getFetchCall(fetchMock).url).toBe(
        '/api/access-records?page=2&pageSize=20&status=open&search=joana',
      )
    })

    it('lança AccessRecordsServiceError em erro e em resposta sem paginação', async () => {
      fetchMock
        .mockResolvedValueOnce(textResponse('<html>500</html>', 500))
        .mockResolvedValueOnce(jsonResponse({ items: [] }))

      await expect(listAccessRecords(1, 10, '', 'all')).rejects.toThrow(
        'Nao foi possivel carregar os registros de acesso.',
      )
      await expect(listAccessRecords(1, 10, '', 'all')).rejects.toBeInstanceOf(
        AccessRecordsServiceError,
      )
    })
  })

  describe('registerAccessRecord', () => {
    it('envia POST /api/access-records com as pessoas e o veículo', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'acesso-1' }, 201))

      await expect(registerAccessRecord(ENTRADA)).resolves.toEqual({ id: 'acesso-1' })

      const call = getFetchCall(fetchMock)
      expect(call.url).toBe('/api/access-records')
      expect(call.init.method).toBe('POST')
      expect(JSON.parse(String(call.init.body))).toEqual(ENTRADA)
    })

    it('propaga a regra de negócio do BFF (ex.: pessoa já está dentro)', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Pessoa já está dentro.' }, 409))

      await expect(registerAccessRecord(ENTRADA)).rejects.toThrow('Pessoa já está dentro.')
    })

    it('rejeita sucesso sem id', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({}, 201))

      await expect(registerAccessRecord(ENTRADA)).rejects.toBeInstanceOf(AccessRecordsServiceError)
    })
  })

  describe('checkOutAccessRecord', () => {
    it('envia POST /api/access-records/check-out com id, observações e pessoas', async () => {
      const payload = { id: 'acesso-1', observations: 'Saiu', personIds: ['p-1'] }
      fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'acesso-1', isOpen: false }))

      await checkOutAccessRecord(payload)

      const call = getFetchCall(fetchMock)
      expect(call.url).toBe('/api/access-records/check-out')
      expect(call.init.method).toBe('POST')
      expect(JSON.parse(String(call.init.body))).toEqual(payload)
    })

    it('lança AccessRecordsServiceError com a mensagem do BFF', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Registro já encerrado.' }, 409))

      const error = await checkOutAccessRecord({ id: 'acesso-1' }).catch((e: unknown) => e)

      expect(error).toBeInstanceOf(AccessRecordsServiceError)
      expect(error).toHaveProperty('message', 'Registro já encerrado.')
    })
  })
})
