import type { Authorization, AuthorizationsListResponse } from '@/app/api/authorizations/types'

export type ListAuthorizationsApiResponseBody =
  | ({ message?: string } & Partial<AuthorizationsListResponse>)
  | null

export type RegisterAuthorizationApiResponseBody =
  | ({ message?: string } & Partial<Authorization>)
  | null

export type GetAuthorizationApiResponseBody =
  | ({ message?: string } & Partial<Authorization>)
  | null

export type UpdateAuthorizationApiResponseBody =
  | ({ message?: string } & Partial<Authorization>)
  | null
