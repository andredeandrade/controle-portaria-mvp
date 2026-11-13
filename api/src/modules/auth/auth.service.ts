import { prisma } from '../../lib/prisma.js'
import { HttpError } from '../../lib/http-error.js'
import { comparePassword, hashPassword } from '../../lib/password.js'
import { signAccessToken, type UserRole } from '../../lib/jwt.js'
import type { LoginInput, RegisterInput } from './auth.types.js'

const ALLOWED_ROLES: readonly UserRole[] = ['ADMIN', 'GESTOR', 'SINDICO', 'SEGURANCA']

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password: string): boolean {
  return password.length >= 8
}

function validateRole(role?: UserRole): UserRole | undefined {
  if (!role) {
    return undefined
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new HttpError(400, 'Role inválida.')
  }

  return role
}

export const authService = {
  async register(input: RegisterInput) {
    const condominiumId = input.condominiumId.trim()
    const name = input.name.trim()
    const email = normalizeEmail(input.email)
    const role = validateRole(input.role)

    if (!condominiumId) {
      throw new HttpError(400, 'Condomínio é obrigatório.')
    }

    if (name.length < 3) {
      throw new HttpError(400, 'Nome deve ter ao menos 3 caracteres.')
    }

    if (!validateEmail(email)) {
      throw new HttpError(400, 'E-mail inválido.')
    }

    if (!validatePassword(input.password)) {
      throw new HttpError(400, 'Senha deve ter no mínimo 8 caracteres.')
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        condominiumId_email: {
          condominiumId,
          email,
        },
      },
      select: { id: true },
    })

    if (existingUser) {
      throw new HttpError(409, 'E-mail já cadastrado.')
    }

    const passwordHash = await hashPassword(input.password)

    const user = await prisma.user.create({
      data: {
        condominiumId,
        name,
        email,
        passwordHash,
        role: role ?? 'SEGURANCA',
      },
    })

    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      condominiumId: user.condominiumId,
    })

    return {
      token,
      user: {
        id: user.id,
        condominiumId: user.condominiumId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  },

  async login(input: LoginInput) {
    const condominiumId = input.condominiumId.trim()
    const email = normalizeEmail(input.email)

    if (!condominiumId || !validateEmail(email) || !input.password) {
      throw new HttpError(400, 'Credenciais inválidas.')
    }

    const user = await prisma.user.findUnique({
      where: {
        condominiumId_email: {
          condominiumId,
          email,
        },
      },
    })

    if (!user) {
      throw new HttpError(401, 'E-mail ou senha inválidos.')
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash)

    if (!passwordMatches) {
      throw new HttpError(401, 'E-mail ou senha inválidos.')
    }

    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      condominiumId: user.condominiumId,
    })

    return {
      token,
      user: {
        id: user.id,
        condominiumId: user.condominiumId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  },
}
