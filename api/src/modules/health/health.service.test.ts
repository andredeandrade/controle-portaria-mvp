import { beforeEach, describe, expect, it, vi } from 'vitest'

const queryRaw = vi.hoisted(() => vi.fn())

// Sem banco: só o comportamento do prazo e do tratamento de erro.
vi.mock('../../lib/prisma.js', () => ({ prisma: { $queryRaw: queryRaw } }))

import { healthService } from './health.service.js'

describe('healthService.isDatabaseReachable', () => {
  beforeEach(() => {
    queryRaw.mockReset()
  })

  it('é true quando o SELECT 1 responde', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }])

    await expect(healthService.isDatabaseReachable()).resolves.toBe(true)
  })

  it('é false (sem lançar) quando a consulta falha', async () => {
    queryRaw.mockRejectedValue(new Error('connection refused'))

    await expect(healthService.isDatabaseReachable()).resolves.toBe(false)
  })

  it('é false quando o banco não responde dentro do prazo', async () => {
    queryRaw.mockReturnValue(new Promise(() => {}))

    const startedAt = Date.now()
    await expect(healthService.isDatabaseReachable(30)).resolves.toBe(false)

    expect(Date.now() - startedAt).toBeLessThan(1_000)
  })

  it('não deixa timer pendente quando o banco responde rápido', async () => {
    vi.useFakeTimers()
    queryRaw.mockResolvedValue([])

    await healthService.isDatabaseReachable(60_000)

    expect(vi.getTimerCount()).toBe(0)
    vi.useRealTimers()
  })
})
