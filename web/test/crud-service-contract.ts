import { beforeEach, describe, expect, it } from 'vitest'

import { getFetchCall, jsonResponse, mockFetch, textResponse, type FetchMock } from './fetch'

type CrudServiceContract<TCreate> = {
  /** Rota do BFF, ex.: `/api/residents`. */
  bffPath: string
  ServiceError: new (message: string) => Error
  list: (page: number, pageSize: number, search: string) => Promise<unknown>
  register: (payload: TCreate) => Promise<unknown>
  get: (id: string) => Promise<unknown>
  update: (id: string, payload: TCreate) => Promise<unknown>
  remove: (id: string) => Promise<void>
  createPayload: TCreate
  /**
   * Como o `DELETE` identifica o registro: `body` → `DELETE <bffPath>` com
   * `{ id }`; `path` → `DELETE <bffPath>/<id>`.
   */
  deleteBy: 'body' | 'path'
}

const PAGINA_VAZIA = { items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 } }

/**
 * Contrato dos `services/<domain>/service.ts` de CRUD (list/register/get/update/delete),
 * que são duplicados por domínio: sempre falam com o BFF (`/api/...`), nunca com a
 * API Express, e lançam `<Domain>ServiceError` em resposta não-ok ou malformada.
 */
export function describeCrudServiceContract<TCreate>(contract: CrudServiceContract<TCreate>): void {
  const { bffPath, ServiceError, createPayload } = contract

  describe(`service de ${bffPath} (contrato)`, () => {
    let fetchMock: FetchMock

    beforeEach(() => {
      fetchMock = mockFetch()
    })

    describe('list', () => {
      it('chama o BFF com paginação e busca aparada', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(PAGINA_VAZIA))

        await expect(contract.list(2, 20, '  termo ')).resolves.toEqual(PAGINA_VAZIA)

        const call = getFetchCall(fetchMock)
        expect(call.url).toBe(`${bffPath}?page=2&pageSize=20&search=termo`)
        expect(call.init.method).toBe('GET')
      })

      it('omite search vazio', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(PAGINA_VAZIA))

        await contract.list(1, 10, '   ')

        expect(getFetchCall(fetchMock).url).toBe(`${bffPath}?page=1&pageSize=10`)
      })

      it('lança ServiceError com a mensagem do BFF', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Não autenticado.' }, 401))

        const error = await contract.list(1, 10, '').catch((e: unknown) => e)

        expect(error).toBeInstanceOf(ServiceError)
        expect(error).toHaveProperty('message', 'Não autenticado.')
      })

      it('lança ServiceError com mensagem padrão quando o erro não é JSON', async () => {
        fetchMock.mockResolvedValueOnce(textResponse('<html>502</html>', 502))

        const error = await contract.list(1, 10, '').catch((e: unknown) => e)

        expect(error).toBeInstanceOf(ServiceError)
        expect((error as Error).message).not.toBe('')
      })

      it('rejeita resposta 200 sem items/pagination', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ items: [] }))

        await expect(contract.list(1, 10, '')).rejects.toBeInstanceOf(ServiceError)
      })
    })

    describe('register', () => {
      it('envia POST em JSON com o payload', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'novo-1' }, 201))

        await expect(contract.register(createPayload)).resolves.toEqual({ id: 'novo-1' })

        const call = getFetchCall(fetchMock)
        expect(call.url).toBe(bffPath)
        expect(call.init.method).toBe('POST')
        expect(call.headers.get('Content-Type')).toBe('application/json')
        expect(JSON.parse(String(call.init.body))).toEqual(createPayload)
      })

      it('propaga a mensagem de validação do BFF', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Documento já cadastrado.' }, 409))

        const error = await contract.register(createPayload).catch((e: unknown) => e)

        expect(error).toBeInstanceOf(ServiceError)
        expect(error).toHaveProperty('message', 'Documento já cadastrado.')
      })

      it('rejeita sucesso sem id', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({}, 201))

        await expect(contract.register(createPayload)).rejects.toBeInstanceOf(ServiceError)
      })
    })

    describe('get / update / delete', () => {
      it('get usa o id na URL', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'reg-9' }))

        await expect(contract.get('reg-9')).resolves.toEqual({ id: 'reg-9' })

        const call = getFetchCall(fetchMock)
        expect(call.url).toBe(`${bffPath}/reg-9`)
        expect(call.init.method).toBe('GET')
      })

      it('get traduz 404 (ex.: id de outro condomínio) em ServiceError', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Não encontrado.' }, 404))

        await expect(contract.get('reg-condominio-b')).rejects.toThrow(ServiceError)
      })

      it('get rejeita sucesso sem id', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({}))

        await expect(contract.get('reg-9')).rejects.toBeInstanceOf(ServiceError)
      })

      it('update envia PATCH com o payload', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'reg-9' }))

        await contract.update('reg-9', createPayload)

        const call = getFetchCall(fetchMock)
        expect(call.url).toBe(`${bffPath}/reg-9`)
        expect(call.init.method).toBe('PATCH')
        expect(JSON.parse(String(call.init.body))).toEqual(createPayload)
      })

      it('update lança ServiceError em erro e em sucesso sem id', async () => {
        fetchMock
          .mockResolvedValueOnce(jsonResponse({ message: 'Sem permissão.' }, 403))
          .mockResolvedValueOnce(jsonResponse({}))

        await expect(contract.update('reg-9', createPayload)).rejects.toThrow('Sem permissão.')
        await expect(contract.update('reg-9', createPayload)).rejects.toBeInstanceOf(ServiceError)
      })

      it(`delete identifica o registro por ${contract.deleteBy} e aceita 204`, async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))

        await expect(contract.remove('reg-9')).resolves.toBeUndefined()

        const call = getFetchCall(fetchMock)
        expect(call.init.method).toBe('DELETE')
        if (contract.deleteBy === 'body') {
          expect(call.url).toBe(bffPath)
          expect(JSON.parse(String(call.init.body))).toEqual({ id: 'reg-9' })
        } else {
          expect(call.url).toBe(`${bffPath}/reg-9`)
        }
      })

      it('delete lança ServiceError quando o BFF falha sem corpo', async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }))

        await expect(contract.remove('reg-9')).rejects.toBeInstanceOf(ServiceError)
      })
    })
  })
}
