import { backendClient as api } from './client'

export const ticketsApi = {
  create: (data: { type: string; reason: string; message?: string; orderId?: string }) =>
    api.post('/tickets', data),

  getMyTickets: () =>
    api.get('/tickets/my-tickets'),

  getAllForAdmin: (status?: string) =>
    api.get('/tickets', { params: { status } }),

  resolve: (id: string) =>
    api.patch(`/tickets/${id}/resolve`, {}),
}

