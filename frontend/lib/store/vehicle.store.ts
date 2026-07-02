import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SelectedVehicle {
  type: string
  makeId: string
  makeName: string
  makeSlug: string
  modelId: string
  modelName: string
  modelSlug: string
  engineCode: string
}

interface VehicleState {
  vehicle: SelectedVehicle | null
  setVehicle: (vehicle: SelectedVehicle | null) => void
  clearVehicle: () => void
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set) => ({
      vehicle: null,
      setVehicle: (vehicle) => set({ vehicle }),
      clearVehicle: () => set({ vehicle: null }),
    }),
    {
      name: 'kiosquetn-vehicle-storage',
    }
  )
)
