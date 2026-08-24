import { backendClient as api } from './client'

export interface CatalogBrand {
  id: string
  name: string
  slug: string
  _count?: { products: number }
}

export interface CatalogCategory {
  id: string
  nameFr: string
  slug: string
  parent?: { id: string; nameFr: string; slug: string } | null
  _count?: { products: number }
}

export interface TopBuyer {
  id: string
  name: string | null
  email: string
  phone: string | null
  totalSpent: number
  orderCount: number
  avgOrderValue: number
  lastOrderAt: string
  repeatBuyer: boolean
  score: number
}

export async function downloadOrderPdf(orderId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
  try {
    const res = await fetch(`${baseUrl}/admin/orders/${orderId}/pdf`, { credentials: 'include' })
    if (!res.ok) throw new Error('PDF download failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `livraison-${orderId.slice(-8).toUpperCase()}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('PDF download error:', e)
  }
}

export const adminApi = {
  getDashboard: () =>
    api.get('/admin/dashboard'),

  getProducts: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get('/admin/products', { params }),

  getCatalogBrands: () =>
    api.get<CatalogBrand[]>('/admin/catalog/brands'),

  getCatalogCategories: () =>
    api.get<CatalogCategory[]>('/admin/catalog/categories'),

  getProduct: (id: string) =>
    api.get(`/admin/products/${id}`),

  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ url: string }>('/uploads/image', formData)
  },

  createProduct: (body: any) =>
    api.post('/admin/products', body),

  updateProduct: (id: string, body: any) =>
    api.patch(`/admin/products/${id}`, body),

  deleteProduct: (id: string) =>
    api.delete(`/admin/products/${id}`),

  getOrders: (params?: { page?: number; status?: string }) =>
    api.get('/admin/orders', { params }),

  getOrder: (id: string) =>
    api.get(`/admin/orders/${id}`),

  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/admin/orders/${id}/status`, { status }),

  getUsers: (params?: { page?: number }) =>
    api.get('/admin/users', { params }),

  getTopBuyers: (limit = 10) =>
    api.get<TopBuyer[]>('/admin/buyers/top', { params: { limit } }),

  getUser: (id: string) =>
    api.get(`/admin/users/${id}`),

  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),

  blockUser: (id: string) =>
    api.patch(`/admin/users/${id}/block`, {}),

  // Reviews
  getReviews: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/reviews', { params }),

  updateReviewStatus: (id: string, isApproved: boolean) =>
    api.patch(`/admin/reviews/${id}/status`, { isApproved }),

  deleteReview: (id: string) =>
    api.delete(`/admin/reviews/${id}`),

  // Products - bulk & export
  bulkProducts: (ids: string[], action: string) =>
    api.post('/admin/products/bulk', { ids, action }),

  duplicateProduct: (id: string) =>
    api.post(`/admin/products/${id}/duplicate`, {}),

  publishProduct: (id: string, isPublished: boolean) =>
    api.patch(`/admin/products/${id}/publish`, { isPublished }),

  exportProducts: () =>
    api.get<{ csv: string }>('/admin/products/export'),

  importProducts: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ ok: boolean; created: number; updated: number; errors: number; message: string }>('/admin/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Orders - export
  exportOrders: (status?: string) =>
    api.get<{ csv: string }>('/admin/orders/export', { params: status ? { status } : undefined }),

  // Shipping zones
  getShippingZones: () =>
    api.get('/shipping/zones'),

  createShippingZone: (data: { name: string; price: number; eta: string }) =>
    api.post('/shipping/zones', data),

  updateShippingZone: (id: string, data: any) =>
    api.patch(`/shipping/zones/${id}`, data),

  deleteShippingZone: (id: string) =>
    api.delete(`/shipping/zones/${id}`),

  // Payments
  getPayments: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/payments', { params }),

  updatePaymentStatus: (id: string, status: string) =>
    api.patch(`/admin/payments/${id}/status`, { status }),

  // Contact messages
  getContactMessages: (params?: { page?: number; limit?: number; sort?: string; filter?: string }) =>
    api.get('/admin/contact-messages', { params }),

  markContactMessageRead: (id: string) =>
    api.patch(`/admin/contact-messages/${id}/read`, {}),

  deleteContactMessage: (id: string) =>
    api.delete(`/admin/contact-messages/${id}`),
}

// Settings (public read, admin write)
export const settingsApi = {
  getAll: () =>
    api.get<Record<string, unknown>>('/settings'),

  batchUpdate: (body: Record<string, unknown>) =>
    api.patch<Record<string, unknown>>('/settings', body),
}
