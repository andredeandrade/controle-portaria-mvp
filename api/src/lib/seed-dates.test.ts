import { describe, expect, it } from 'vitest'

import {
  BUSINESS_HOUR_WEIGHTS,
  GENERAL_HOUR_WEIGHTS,
  addDays,
  clampToNow,
  elapsedDayFraction,
  pickWeightedHour,
  randomPastDate,
  randomTimeOnDay,
  randomTimestampToday,
  startOfDay,
  type Random,
} from './seed-dates.js'

/** PRNG determinístico (mulberry32) para os testes. */
function createRandom(seed: number): Random {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const at = (hour: number, minute: number, second = 0): Date =>
  new Date(2026, 10, 13, hour, minute, second, 0)

describe('clampToNow', () => {
  it('limita datas futuras a now e preserva as passadas', () => {
    const now = at(10, 0)
    expect(clampToNow(at(11, 0), now).getTime()).toBe(now.getTime())
    expect(clampToNow(at(9, 0), now).getTime()).toBe(at(9, 0).getTime())
  })
})

describe('randomTimestampToday', () => {
  it.each([
    ['00:05', at(0, 5)],
    ['03:00', at(3, 0)],
    ['12:30', at(12, 30)],
    ['23:59', at(23, 59, 59)],
  ])('fica em [00:00, now] com now = %s', (_label, now) => {
    const random = createRandom(1)
    const start = startOfDay(now).getTime()
    for (let i = 0; i < 500; i++) {
      const ts = randomTimestampToday(now, random).getTime()
      expect(ts).toBeGreaterThanOrEqual(start)
      expect(ts).toBeLessThanOrEqual(now.getTime())
    }
  })

  it('funciona à meia-noite exata', () => {
    const now = at(0, 0)
    expect(randomTimestampToday(now, createRandom(2)).getTime()).toBe(now.getTime())
  })
})

describe('randomTimeOnDay', () => {
  it.each([at(0, 5), at(3, 0), at(23, 59, 59)])('nunca passa de now = %s (hoje)', (now) => {
    const random = createRandom(3)
    const start = startOfDay(now).getTime()
    for (let i = 0; i < 1000; i++) {
      const ts = randomTimeOnDay(now, now, random).getTime()
      expect(ts).toBeGreaterThanOrEqual(start)
      expect(ts).toBeLessThanOrEqual(now.getTime())
    }
  })

  it('cai em instante uniforme de hoje quando os pesos não permitem nenhuma hora até now', () => {
    const now = at(3, 0)
    const random = createRandom(4)
    for (let i = 0; i < 200; i++) {
      const ts = randomTimeOnDay(now, now, random, BUSINESS_HOUR_WEIGHTS)
      expect(ts.getTime()).toBeGreaterThanOrEqual(startOfDay(now).getTime())
      expect(ts.getTime()).toBeLessThanOrEqual(now.getTime())
    }
  })

  it('usa horário comercial para pesos comerciais em dias passados', () => {
    const now = at(15, 0)
    const random = createRandom(5)
    for (let i = 0; i < 500; i++) {
      const hour = randomTimeOnDay(addDays(now, -3), now, random, BUSINESS_HOUR_WEIGHTS).getHours()
      expect(hour).toBeGreaterThanOrEqual(8)
      expect(hour).toBeLessThanOrEqual(17)
    }
  })

  it('mantém o dia pedido e devolve now para dias futuros', () => {
    const now = at(15, 0)
    const past = addDays(now, -5)
    expect(randomTimeOnDay(past, now, createRandom(6)).getDate()).toBe(past.getDate())
    expect(randomTimeOnDay(addDays(now, 2), now, createRandom(6)).getTime()).toBe(now.getTime())
  })
})

describe('pickWeightedHour', () => {
  it('concentra nos picos e quase não sorteia madrugada', () => {
    const random = createRandom(7)
    const counts = new Array<number>(24).fill(0)
    const samples = 20_000
    for (let i = 0; i < samples; i++) {
      const hour = pickWeightedHour(GENERAL_HOUR_WEIGHTS, random)
      expect(hour).not.toBeNull()
      counts[hour as number] = (counts[hour as number] ?? 0) + 1
    }

    const sum = (from: number, to: number): number =>
      counts.slice(from, to + 1).reduce((a, b) => a + b, 0)
    const peaks = sum(7, 9) + sum(12, 14) + sum(17, 20)
    const night = sum(0, 4)

    expect(peaks / samples).toBeGreaterThan(0.6)
    expect(night / samples).toBeLessThan(0.02)
    expect(counts[18]).toBeGreaterThan(counts[3] ?? 0)
    expect(counts[8]).toBeGreaterThan(counts[15] ?? 0)
  })

  it('respeita maxHour e devolve null sem horas com peso', () => {
    const random = createRandom(8)
    for (let i = 0; i < 300; i++) {
      expect(pickWeightedHour(GENERAL_HOUR_WEIGHTS, random, 6) as number).toBeLessThanOrEqual(6)
    }
    expect(pickWeightedHour(BUSINESS_HOUR_WEIGHTS, random, 5)).toBeNull()
  })
})

describe('elapsedDayFraction', () => {
  it('vai de 0 a 1 ao longo do dia', () => {
    expect(elapsedDayFraction(at(0, 0))).toBe(0)
    expect(elapsedDayFraction(at(12, 0))).toBeGreaterThan(0.2)
    expect(elapsedDayFraction(at(12, 0))).toBeLessThan(elapsedDayFraction(at(20, 0)))
    expect(elapsedDayFraction(at(23, 59, 59))).toBeGreaterThan(0.99)
  })
})

describe('randomPastDate', () => {
  it('nunca gera datas futuras nem além de daysBack', () => {
    const now = at(3, 0)
    const random = createRandom(9)
    const limit = startOfDay(addDays(now, -30)).getTime()
    for (let i = 0; i < 1000; i++) {
      const ts = randomPastDate(now, 30, random).getTime()
      expect(ts).toBeLessThanOrEqual(now.getTime())
      expect(ts).toBeGreaterThanOrEqual(limit)
    }
  })
})
