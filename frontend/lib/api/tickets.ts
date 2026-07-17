import { backendClient as api } from './client'

export const ticketsApi = {
  create: (data: { type: string; reason: string; message?: string; orderId?: string }) =>
    api.post('/tickets', data),

  getMyTickets: () =>
    api.get('/tickets/my-tickets'),

  getAllForAdmin: (status?: string, page?: number, limit?: number) =>
    api.get('/tickets', { params: { ...(status ? { status } : {}), ...(page ? { page: String(page) } : {}), ...(limit ? { limit: String(limit) } : {}) } }),

  resolve: (id: string) =>
    api.patch(`/tickets/${id}/resolve`, {}),
}

