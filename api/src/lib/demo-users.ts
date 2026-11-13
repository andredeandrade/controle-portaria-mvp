import type { UserRole } from './jwt.js'

/**
 * Usuários da demo pública: um por perfil, todos com a mesma senha.
 *
 * Fonte única usada pelo seed (`scripts/seed.ts`) e pelos testes, para que o que a
 * demo promete (cada perfil entra e vê só o que a matriz de `permissions.ts` permite)
 * seja o que é testado. Credenciais fictícias, só para o ambiente de demonstração.
 */
export const DEMO_PASSWORD = 'Senha@123'

export type DemoUser = {
  readonly role: UserRole
  readonly email: string
  readonly name: string
}

export const DEMO_USERS = [
  { role: 'ADMIN', email: 'admin@demo.local', name: 'Admin Demo' },
  { role: 'GESTOR', email: 'gestor@demo.local', name: 'Gestor Demo' },
  { role: 'SINDICO', email: 'sindico@demo.local', name: 'Síndico Demo' },
  { role: 'SEGURANCA', email: 'seguranca@demo.local', name: 'Segurança Demo' },
] as const satisfies readonly DemoUser[]
