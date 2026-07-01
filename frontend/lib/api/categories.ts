import { apiGet } from './client'
import type { Category } from '@/lib/types'

export const categoriesApi = {
  getAll: () => apiGet<Category[]>('/categories'),

  getTree: () => apiGet<Category[]>('/categories/tree'),

  getBySlug: (slug: string) => apiGet<Category>(`/categories/${slug}`),

  getFeatured: () => apiGet<Category[]>('/categories/featured'),
}

