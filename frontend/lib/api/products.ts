import { apiGet } from './client'
import type { Product, PaginatedResponse, ProductFilters } from '@/lib/types'

export const productsApi = {
  getAll: (filters?: ProductFilters) =>
    apiGet<PaginatedResponse<Product>>(
      '/products',
      filters as Record<string, string | number | boolean | undefined>
    ),

  getBySlug: (slug: string) => apiGet<Product>(`/products/${slug}`),

  getBestSellers: (limit = 8) => apiGet<Product[]>('/products/best-sellers', { limit }),

  getNew: (limit = 8) => apiGet<Product[]>('/products/new', { limit }),

  getPromos: (limit = 12) => apiGet<Product[]>('/products/promos', { limit }),

  getRelated: (productId: string, limit = 6) =>
    apiGet<Product[]>(`/products/${productId}/related`, { limit }),

  getByCategory: (
    categorySlug: string,
    filters?: Omit<ProductFilters, 'categorySlug'>
  ) =>
    apiGet<PaginatedResponse<Product>>(
      `/categories/${categorySlug}/products`,
      filters as Record<string, string | number | boolean | undefined>
    ),

  getByBrand: (brandSlug: string, filters?: Omit<ProductFilters, 'brandSlug'>) =>
    apiGet<PaginatedResponse<Product>>(
      `/brands/${brandSlug}/products`,
      filters as Record<string, string | number | boolean | undefined>
    ),

  search: (query: string, limit = 10) =>
    apiGet<Product[]>('/products/search', { q: query, limit }),

  getCompatible: (
    vehicleType: string,
    make: string,
    model: string,
    year: number,
    engine?: string
  ) =>
    apiGet<Product[]>('/products/compatible', {
      vehicleType,
      make,
      model,
      year,
      engine,
    }),
}
