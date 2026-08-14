import { apiGet, apiPost } from './client'
import type { Review, PaginatedResponse } from '@/lib/types'

interface CreateReviewPayload {
  rating: number
  comment: string
}

export const reviewsApi = {
  getByProduct: (productId: string, page = 1, limit = 10) =>
    apiGet<PaginatedResponse<Review>>(`/products/${productId}/reviews`, {
      page,
      limit,
    }),

  create: (productId: string, payload: CreateReviewPayload) =>
    apiPost<Review>(`/products/${productId}/reviews`, payload),
}
