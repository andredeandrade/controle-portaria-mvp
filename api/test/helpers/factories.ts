import { signAccessToken, type UserRole } from '../../src/lib/jwt.js'
import { prisma } from '../../src/lib/prisma.js'

export interface TestUser {
  id: string
  email: string
  role: UserRole
  condominiumId: string
  token: string
}

export interface TestTenant {
  condominiumId: string
  slug: string
  admin: TestUser
  seguranca: TestUser
}

/** Hash fictício: `authenticate` não confere senha, só o token e o usuário no banco. */
const FAKE_PASSWORD_HASH = 'hash-ficticio-apenas-para-testes'

export function authHeader(user: Pick<TestUser, 'token'>): string {
  return `Bearer ${user.token}`
}

/** Cria um usuário no condomínio informado e devolve um JWT válido para ele. */
export async function createTestUser(
  condominiumId: string,
  role: UserRole,
  emailPrefix: string = role.toLowerCase(),
): Promise<TestUser> {
  const condominium = await prisma.condominium.findUniqueOrThrow({
    where: { id: condominiumId },
    select: { slug: true },
  })

  const user = await prisma.user.create({
    data: {
      condominiumId,
      name: `Usuário ${role} ${condominium.slug}`,
      email: `${emailPrefix}@${condominium.slug}.test`,
      passwordHash: FAKE_PASSWORD_HASH,
      role,
    },
  })

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    condominiumId: user.condominiumId,
    token: signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      condominiumId: user.condominiumId,
    }),
  }
}

/** Cria um condomínio com um ADMIN e um SEGURANCA (perfil de portaria). */
export async function createTestTenant(slug: string): Promise<TestTenant> {
  const condominium = await prisma.condominium.create({
    data: { name: `Condomínio ${slug}`, slug },
  })

  const admin = await createTestUser(condominium.id, 'ADMIN')
  const seguranca = await createTestUser(condominium.id, 'SEGURANCA')

  return { condominiumId: condominium.id, slug, admin, seguranca }
}
