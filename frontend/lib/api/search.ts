import { apiGet } from './client'
import type { Product, Category, Brand } from '@/lib/types'

export interface SearchSuggestions {
  products: Product[]
  categories: Category[]
  brands: Brand[]
}

export const searchApi = {
  suggestions: (query: string) => apiGet<SearchSuggestions>('/search/suggestions', { q: query }),

  full: (query: string, page = 1, limit = 20) =>
    apiGet<{ products: Product[]; total: number }>('/search', {
      q: query,
      page,
      limit,
    }),
}

