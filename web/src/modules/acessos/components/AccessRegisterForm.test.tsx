import { screen, waitFor, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildVisitor, buildVisitorsPage } from '@test/factories/visitors'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { renderWithProviders } from '@test/render'

import { AccessRegisterForm } from './AccessRegisterForm'

const router = vi.hoisted(() => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }))

// Fronteira do framework: o App Router não existe fora do Next.
vi.mock('next/navigation', () => ({ useRouter: () => router }))

/** Os rótulos não são `<label for>`; buscamos pelo `name` registrado no RHF. */
function field(container: HTMLElement, name: string): HTMLInputElement {
  const element = container.querySelector<HTMLInputElement>(`[name="${name}"]`)

  if (!element) {
    throw new Error(`campo ${name} não encontrado`)
  }

  return element
}

/** Locomoção é o select MUI com o input nativo `name="locomotion"`. */
async function selectLocomotion(user: UserEvent, container: HTMLElement, label: string) {
  const select = field(container, 'locomotion').parentElement?.querySelector<HTMLElement>(
    '[role="combobox"]',
  )

  if (!select) {
    throw new Error('select de locomoção não encontrado')
  }

  await user.click(select)
  await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: label }))
}

const REGISTRAR = { name: 'Registrar Acesso' }

// Formulários longos com `user.type` em inputs MUI passam de 5s com a suíte em paralelo.
describe('AccessRegisterForm', { timeout: 15_000 }, () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    router.push.mockReset()
    router.back.mockReset()
    // Página aberta direto pela URL: sem histórico, volta para o fallback.
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(1)
  })

  it('bloqueia o submit pela validação nativa (nome e locomoção) sem chamar o BFF', async () => {
    const { user, container } = renderWithProviders(<AccessRegisterForm />)

    await user.click(screen.getByRole('button', REGISTRAR))

    expect(field(container, 'people.0.name')).toBeInvalid()
    expect(field(container, 'locomotion')).toBeRequired()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('exige a categoria da pessoa (regra do RHF, sem `required` nativo)', async () => {
    const { user, container } = renderWithProviders(<AccessRegisterForm />)

    await user.type(field(container, 'people.0.name'), 'Joana Fictícia')
    await selectLocomotion(user, container, 'A pe')
    await user.click(screen.getByRole('button', REGISTRAR))

    expect(await screen.findByText('Selecione uma categoria')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envia as pessoas com o mesmo veículo e omite opcionais vazios', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'acesso-1' }, 201))
    const { user, container } = renderWithProviders(<AccessRegisterForm />)

    await user.click(screen.getByRole('button', { name: 'Visitante' }))
    await user.type(field(container, 'people.0.name'), '  Joana Fictícia ')
    await user.type(field(container, 'people.0.unit'), 'A-101')
    await selectLocomotion(user, container, 'Carro')
    await user.type(field(container, 'plate'), ' ABC1D23 ')

    await user.click(screen.getByRole('button', { name: 'Adicionar pessoa (mesmo veículo)' }))
    const pessoa2 = screen.getByText('Pessoa 2').closest<HTMLElement>('.MuiCard-root')
    if (!pessoa2) throw new Error('card da Pessoa 2 não encontrado')
    await user.click(within(pessoa2).getByRole('button', { name: 'Morador' }))
    await user.type(field(container, 'people.1.name'), 'Carlos Fictício')

    await user.click(screen.getByRole('button', REGISTRAR))

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/acessos'))

    const call = getFetchCall(fetchMock)
    expect(call.url).toBe('/api/access-records')
    expect(call.init.method).toBe('POST')
    expect(JSON.parse(String(call.init.body))).toEqual({
      people: [
        { category: 'visitante', name: 'Joana Fictícia', unit: 'A-101' },
        { category: 'morador', name: 'Carlos Fictício' },
      ],
      locomotion: 'carro',
      plate: 'ABC1D23',
    })
    expect(await screen.findByText('Acesso registrado com sucesso.')).toBeInTheDocument()
  })

  it('mostra o campo Empresa só para prestador/autorizado', async () => {
    const { user, container } = renderWithProviders(<AccessRegisterForm />)

    expect(container.querySelector('[name="company"]')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Prestador de serviço' }))

    expect(field(container, 'company')).toBeInTheDocument()
  })

  it('autopreenche pessoa e veículo a partir da busca de cadastro', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        buildVisitorsPage([
          buildVisitor({ fullName: 'Joana Fictícia', vehiclePlate: 'XYZ9A87', unit: 'C-303' }),
        ]),
      ),
    )
    const { user, container } = renderWithProviders(<AccessRegisterForm />)

    await user.click(screen.getByRole('button', { name: 'Visitante' }))
    await user.type(screen.getByPlaceholderText('Nome, CPF ou unidade...'), 'Joa')
    await user.click(
      await screen.findByRole('option', { name: /Joana Fictícia/ }, { timeout: 2000 }),
    )

    expect(getFetchCall(fetchMock).url).toBe('/api/visitors?page=1&pageSize=10&search=Joa')
    expect(field(container, 'people.0.name')).toHaveValue('Joana Fictícia')
    expect(field(container, 'people.0.unit')).toHaveValue('C-303')
    expect(field(container, 'plate')).toHaveValue('XYZ9A87')
    expect(field(container, 'locomotion')).toHaveValue('carro')
  })

  it('mostra o erro do BFF no snackbar e permanece na página', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Pessoa já está dentro.' }, 409))
    const { user, container } = renderWithProviders(<AccessRegisterForm />)

    await user.click(screen.getByRole('button', { name: 'Morador' }))
    await user.type(field(container, 'people.0.name'), 'Carlos Fictício')
    await selectLocomotion(user, container, 'A pe')
    await user.click(screen.getByRole('button', REGISTRAR))

    expect(await screen.findByText('Pessoa já está dentro.')).toBeInTheDocument()
    expect(router.push).not.toHaveBeenCalled()
  })
})
