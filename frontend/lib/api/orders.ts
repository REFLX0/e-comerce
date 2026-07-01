import { apiGet, apiPost } from './client'
import type { Order, PaginatedResponse, Address } from '@/lib/types'

interface CreateOrderPayload {
  items: { variantId: string; quantity: number }[]
  shippingAddress: Omit<Address, 'id'>
  shippingMethod: string
  promoCode?: string
  notes?: string
}

export const ordersApi = {
  create: (payload: CreateOrderPayload, ) => apiPost<Order>('/orders', payload),

  getAll: (page = 1, limit = 10) =>
    apiGet<PaginatedResponse<Order>>(
      '/orders',
      { page, limit },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),

  getById: (id: string, ) =>
    apiGet<Order>(`/orders/${id}`, undefined, {
      headers: { Authorization: `Bearer ${token}` },
    }),
}

