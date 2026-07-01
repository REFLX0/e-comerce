import { backendClient as api } from './client'

export const adminApi = {
  getDashboard: () =>
    api.get('/admin/dashboard'),

  getProducts: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/products', { params }),

  getOrders: (params?: { page?: number; status?: string }) =>
    api.get('/admin/orders', { params }),

  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/admin/orders/${id}/status`, { status }),

  getUsers: (params?: { page?: number }) =>
    api.get('/admin/users', { params }),

  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),
}

