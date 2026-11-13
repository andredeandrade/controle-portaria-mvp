import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  // URL fixa e previsível para a API Express; os defaults de `getApiBaseUrls()`
  // (localhost:3333 e api:3333) entram depois dela como fallback.
  vi.stubEnv('API_BASE_URL', 'http://api.test/api')
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '')
})
