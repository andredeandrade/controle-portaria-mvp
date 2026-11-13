export interface CreateCondominiumInput {
  name: string
  slug?: string
}

export interface UpdateCondominiumInput {
  name?: string
  slug?: string
}

export interface CondominiumResponse {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}
