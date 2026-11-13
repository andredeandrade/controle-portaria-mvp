/**
 * Modo de demonstração pública (login rápido por perfil).
 *
 * `NEXT_PUBLIC_*` é embutida no bundle em tempo de build, e só quando o acesso é
 * literal (`process.env.NEXT_PUBLIC_DEMO_MODE`) — não refatore para `process.env[nome]`.
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

// Espelha `api/src/lib/demo-users.ts` (web e api não compartilham código).
// Credenciais públicas e fictícias, criadas pelo seed do tenant `demo`.
export const DEMO_PASSWORD = 'Senha@123'

export const DEMO_ACCOUNTS = [
  { role: 'ADMIN', label: 'Admin', email: 'admin@demo.local' },
  { role: 'GESTOR', label: 'Gestor', email: 'gestor@demo.local' },
  { role: 'SINDICO', label: 'Síndico', email: 'sindico@demo.local' },
  { role: 'SEGURANCA', label: 'Segurança', email: 'seguranca@demo.local' },
] as const

export type DemoAccount = (typeof DEMO_ACCOUNTS)[number]
