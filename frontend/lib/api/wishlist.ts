import { backendClient as api } from './client'

export const wishlistApi = {
  getAll: () =>
    api.get('/wishlist'),

  toggle: (productId: string) =>
    api.post(`/wishlist/${productId}/toggle`, {}),
}

