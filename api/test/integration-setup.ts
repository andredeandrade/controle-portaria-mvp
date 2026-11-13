/**
 * Setup dos testes de integração: banco limpo antes de cada teste, conexão
 * do Prisma encerrada ao fim de cada arquivo e silêncio para os 4xx esperados
 * que o error handler de `src/app.ts` registra com `console.error`.
 */

import { afterAll, beforeAll, beforeEach, vi } from 'vitest'
import { HttpError } from '../src/lib/http-error.js'
import { prisma } from '../src/lib/prisma.js'
import { resetDatabase } from './helpers/db.js'

beforeAll(() => {
  const originalConsoleError = console.error.bind(console)

  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const [first] = args

    if (first instanceof HttpError && first.statusCode < 500) {
      return
    }

    originalConsoleError(...args)
  })
})

beforeEach(async () => {
  await resetDatabase()
})

afterAll(async () => {
  vi.restoreAllMocks()
  await prisma.$disconnect()
})
