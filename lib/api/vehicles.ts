import { apiGet } from './client'
import type { VehicleMake } from '@/lib/types'

export const vehiclesApi = {
  getAll: (type?: string) =>
    apiGet<VehicleMake[]>('/vehicles', type ? { type } : undefined),

  getMakes: (type?: string) =>
    apiGet<VehicleMake[]>('/vehicles/makes', type ? { type } : undefined),

  getModels: (makeId: string) =>
    apiGet<VehicleMake>(`/vehicles/makes/${makeId}`),
}
