/**
 * Módulo de autenticação — em desenvolvimento.
 *
 * Futuramente conterá:
 * - auth.routes.ts   → rotas POST /auth/login, POST /auth/refresh
 * - auth.controller.ts → recebe Request/Response
 * - auth.service.ts  → lógica: validar credenciais, gerar JWT
 * - auth.schema.ts   → schemas Zod para validação do body
 */

export { authRouter } from './auth.routes.js'
export { authService } from './auth.service.js'
