import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { renderWithProviders } from '@test/render'

import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../demo'
import { LoginFormFields } from './LoginFormFields'

const router = vi.hoisted(() => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }))

// Fronteira do framework: o App Router não existe fora do Next.
vi.mock('next/navigation', () => ({ useRouter: () => router }))

const BANNER = 'Ambiente de demonstração — dados fictícios, resetados diariamente'

function field(container: HTMLElement, name: string): HTMLInputElement {
  const element = container.querySelector<HTMLInputElement>(`[name="${name}"]`)

  if (!element) {
    throw new Error(`campo ${name} não encontrado`)
  }

  return element
}

function loginBody(fetchMock: FetchMock) {
  const call = getFetchCall(fetchMock, 0)

  return { url: call.url, method: call.init.method, body: JSON.parse(String(call.init.body)) }
}

describe('LoginFormFields', { timeout: 15_000 }, () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    router.push.mockReset()
    router.refresh.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('com a flag desligada', () => {
    it('não renderiza banner nem botões de demonstração', () => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false')
      const { container } = renderWithProviders(<LoginFormFields />)

      expect(screen.queryByText(BANNER)).not.toBeInTheDocument()
      expect(screen.queryByText(/Entrar como/)).not.toBeInTheDocument()
      expect(screen.queryByText(/conta de demonstração/)).not.toBeInTheDocument()
      expect(field(container, 'email')).toBeInTheDocument()
      expect(field(container, 'password')).toBeInTheDocument()
      // Mostrar senha + Entrar: nada além disso.
      expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
        '',
        'Entrar',
      ])
    })

    it('mantém o login manual funcionando', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', '')
      fetchMock.mockResolvedValue(jsonResponse({ user: { id: '1' } }))
      const { user, container } = renderWithProviders(<LoginFormFields />)

      await user.type(field(container, 'email'), 'pessoa@empresa.com')
      await user.type(field(container, 'password'), 'senha-longa-1')
      await user.click(screen.getByRole('button', { name: 'Entrar' }))

      await waitFor(() => expect(router.push).toHaveBeenCalledWith('/dashboard'))
      expect(loginBody(fetchMock).body).toEqual({
        email: 'pessoa@empresa.com',
        password: 'senha-longa-1',
      })
    })
  })

  describe('com a flag ligada', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true')
    })

    it('mostra o banner e os 4 botões de perfil', () => {
      renderWithProviders(<LoginFormFields />)

      expect(screen.getByText(BANNER)).toBeInTheDocument()

      for (const label of ['Admin', 'Gestor', 'Síndico', 'Segurança']) {
        expect(screen.getByRole('button', { name: `Entrar como ${label}` })).toBeEnabled()
      }
    })

    it.each(DEMO_ACCOUNTS)(
      'Entrar como $label preenche os campos e envia o login',
      async (account) => {
        fetchMock.mockResolvedValue(jsonResponse({ user: { id: '1' } }))
        const { user, container } = renderWithProviders(<LoginFormFields />)

        await user.click(screen.getByRole('button', { name: `Entrar como ${account.label}` }))

        await waitFor(() => expect(router.push).toHaveBeenCalledWith('/dashboard'))
        expect(router.refresh).toHaveBeenCalled()
        expect(field(container, 'email')).toHaveValue(account.email)
        expect(field(container, 'password')).toHaveValue(DEMO_PASSWORD)

        const request = loginBody(fetchMock)
        expect(request.url).toBe('/api/auth/login')
        expect(request.method).toBe('POST')
        expect(request.body).toEqual({ email: account.email, password: DEMO_PASSWORD })
      },
    )

    it('desabilita botões enquanto o login está pendente', async () => {
      fetchMock.mockReturnValue(new Promise(() => {}))
      const { user } = renderWithProviders(<LoginFormFields />)

      await user.click(screen.getByRole('button', { name: 'Entrar como Gestor' }))

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Entrar como Admin' })).toBeDisabled(),
      )
      expect(screen.getByRole('button', { name: 'Entrar como Gestor' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Entrar como Síndico' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Entrar como Segurança' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()
    })

    it('mostra a mensagem de erro do 401 e não navega', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ message: 'Credenciais inválidas.' }, 401))
      const { user } = renderWithProviders(<LoginFormFields />)

      await user.click(screen.getByRole('button', { name: 'Entrar como Admin' }))

      expect(await screen.findByText('Credenciais inválidas.')).toBeInTheDocument()
      expect(router.push).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: 'Entrar como Admin' })).toBeEnabled()
    })

    it('mantém o login manual funcionando', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ user: { id: '1' } }))
      const { user, container } = renderWithProviders(<LoginFormFields />)

      await user.type(field(container, 'email'), 'pessoa@empresa.com')
      await user.type(field(container, 'password'), 'senha-longa-1')
      await user.click(screen.getByRole('button', { name: 'Entrar' }))

      await waitFor(() => expect(router.push).toHaveBeenCalledWith('/dashboard'))
      expect(loginBody(fetchMock).body).toEqual({
        email: 'pessoa@empresa.com',
        password: 'senha-longa-1',
      })
    })
  })
})
