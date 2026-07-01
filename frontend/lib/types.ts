export interface User {
  id: string
  name: string
  email: string
  role?: string
  [key: string]: any
}

export type ProductFilters = Record<string, any>
