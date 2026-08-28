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
  vehicleVin?: string
  shippingCost?: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export const ordersApi = {
  create: (payload: CreateOrderPayload, ) => apiPost<Order>('/orders', payload),

  getAll: (page = 1, limit = 10) =>
    apiGet<PaginatedResponse<Order>>(
      '/orders',
      { page, limit }
    ),

  getById: (id: string, ) =>
    apiGet<Order>(`/orders/${id}`, undefined),

  cancel: (id: string) => apiPost<Order>(`/orders/${id}/cancel`, null),

  /** Customer invoice — returns a Blob ready to download. */
  async getInvoicePdf(id: string): Promise<Blob> {
    const res = await fetch(`${API_BASE}/orders/${id}/pdf`, { credentials: 'include' })
    if (!res.ok) throw new Error('PDF download failed')
    const buffer = await res.arrayBuffer()
    return new Blob([buffer], { type: 'application/pdf' })
  },
}
