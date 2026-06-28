import { apiGet } from './client'
import type { BlogPost, PaginatedResponse } from '@/lib/types'

export const blogApi = {
  getAll: (page = 1, limit = 9, tag?: string) =>
    apiGet<PaginatedResponse<BlogPost>>('/blog', { page, limit, tag }),

  getRecent: (limit = 3) => apiGet<BlogPost[]>('/blog/recent', { limit }),

  getBySlug: (slug: string) => apiGet<BlogPost>(`/blog/${slug}`),
}
