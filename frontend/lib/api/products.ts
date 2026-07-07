import { apiGet } from './client'
import type { Product, PaginatedResponse, ProductFilters, FuelType } from '@/lib/types'

export const productsApi = {
  getAll: (filters?: ProductFilters) =>
    apiGet<PaginatedResponse<Product>>(
      '/products',
      filters as Record<string, string | number | boolean | undefined>
    ),

  getBySlug: (slug: string) => apiGet<Product>(`/products/${slug}`),

  getBestSellers: (limit = 8) => apiGet<Product[]>('/products/best-sellers', { limit }),

  getNew: (limit = 8) => apiGet<Product[]>('/products/new', { limit }),

  getPromos: (limit = 12) => apiGet<Product[]>('/products', { isPromo: true, limit }),

  getRelated: (productId: string, limit = 6) =>
    apiGet<Product[]>(`/products/${productId}/related`, { limit }),

  getByCategory: (categorySlug: string, filters?: Omit<ProductFilters, 'categorySlug'>) =>
    apiGet<PaginatedResponse<Product>>(
      `/products`,
      { ...filters, categorySlug } as Record<string, string | number | boolean | undefined>
    ),

  getByBrand: (brandSlug: string, filters?: Omit<ProductFilters, 'brandSlug'>) =>
    apiGet<PaginatedResponse<Product>>(
      `/products`,
      { ...filters, brandSlug } as Record<string, string | number | boolean | undefined>
    ),

  search: (query: string, limit = 10) => apiGet<Product[]>('/search/products', { q: query, limit }),

  getCompatible: (make: string, model: string, engine?: string) =>
    apiGet<Product[]>('/vehicles/compatible', { make, model, engine }),

  getOilRecommendations: (params: { type: string; cylinders: number; power: number; fuelType: FuelType; make?: string }) =>
    apiGet<{ data: Product[]; total: number }>('/products/oil-recommendations', params),
}

