import { backendClient as api } from './client'
import type { UserCar } from '@/lib/types'

export type CarPayload = {
  name: string
  make?: string        // display name e.g. "Renault" — for compatibility matching
  makeSlug?: string   // slug e.g. "renault" — for catalogue URL filter
  model?: string       // display name e.g. "Clio IV" — for compatibility matching
  modelSlug?: string  // slug e.g. "clio-iv" — for catalogue URL filter
  year?: number
  plateNumber?: string
  currentMileage: number
  lastOilChangeMileage: number
  oilChangeIntervalKm?: number
  oilChangeDone?: boolean
  oilFilterChanged?: boolean
  airFilterChanged?: boolean
  cabinFilterChanged?: boolean
}

export const carsApi = {
  getAll: () => api.get<UserCar[]>('/users/me/cars'),

  create: (data: CarPayload) => api.post<UserCar>('/users/me/cars', data),

  update: (id: string, data: Partial<CarPayload>) =>
    api.patch<UserCar>(`/users/me/cars/${id}`, data),

  delete: (id: string) => api.delete<UserCar>(`/users/me/cars/${id}`),
}
