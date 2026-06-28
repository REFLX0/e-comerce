import { apiGet, apiPost } from './client'
import type { VehicleMake, Product } from '@/lib/types'

interface RecommendationPayload {
  make: string
  model: string
  year: number
  engine: string
}

export const vehiclesApi = {
  getAll: (type?: string) =>
    apiGet<VehicleMake[]>('/vehicles', type ? { type } : undefined),

  getMakes: (type?: string) =>
    apiGet<string[]>('/vehicles/makes', type ? { type } : undefined),

  getModels: (make: string) =>
    apiGet<string[]>(`/vehicles/makes/${make}/models`),
    
  getYears: (make: string, model: string) =>
    apiGet<number[]>(`/vehicles/makes/${make}/models/${model}/years`),
    
  getEngines: (make: string, model: string, year: number) =>
    apiGet<string[]>(`/vehicles/makes/${make}/models/${model}/years/${year}/engines`),
    
  getRecommendations: (payload: RecommendationPayload) =>
    apiPost<Product[]>('/vehicles/recommendations', payload),
}
