import { backendClient as api } from './client'

interface CouponValidateResult {
  id: string
  code: string
  type: 'PERCENT' | 'FIXED' | 'SHIPPING'
  value: number
  discount: number
  minAmount: number | null
  maxUses: number | null
  currentUses: number
  expiryDate: string | null
  isActive: boolean
}

export const couponsApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/coupons', { params }),

  create: (data: any) =>
    api.post('/coupons', data),

  update: (id: string, data: any) =>
    api.patch(`/coupons/${id}`, data),

  toggleActive: (id: string) =>
    api.post(`/coupons/${id}/toggle`, {}),

  delete: (id: string) =>
    api.delete(`/coupons/${id}`),

  validate: (code: string, cartTotal: number) =>
    api.get<CouponValidateResult>('/coupons/validate', { params: { code, cartTotal } }),
}

