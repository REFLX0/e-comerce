import { backendClient as api } from './client'

export const couponsApi = {
  getAll: () =>
    api.get('/coupons'),

  create: (data: any) =>
    api.post('/coupons', data),

  update: (id: string, data: any) =>
    api.patch(`/coupons/${id}`, data),

  toggleActive: (id: string) =>
    api.post(`/coupons/${id}/toggle`, {}),

  delete: (id: string) =>
    api.delete(`/coupons/${id}`),

  validate: (code: string, cartTotal: number) =>
    api.get('/coupons/validate', { params: { code, cartTotal } }),
}

