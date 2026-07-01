import { apiGet } from './client'
import type { Brand } from '@/lib/types'

export const brandsApi = {
  getAll: () => apiGet<Brand[]>('/brands'),

  getFeatured: () => apiGet<Brand[]>('/brands/featured'),

  getBySlug: (slug: string) => apiGet<Brand>(`/brands/${slug}`),
}

