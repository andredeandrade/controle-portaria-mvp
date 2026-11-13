/**
 * Middlewares globais — em desenvolvimento.
 *
 * Futuramente conterá:
 * - authenticate.ts  → valida JWT e injeta usuário na requisição
 * - authorize.ts     → verifica permissões por role (admin, porteiro)
 * - validate.ts      → wrapper Zod para validar body/params/query
 */

export { authenticate } from './authenticate.js'
export { authorizeRoles } from './authorize.js'
export { requirePlatformSecret } from './platform-secret.js'
export { apiRateLimiter, authRateLimiter } from './rate-limit.js'
