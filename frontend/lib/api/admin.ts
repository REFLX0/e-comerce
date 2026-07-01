import { backendClient as api } from './client'

export const adminApi = {
  getDashboard: () =>
    api.get('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }),

  getProducts: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/products', { headers: { Authorization: `Bearer ${token}` }, params }),

  getOrders: (params?: { page?: number; status?: string }) =>
    api.get('/admin/orders', { headers: { Authorization: `Bearer ${token}` }, params }),

  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/admin/orders/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } }),

  getUsers: (params?: { page?: number }) =>
    api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` }, params }),

  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } }),
}

