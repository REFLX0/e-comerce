import { backendClient as api } from './client'

export const ticketsApi = {
  create: (data: { type: string; reason: string; message?: string; orderId?: string }) =>
    api.post('/tickets', data, { headers: { Authorization: `Bearer ${token}` } }),

  getMyTickets: () =>
    api.get('/tickets/my-tickets', { headers: { Authorization: `Bearer ${token}` } }),

  getAllForAdmin: (status?: string) =>
    api.get('/tickets', { headers: { Authorization: `Bearer ${token}` }, params: { status } }),

  resolve: (id: string) =>
    api.patch(`/tickets/${id}/resolve`, {}, { headers: { Authorization: `Bearer ${token}` } }),
}

