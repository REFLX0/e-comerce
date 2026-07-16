import { backendClient as api } from './client'

export const adminApi = {
  getDashboard: () =>
    api.get('/admin/dashboard'),

  getProducts: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/products', { params }),

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

  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/admin/orders/${id}/status`, { status }),

  getUsers: (params?: { page?: number }) =>
    api.get('/admin/users', { params }),

  getUser: (id: string) =>
    api.get(`/admin/users/${id}`),

  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),

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

  // Orders - export
  exportOrders: (status?: string) =>
    api.get<{ csv: string }>('/admin/orders/export', { params: { status } }),

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
}

// Settings (public read, admin write)
export const settingsApi = {
  getAll: () =>
    api.get<Record<string, unknown>>('/settings'),

  batchUpdate: (body: Record<string, unknown>) =>
    api.patch<Record<string, unknown>>('/settings', body),
}


