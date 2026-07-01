import { backendClient as api } from './client'

export const couponsApi = {
  getAll: () =>
    api.get('/coupons', { headers: { Authorization: `Bearer ${token}` } }),

  create: (data: any) =>
    api.post('/coupons', data, { headers: { Authorization: `Bearer ${token}` } }),

  update: (id: string, data: any) =>
    api.patch(`/coupons/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),

  toggleActive: (id: string) =>
    api.post(`/coupons/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } }),

  delete: (id: string) =>
    api.delete(`/coupons/${id}`, { headers: { Authorization: `Bearer ${token}` } }),

  validate: (code: string, cartTotal: number) =>
    api.get('/coupons/validate', { params: { code, cartTotal } }),
}

