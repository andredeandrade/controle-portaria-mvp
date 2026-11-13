import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildVisitor } from '@test/factories/visitors'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { renderWithProviders } from '@test/render'

import { RegisterVisitorForm } from './RegisterVisitorForm'

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))

// Fronteira do framework: o App Router não existe fora do Next.
vi.mock('next/navigation', () => ({ useRouter: () => router }))

/**
 * Os rótulos (`TextFieldLabel`) não são `<label for>` ligados ao input, então
 * `getByLabelText` não funciona; buscamos pelo `name` registrado no RHF.
 */
function field(container: HTMLElement, name: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(`[name="${name}"]`)

  if (!element) {
    throw new Error(`campo ${name} não encontrado`)
  }

  return element
}

describe('RegisterVisitorForm', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    router.push.mockReset()
    router.refresh.mockReset()
  })

  it('bloqueia o submit pela validação nativa dos campos obrigatórios e não chama o BFF', async () => {
    const { user, container } = renderWithProviders(<RegisterVisitorForm />)

    await user.click(screen.getByRole('button', { name: 'Salvar Visitante' }))

    // Os inputs têm `required` nativo (além da regra do RHF): o navegador barra o
    // submit antes do `handleSubmit`, então as mensagens "Informe ..." do RHF não
    // chegam a aparecer. Ver relatório da issue #212.
    for (const name of ['fullName', 'document', 'unit', 'authorizedBy']) {
      expect(field(container, name)).toBeRequired()
      expect(field(container, name)).toBeInvalid()
    }
    expect(screen.queryByText('Informe o nome completo')).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('aplica as regras do RHF (tamanho mínimo e formato de e-mail)', async () => {
    const { user, container } = renderWithProviders(<RegisterVisitorForm />)

    await user.type(field(container, 'fullName'), 'Jo')
    await user.type(field(container, 'document'), '123')
    // Válido para o `type="email"` nativo, inválido para o pattern do RHF (sem ponto).
    await user.type(field(container, 'email'), 'joana@semdominio')
    await user.type(field(container, 'unit'), 'Bloco A - 101')
    await user.type(field(container, 'authorizedBy'), 'Morador Fictício')
    await user.click(screen.getByRole('button', { name: 'Salvar Visitante' }))

    expect(await screen.findByText('Nome deve ter ao menos 3 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Documento deve ter ao menos 5 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Informe um e-mail valido')).toBeInTheDocument()
    expect(field(container, 'fullName')).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envia o payload aparado (opcionais vazios omitidos), avisa sucesso e navega', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(buildVisitor(), 201))
    const { user, container } = renderWithProviders(<RegisterVisitorForm />)

    await user.type(field(container, 'fullName'), '  Joana Fictícia ')
    await user.type(field(container, 'document'), '12345678')
    await user.type(field(container, 'unit'), 'Bloco A - 101')
    await user.type(field(container, 'authorizedBy'), 'Morador Fictício')
    await user.type(field(container, 'vehiclePlate'), ' ABC1D23 ')
    await user.click(screen.getByRole('button', { name: 'Salvar Visitante' }))

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/visitantes'))

    const call = getFetchCall(fetchMock)
    expect(call.url).toBe('/api/visitors')
    expect(call.init.method).toBe('POST')
    expect(JSON.parse(String(call.init.body))).toEqual({
      fullName: 'Joana Fictícia',
      document: '12345678',
      unit: 'Bloco A - 101',
      authorizedBy: 'Morador Fictício',
      vehiclePlate: 'ABC1D23',
    })
    expect(await screen.findByText('Visitante registrado com sucesso.')).toBeInTheDocument()
  })

  it('mostra o erro do BFF no snackbar e permanece na página', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Documento já cadastrado.' }, 409))
    const { user, container } = renderWithProviders(<RegisterVisitorForm />)

    await user.type(field(container, 'fullName'), 'Joana Fictícia')
    await user.type(field(container, 'document'), '12345678')
    await user.type(field(container, 'unit'), 'Bloco A - 101')
    await user.type(field(container, 'authorizedBy'), 'Morador Fictício')
    await user.click(screen.getByRole('button', { name: 'Salvar Visitante' }))

    expect(await screen.findByText('Documento já cadastrado.')).toBeInTheDocument()
    expect(router.push).not.toHaveBeenCalled()
  })

  it('Cancelar volta para a listagem', async () => {
    const { user } = renderWithProviders(<RegisterVisitorForm />)

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(router.push).toHaveBeenCalledWith('/visitantes')
  })
})
