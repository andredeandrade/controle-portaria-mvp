import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  extractTenantSlugFromHost,
  getApiBaseUrls,
  getDefaultTenantSlug,
  isValidTenantSlug,
  normalizeTenantSlug,
} from './session'

describe('extractTenantSlugFromHost', () => {
  it.each([
    ['demo.localhost:3000', 'demo'],
    ['demo.localhost', 'demo'],
    ['Residencial-Alfa.localhost:3000', 'residencial-alfa'],
    ['demo.portaria.com.br', 'demo'],
    ['demo.portaria.app:443', 'demo'],
  ])('extrai o slug de "%s" como "%s"', (host, expected) => {
    expect(extractTenantSlugFromHost(host)).toBe(expected)
  })

  it.each([
    ['nulo', null],
    ['vazio', ''],
    ['localhost', 'localhost:3000'],
    ['IP', '127.0.0.1:3000'],
    ['domínio sem subdomínio', 'portaria.com'],
    ['www no localhost', 'www.localhost:3000'],
    ['www no domínio', 'www.portaria.com.br'],
  ])('retorna null para host %s', (_label, host) => {
    expect(extractTenantSlugFromHost(host)).toBeNull()
  })
})

describe('extractTenantSlugFromHost com APP_ROOT_DOMAIN', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it.each([
    ['portaria.com.br', 'demo.portaria.com.br', 'demo'],
    ['portaria.com.br', 'Alfa.Portaria.com.br:443', 'alfa'],
    ['.portaria.com.br.', 'demo.portaria.com.br', 'demo'],
    ['portaria.com.br', 'demo.localhost:3000', 'demo'],
  ])('com root "%s", host "%s" → "%s"', (root, host, expected) => {
    vi.stubEnv('APP_ROOT_DOMAIN', root)

    expect(extractTenantSlugFromHost(host)).toBe(expected)
  })

  it.each([
    ['portaria.com.br', 'portaria.com.br'],
    ['portaria.com.br', 'www.portaria.com.br'],
    ['portaria.com.br', 'outro.dominio.com'],
    ['app.vercel.app', 'app.vercel.app'],
    ['app.vercel.app', 'app.vercel.app:443'],
  ])('com root "%s", host "%s" → null', (root, host) => {
    vi.stubEnv('APP_ROOT_DOMAIN', root)

    expect(extractTenantSlugFromHost(host)).toBeNull()
  })

  it('sem APP_ROOT_DOMAIN mantém a heurística legada de 3+ labels', () => {
    vi.stubEnv('APP_ROOT_DOMAIN', '')

    expect(extractTenantSlugFromHost('app.vercel.app')).toBe('app')
  })
})

describe('getDefaultTenantSlug', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('normaliza o valor de DEFAULT_TENANT_SLUG', () => {
    vi.stubEnv('DEFAULT_TENANT_SLUG', ' Demo ')

    expect(getDefaultTenantSlug()).toBe('demo')
  })

  it.each([
    ['ausente', ''],
    ['só espaços', '   '],
    ['curto demais', 'ab'],
  ])('retorna null quando %s', (_label, value) => {
    vi.stubEnv('DEFAULT_TENANT_SLUG', value)

    expect(getDefaultTenantSlug()).toBeNull()
  })
})

describe('normalizeTenantSlug', () => {
  it('remove acentos, espaços e caracteres inválidos', () => {
    expect(normalizeTenantSlug('  Condomínio São João!! ')).toBe('condominio-sao-joao')
  })

  it('colapsa hífens repetidos e remove os das pontas', () => {
    expect(normalizeTenantSlug('--alfa---beta--')).toBe('alfa-beta')
  })
})

describe('isValidTenantSlug', () => {
  it('aceita slug com 3+ caracteres [a-z0-9-]', () => {
    expect(isValidTenantSlug('demo')).toBe(true)
    expect(isValidTenantSlug('bloco-1')).toBe(true)
  })

  it('rejeita slug curto ou com caracteres fora do padrão', () => {
    expect(isValidTenantSlug('ab')).toBe(false)
    expect(isValidTenantSlug('Demo')).toBe(false)
    expect(isValidTenantSlug('demo_1')).toBe(false)
  })
})

describe('getApiBaseUrls', () => {
  it('prioriza as variáveis de ambiente, remove barra final e deduplica os defaults', () => {
    vi.stubEnv('API_BASE_URL', ' http://localhost:3333/api/ ')
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://publica.test/api')

    expect(getApiBaseUrls()).toEqual([
      'http://localhost:3333/api',
      'http://publica.test/api',
      'http://api:3333/api',
    ])
  })

  it('usa apenas os defaults quando não há variável configurada', () => {
    vi.stubEnv('API_BASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '   ')

    expect(getApiBaseUrls()).toEqual(['http://localhost:3333/api', 'http://api:3333/api'])
  })
})
