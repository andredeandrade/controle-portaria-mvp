/**
 * Valida e exporta as variáveis de ambiente da aplicação.
 * Se uma variável obrigatória estiver ausente, o processo encerra na inicialização
 * em vez de falhar silenciosamente em tempo de execução.
 */

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${name}`)
  }
  return value
}

function positiveInt(name: string, fallback: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Variável de ambiente inválida (inteiro positivo esperado): ${name}`)
  }
  return value
}

/** `TRUST_PROXY`: número de proxies confiáveis (ex.: 1) ou `false`/vazio para desativar. */
function trustProxy(): number | false {
  const raw = process.env['TRUST_PROXY']
  if (!raw || raw === 'false') return false
  const hops = Number(raw)
  if (!Number.isInteger(hops) || hops < 0) {
    throw new Error('TRUST_PROXY deve ser um inteiro >= 0 ou "false".')
  }
  return hops
}

const MIN_SECRET_LENGTH = 32
const WEAK_SECRET_MARKER = 'change-me'

/** Em produção, segredos precisam ser longos e diferentes dos valores de exemplo. */
function assertProductionSecrets(secrets: Record<string, string>): void {
  for (const [name, value] of Object.entries(secrets)) {
    if (value.length < MIN_SECRET_LENGTH || value.includes(WEAK_SECRET_MARKER)) {
      throw new Error(
        `${name} fraco para produção: use um valor aleatório com ao menos ${MIN_SECRET_LENGTH} caracteres.`,
      )
    }
  }
}

export const env = {
  port: Number(process.env['PORT'] ?? 3333),
  databaseUrl: required('DATABASE_URL'),
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
  trustProxy: trustProxy(),
  bodyLimit: process.env['BODY_LIMIT'] ?? '100kb',
  rateLimitWindowMs: positiveInt('RATE_LIMIT_WINDOW_MS', 60_000),
  rateLimitMax: positiveInt('RATE_LIMIT_MAX', 600),
  authRateLimitWindowMs: positiveInt('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60_000),
  authRateLimitMax: positiveInt('AUTH_RATE_LIMIT_MAX', 20),
  jwtSecret: required('JWT_SECRET'),
  dataEncryptionKey: required('DATA_ENCRYPTION_KEY'),
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '1d',
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  platformSetupSecret: required('PLATFORM_SETUP_SECRET'),
} as const

if (env.nodeEnv === 'production') {
  if (env.corsOrigin === '*') {
    throw new Error('CORS_ORIGIN não pode ser "*" em produção.')
  }
  assertProductionSecrets({
    JWT_SECRET: env.jwtSecret,
    DATA_ENCRYPTION_KEY: env.dataEncryptionKey,
    PLATFORM_SETUP_SECRET: env.platformSetupSecret,
  })
}
