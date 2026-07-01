import { backendClient as api } from './client'

export const wishlistApi = {
  getAll: () =>
    api.get('/wishlist', { headers: { Authorization: `Bearer ${token}` } }),

  toggle: (productId: string) =>
    api.post(`/wishlist/${productId}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } }),
}

