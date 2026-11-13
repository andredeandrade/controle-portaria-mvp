import { timingSafeEqual } from 'node:crypto'
import { env, isDemoMode } from '../config/env.js'

/**
 * Confere o segredo de setup da plataforma (comparação em tempo constante).
 * Em modo demo (`DEMO_MODE=true`) o segredo nunca vale, nem se estiver correto: qualquer
 * rota que dependa dele (hoje `POST /condominiums` e o bootstrap de `POST /auth/register`)
 * fica desabilitada sem precisar lembrar de checar a flag em cada uma.
 */
export function hasValidPlatformSecret(headerValue: unknown): boolean {
  if (isDemoMode()) {
    return false
  }

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
