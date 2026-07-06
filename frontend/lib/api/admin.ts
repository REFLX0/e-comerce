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
}

