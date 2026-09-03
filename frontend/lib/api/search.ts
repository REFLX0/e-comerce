import { apiGet } from './client'

// Shape returned by GET /search/suggestions (getSuggestionsWithFallback)
export interface SuggestionProduct {
  id: string
  name: string   // nameFr from DB
  slug: string
  image?: string // first image URL
  price?: number
  brandName?: string
  viscosity?: string
  oemApprovals?: string
}

export interface SuggestionCategory {
  id: string
  name: string   // nameFr from DB
  slug: string
}

export interface SuggestionBrand {
  id: string
  name: string
  slug: string
  logo?: string  // logoUrl from DB
}

export interface SearchSuggestions {
  products: SuggestionProduct[]
  categories: SuggestionCategory[]
  brands: SuggestionBrand[]
}

export const searchApi = {
  /** GET /search/suggestions — returns products + categories + brands grouped */
  suggestions: (query: string) =>
    apiGet<SearchSuggestions>('/search/suggestions', { q: query }),

  /** GET /search — full-text search, returns paginated products */
  full: (query: string, page = 1, limit = 20) =>
    apiGet<{ products: any[]; total: number }>('/search', {
      q: query,
      page,
      limit,
    }),
}
