import { apiGet, apiPost, apiPatch, apiDelete } from './client'
import type { Category } from '@/lib/types'

export const categoriesApi = {
  getAll: () => apiGet<Category[]>('/categories'),

  getTree: () => apiGet<Category[]>('/categories/tree'),

  getBySlug: (slug: string) => apiGet<Category>(`/categories/${slug}`),

  getFeatured: () => apiGet<Category[]>('/categories/featured'),

  create: (data: { nameFr: string; slug: string; imageUrl?: string; parentId?: string }) =>
    apiPost<Category>('/categories', data),

  update: (id: string, data: { nameFr?: string; slug?: string; imageUrl?: string; parentId?: string }) =>
    apiPatch<Category>(`/categories/${id}`, data),

  delete: (id: string) => apiDelete<void>(`/categories/${id}`),

  reorder: (ids: string[]) => apiPatch<void>('/categories/reorder', { ids }),
}
