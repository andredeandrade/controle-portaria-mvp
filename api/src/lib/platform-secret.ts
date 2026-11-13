import { timingSafeEqual } from 'node:crypto'
import { env } from '../config/env.js'

export function hasValidPlatformSecret(headerValue: unknown): boolean {
  if (typeof headerValue !== 'string' || headerValue.length === 0) {
    return false
  }

  const provided = Buffer.from(headerValue, 'utf8')
  const expected = Buffer.from(env.platformSetupSecret, 'utf8')

  if (provided.length !== expected.length) {
    return false
  }

  return timingSafeEqual(provided, expected)
}
