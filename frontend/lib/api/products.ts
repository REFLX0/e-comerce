import { apiGet } from './client'
import type { Product, PaginatedResponse, ProductFilters, FuelType, VehicleMake, VehicleModel, VehicleGeneration, VehicleEngine, FacetsResponse } from '@/lib/types'

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

  getCompatible: (params: {
    make: string
    model: string
    generation?: string
    engine?: string
    categorySlug?: string
    brands?: string
    viscosity?: string
    batteryType?: string
    priceMin?: number
    priceMax?: number
    inStockOnly?: boolean
    isNew?: boolean
    isFeatured?: boolean
    search?: string
    type?: string
    api?: string
    acea?: string
    volume?: string
    sortBy?: string
    page?: number
    limit?: number
  }) =>
    apiGet<PaginatedResponse<Product & { compatLevel?: 'confirmed' | 'check' }>>(
      '/vehicles/compatible/page',
      params as Record<string, string | number | boolean | undefined>
    ),

  getOilByVehicle: (params: { make: string; model: string; engineCode?: string; generation?: string }) =>
    apiGet<{ data: Product[]; total: number; oilFinderStatus?: string; oilSpec?: any }>('/oil-finder/vehicle', params),

  getOilRecommendations: (params: { vehicleType: string; displacementCc: number; power: number; fuelType: FuelType; make?: string }) =>
    apiGet<{ data: Product[]; total: number; oilFinderStatus?: string; oilSpec?: any }>('/oil-finder/specs', {
      displacementCc: params.displacementCc,
      powerHp: params.power,
      fuelType: params.fuelType,
    }),

  getMakes: (vehicleType?: string) => apiGet<VehicleMake[]>('/oil-finder/makes', vehicleType ? { category: vehicleType } : undefined),

  getModels: (makeName: string, category?: string) =>
    apiGet<VehicleModel[]>(
      `/oil-finder/makes/${encodeURIComponent(makeName)}/models`,
      category ? { category } : undefined
    ),

  getGenerations: (makeName: string, modelName: string) =>
    apiGet<VehicleGeneration[]>(`/oil-finder/models/${encodeURIComponent(makeName)}/${encodeURIComponent(modelName)}/generations`),

  getEngines: (makeName: string, modelName: string, generationName?: string) => {
    if (generationName) {
      return apiGet<VehicleEngine[]>(
        `/oil-finder/models/${encodeURIComponent(makeName)}/${encodeURIComponent(modelName)}/generations/${encodeURIComponent(generationName)}/engines`
      )
    }
    return apiGet<VehicleEngine[]>(
      `/oil-finder/models/${encodeURIComponent(makeName)}/${encodeURIComponent(modelName)}/engines`
    )
  },

  getAIRecommendation: (params: { make: string; model: string; engineCode?: string }) =>
    apiGet<{ recommendation: string }>('/oil-finder/ai-recommendation', params),
}
