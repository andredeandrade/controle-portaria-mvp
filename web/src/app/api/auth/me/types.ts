export enum UserRole {
  ADMIN = 'ADMIN',
  GESTOR = 'GESTOR',
  SINDICO = 'SINDICO',
  SEGURANCA = 'SEGURANCA',
}

export type AuthenticatedUser = {
  id: string
  condominiumId: string
  email: string
  name: string
  role: UserRole
}

export type AuthMeResponse = {
  user: AuthenticatedUser
}
