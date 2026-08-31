import { backendClient as api } from './client'
import type { UserCar } from '@/lib/types'

export type CarPayload = {
  name: string
  make?: string        // display name e.g. "Renault" — for compatibility matching
  makeSlug?: string   // slug e.g. "renault" — for catalogue URL filter
  model?: string       // display name e.g. "Clio IV" — for compatibility matching
  modelSlug?: string  // slug e.g. "clio-iv" — for catalogue URL filter
  year?: number
  vin?: string         // 17-char VIN / chassis number
  engine?: string      // motorisation e.g. "1.5 dCi 90"
  displacement?: number // cylinder capacity in litres
  cylinders?: number   // number of cylinders
  fuel?: string        // essence | diesel | hybride | electrique | gpl
  power?: number       // horsepower
  transmission?: string // manuelle | automatique
  trim?: string        // version / finition
  productionDate?: string // "YYYY-MM"
  currentMileage: number
  lastOilChangeMileage: number
  oilChangeIntervalKm?: number
  oilChangeDone?: boolean
  oilFilterChanged?: boolean
  airFilterChanged?: boolean
  cabinFilterChanged?: boolean
  fuelFilterChanged?: boolean
  customNotes?: string
}

export const carsApi = {
  getAll: () => api.get<UserCar[]>('/users/me/cars'),

  create: (data: CarPayload) => api.post<UserCar>('/users/me/cars', data),

  update: (id: string, data: Partial<CarPayload>) =>
    api.patch<UserCar>(`/users/me/cars/${id}`, data),

  delete: (id: string) => api.delete<UserCar>(`/users/me/cars/${id}`),
}
