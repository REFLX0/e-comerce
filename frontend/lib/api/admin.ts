import { backendClient as api } from './client'

export const adminApi = {
  getDashboard: () =>
    api.get('/admin/dashboard'),

  getProducts: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/products', { params }),

  getProduct: (id: string) =>
    api.get(`/admin/products/${id}`),

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


