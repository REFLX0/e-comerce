import { backendClient as api } from './client'

export const addressesApi = {
  getAll: () =>
    api.get('/users/me/addresses'),

  create: (data: { name: string; street: string; city: string; state?: string; zipCode: string; country: string; isDefault?: boolean }) =>
    api.post('/users/me/addresses', data),

  delete: (id: string) =>
    api.delete(`/users/me/addresses/${id}`),
}

