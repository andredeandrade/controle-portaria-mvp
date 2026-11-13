/**
 * Proteções do seed (`scripts/seed.ts`), isoladas aqui para poderem ser testadas.
 *
 * O seed apaga e recria os dados do condomínio `demo`, então só roda:
 * - contra um banco local (`localhost`, `127.0.0.1` ou `postgres`, o serviço do Docker); ou
 * - contra um banco remoto, somente com `SEED_ALLOW_REMOTE=demo` (valor exato).
 *
 * `NODE_ENV=production` bloqueia sempre; a flag não o contorna.
 */

const LOCAL_HOSTS: ReadonlySet<string> = new Set(['localhost', '127.0.0.1', 'postgres'])

/** Único valor aceito em `SEED_ALLOW_REMOTE`. */
export const SEED_ALLOW_REMOTE_VALUE = 'demo'

export type SeedGuardInput = {
  databaseUrl: string
  nodeEnv: string | undefined
  allowRemote: string | undefined
}

export type SeedTarget = {
  host: string
  /** Nome do banco, sem usuário nem senha. */
  database: string
  remote: boolean
}

/**
 * Valida se o seed pode rodar e devolve o alvo (host e banco) para ser logado.
 * Nunca inclui usuário ou senha do `DATABASE_URL` no retorno nem nas mensagens de erro.
 *
 * @throws Error se `NODE_ENV=production`, se a URL for inválida ou se o banco for
 * remoto sem `SEED_ALLOW_REMOTE=demo`.
 */
export function assertSeedAllowed({
  databaseUrl,
  nodeEnv,
  allowRemote,
}: SeedGuardInput): SeedTarget {
  if (nodeEnv === 'production') {
    throw new Error('Seed bloqueado: NODE_ENV=production.')
  }

  let url: URL
  try {
    url = new URL(databaseUrl)
  } catch {
    throw new Error('Seed bloqueado: DATABASE_URL inválida.')
  }

  const host = url.hostname
  const database = decodeURIComponent(url.pathname.replace(/^\//, ''))
  const remote = !LOCAL_HOSTS.has(host)

  if (remote && allowRemote !== SEED_ALLOW_REMOTE_VALUE) {
    throw new Error(
      `Seed bloqueado: DATABASE_URL aponta para "${host}", que não é um banco local. ` +
        `Para popular o banco remoto da demo, defina SEED_ALLOW_REMOTE=${SEED_ALLOW_REMOTE_VALUE}.`,
    )
  }

  return { host, database, remote }
}
