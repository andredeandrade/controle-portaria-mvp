import { screen, waitFor, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { renderWithProviders } from '@test/render'

import { RegisterResidentForm } from './RegisterResidentForm'

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))

// Fronteira do framework: o App Router não existe fora do Next.
vi.mock('next/navigation', () => ({ useRouter: () => router }))

/** Os rótulos não são `<label for>`; buscamos pelo `name` registrado no RHF. */
function field(container: HTMLElement, name: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(`[name="${name}"]`)

  if (!element) {
    throw new Error(`campo ${name} não encontrado`)
  }

  return element
}

/** Abre o select MUI de índice `index` (ordem: vínculo, tipo do veículo, cor) e escolhe a opção. */
async function selectOption(user: UserEvent, index: number, option: string): Promise<void> {
  const combobox = screen.getAllByRole('combobox')[index]

  if (!combobox) {
    throw new Error(`select ${index} não encontrado`)
  }

  await user.click(combobox)
  await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: option }))
}

async function fillRequired(user: UserEvent, container: HTMLElement): Promise<void> {
  await user.type(field(container, 'fullName'), '  Carlos Fictício ')
  await user.type(field(container, 'document'), '98765432')
  await user.type(field(container, 'units.0.value'), ' Bloco B - 202 ')
  await selectOption(user, 0, 'Inquilino')
}

const SALVAR = { name: 'Salvar registro' }

// Formulários longos com `user.type` em inputs MUI passam de 5s com a suíte em paralelo.
describe('RegisterResidentForm', { timeout: 15_000 }, () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    router.push.mockReset()
    router.refresh.mockReset()
  })

  it('bloqueia o submit pela validação nativa dos obrigatórios e não chama o BFF', async () => {
    const { user, container } = renderWithProviders(<RegisterResidentForm />)

    await user.click(screen.getByRole('button', SALVAR))

    // Mesmo comportamento conhecido do formulário de visitantes: o `required`
    // nativo barra o submit antes do RHF exibir "Informe ...".
    for (const name of ['fullName', 'document', 'units.0.value']) {
      expect(field(container, name)).toBeRequired()
      expect(field(container, name)).toBeInvalid()
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('aplica as regras do RHF: tamanho mínimo, e-mail e unidade duplicada', async () => {
    const { user, container } = renderWithProviders(<RegisterResidentForm />)

    await user.type(field(container, 'fullName'), 'Ca')
    await user.type(field(container, 'document'), '123')
    await user.type(field(container, 'email'), 'carlos@semdominio')
    await user.type(field(container, 'units.0.value'), 'Bloco B - 202')
    await user.click(screen.getByRole('button', { name: 'Adicionar unidade' }))
    await user.type(field(container, 'units.1.value'), ' bloco b - 202 ')
    await selectOption(user, 0, 'Proprietário')
    await user.click(screen.getByRole('button', SALVAR))

    expect(await screen.findByText('Nome deve ter ao menos 3 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Documento deve ter ao menos 5 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Informe um e-mail valido')).toBeInTheDocument()
    expect(screen.getByText('Unidade já informada')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('exige o tipo do veículo quando placa/modelo/cor foram preenchidos', async () => {
    const { user, container } = renderWithProviders(<RegisterResidentForm />)

    await fillRequired(user, container)
    await user.type(field(container, 'vehicles.0.plate'), 'ABC1D23')
    await user.click(screen.getByRole('button', SALVAR))

    expect(await screen.findByText('Selecione o tipo do veiculo')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envia o payload aparado, avisa sucesso e volta para a listagem', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'morador-1' }, 201))
    const { user, container } = renderWithProviders(<RegisterResidentForm />)

    await fillRequired(user, container)
    await selectOption(user, 1, 'Carro')
    await user.type(field(container, 'vehicles.0.plate'), ' ABC1D23 ')
    await user.click(screen.getByRole('button', SALVAR))

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/moradores'))

    const call = getFetchCall(fetchMock)
    expect(call.url).toBe('/api/residents')
    expect(call.init.method).toBe('POST')
    expect(JSON.parse(String(call.init.body))).toEqual({
      fullName: 'Carlos Fictício',
      document: '98765432',
      units: ['Bloco B - 202'],
      relation: 'inquilino',
      vehicles: [{ type: 'carro', plate: 'ABC1D23' }],
    })
    expect(await screen.findByText('Morador registrado com sucesso.')).toBeInTheDocument()
  })

  it('mostra o erro do BFF no snackbar e permanece na página', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Documento já cadastrado.' }, 409))
    const { user, container } = renderWithProviders(<RegisterResidentForm />)

    await fillRequired(user, container)
    await user.click(screen.getByRole('button', SALVAR))

    expect(await screen.findByText('Documento já cadastrado.')).toBeInTheDocument()
    expect(router.push).not.toHaveBeenCalled()
  })

  it('Cancelar volta para a listagem', async () => {
    const { user } = renderWithProviders(<RegisterResidentForm />)

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(router.push).toHaveBeenCalledWith('/moradores')
  })
})
