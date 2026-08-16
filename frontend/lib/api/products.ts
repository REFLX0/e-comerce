import { apiGet } from './client'
import type { Product, PaginatedResponse, ProductFilters, FuelType, VehicleMake, VehicleModel, VehicleEngine, FacetsResponse } from '@/lib/types'

export const productsApi = {
  getAll: (filters?: ProductFilters) =>
    apiGet<PaginatedResponse<Product>>(
      '/products',
      filters as Record<string, string | number | boolean | undefined>
    ),

  getFacets: (filters?: Partial<ProductFilters>) =>
    apiGet<FacetsResponse>(
      '/products/facets',
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

  getCompatible: (make: string, model: string, engine?: string, specification?: string) =>
    apiGet<Product[]>('/vehicles/compatible', { make, model, engine, specification }),

  getOilRecommendations: (params: { vehicleType: string; cylinders: number; power: number; fuelType: FuelType; make?: string }) =>
    apiGet<{ data: Product[]; total: number }>('/products/oil-recommendations', params),

  getMakes: (vehicleType?: string) => apiGet<VehicleMake[]>('/vehicles/makes', vehicleType ? { vehicleType } : undefined),

  getModels: (makeSlug: string) => apiGet<VehicleModel[]>(`/vehicles/makes/${makeSlug}/models`),

  getEngines: (modelSlug: string) => apiGet<VehicleEngine[]>(`/vehicles/models/${modelSlug}/engines`),
}
