import { apiGet } from './client'

export interface ShippingZone {
  id: string
  name: string
  price: number
  eta: string
  sortOrder: number
  isActive: boolean
}

export interface ShippingRateResult {
  zoneName: string
  basePrice: number
  price: number
  eta: string
  isFree: boolean
  freeShippingThreshold: number
}

export const shippingApi = {
  getZones: () => apiGet<ShippingZone[]>('/shipping/zones'),
  calculateRate: (wilaya?: string, subtotal?: number) =>
    apiGet<ShippingRateResult>('/shipping/rate', {
      wilaya: wilaya || undefined,
      subtotal: typeof subtotal === 'number' ? subtotal : undefined,
    }),
}
