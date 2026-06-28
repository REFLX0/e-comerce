import { apiGet, apiPost, apiDelete } from './client'
import type { Product } from '@/lib/types'

export const wishlistApi = {
  get: (token: string) =>
    apiGet<Product[]>('/wishlist', undefined, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  add: (productId: string, token: string) =>
    apiPost<void>('/wishlist', { productId }, token),

  remove: (productId: string, token: string) =>
    apiDelete<void>(`/wishlist/${productId}`, token),
}
