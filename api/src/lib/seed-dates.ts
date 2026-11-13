/**
 * Helpers de datas e horários do seed (`scripts/seed.ts`), isolados aqui para poderem ser testados.
 *
 * Todos recebem `now` e `random` por parâmetro (sem ler `Date.now()` nem `Math.random()`),
 * e usam o fuso do processo (`getHours`/`setHours`), como o restante do seed.
 * Nenhum helper devolve um instante posterior a `now`.
 */

/** Gerador pseudoaleatório em [0, 1). */
export type Random = () => number

/** Peso relativo de cada hora do dia (índice = hora, 0-23) para registros de acesso em geral. */
export const GENERAL_HOUR_WEIGHTS: readonly number[] = [
  0.2, 0.1, 0.1, 0.1, 0.2, 1, 3, 8, 9, 6, 3, 3, 6, 7, 4, 3, 4, 8, 10, 8, 5, 2, 1, 0.5,
]

/** Pesos para prestadores de serviço: somente horário comercial (8h-17h59). */
export const BUSINESS_HOUR_WEIGHTS: readonly number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 4, 1, 3, 5, 5, 4, 2, 0, 0, 0, 0, 0, 0,
]

export function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

/** Limita `date` a, no máximo, `now`. */
export function clampToNow(date: Date, now: Date): Date {
  return date.getTime() > now.getTime() ? new Date(now) : date
}

/** Instante uniforme entre `from` e `to` (inclusive nas pontas, a menos de arredondamento). */
export function randomBetween(from: Date, to: Date, random: Random): Date {
  const span = Math.max(0, to.getTime() - from.getTime())
  return new Date(from.getTime() + Math.floor(random() * (span + 1)))
}

/** Instante aleatório de HOJE, em [00:00 local, now]. Nunca no futuro. */
export function randomTimestampToday(now: Date, random: Random): Date {
  return randomBetween(startOfDay(now), now, random)
}

/**
 * Sorteia uma hora (0-23) proporcional a `weights`, considerando só as horas até `maxHour`.
 * Devolve `null` se nenhuma hora permitida tem peso.
 */
export function pickWeightedHour(
  weights: readonly number[],
  random: Random,
  maxHour = 23,
): number | null {
  const limit = Math.min(maxHour, weights.length - 1)
  let total = 0
  for (let hour = 0; hour <= limit; hour++) total += weights[hour] ?? 0
  if (total <= 0) return null

  let target = random() * total
  let lastWithWeight = -1
  for (let hour = 0; hour <= limit; hour++) {
    const weight = weights[hour] ?? 0
    if (weight <= 0) continue
    lastWithWeight = hour
    if (target < weight) return hour
    target -= weight
  }
  return lastWithWeight
}

/**
 * Horário em `day` com a hora sorteada por `weights`. Se `day` é hoje, só considera horas até
 * `now` e nunca passa de `now`; se nenhuma hora permitida tem peso, cai num instante uniforme
 * entre 00:00 e `now`. Se `day` é posterior a hoje, devolve `now`.
 */
export function randomTimeOnDay(
  day: Date,
  now: Date,
  random: Random,
  weights: readonly number[] = GENERAL_HOUR_WEIGHTS,
): Date {
  const start = startOfDay(day)
  if (start.getTime() > now.getTime()) return new Date(now)

  const isToday = start.getTime() === startOfDay(now).getTime()
  const hour = pickWeightedHour(weights, random, isToday ? now.getHours() : 23)
  if (hour === null) {
    return randomBetween(start, isToday ? now : addMinutes(addDays(start, 1), -1), random)
  }

  const maxMinute = isToday && hour === now.getHours() ? now.getMinutes() : 59
  const date = new Date(start)
  date.setHours(hour, Math.floor(random() * (maxMinute + 1)), Math.floor(random() * 60), 0)
  return clampToNow(date, now)
}

/** Fração (0-1) do movimento diário esperado que já ocorreu entre 00:00 e `now`. */
export function elapsedDayFraction(
  now: Date,
  weights: readonly number[] = GENERAL_HOUR_WEIGHTS,
): number {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  if (total <= 0) return 0
  let elapsed = 0
  for (let hour = 0; hour < now.getHours(); hour++) elapsed += weights[hour] ?? 0
  elapsed += (weights[now.getHours()] ?? 0) * ((now.getMinutes() + now.getSeconds() / 60) / 60)
  return Math.min(1, elapsed / total)
}

/** Data aleatória nos últimos `daysBack` dias (0 = hoje), com hora ponderada, nunca após `now`. */
export function randomPastDate(
  now: Date,
  daysBack: number,
  random: Random,
  weights: readonly number[] = GENERAL_HOUR_WEIGHTS,
): Date {
  const offset = Math.floor(random() * (daysBack + 1))
  return randomTimeOnDay(addDays(now, -offset), now, random, weights)
}
