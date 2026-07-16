import { apiGet, apiPost } from './client'
import type { Order, PaginatedResponse } from '@/lib/types'

export interface ShippingDto {
  fullName: string
  phone: string
  wilaya: string
  city: string
}

interface CreateOrderPayload {
  items: { variantId: string; quantity: number }[]
  shipping: ShippingDto
  promoCode?: string
  notes?: string
  shippingCost?: number
}

export const ordersApi = {
  create: (payload: CreateOrderPayload, ) => apiPost<Order>('/orders', payload),

  getAll: (page = 1, limit = 10) =>
    apiGet<PaginatedResponse<Order>>(
      '/orders',
      { page, limit }
    ),

  getById: (id: string, ) =>
    apiGet<Order>(`/orders/${id}`, undefined),
}

