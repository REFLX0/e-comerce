import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store/auth.store'
import { useVehicleStore } from '@/lib/store/vehicle.store'
import { carsApi } from '@/lib/api/cars'
import type { UserCar } from '@/lib/types'
import type { SelectedVehicle } from '@/lib/store/vehicle.store'

/**
 * Maps a saved account car (UserCar) to the shape the vehicle store expects.
 * Defaults type to 'automobile' since UserCar has no vehicleType field yet.
 */
function userCarToSelectedVehicle(car: UserCar): SelectedVehicle {
  return {
    type: 'automobile',
    makeId: car.makeSlug ?? car.make ?? '',
    makeName: car.make ?? '',
    makeSlug: car.makeSlug ?? '',
    modelId: car.modelSlug ?? car.model ?? '',
    modelName: car.model ?? '',
    modelSlug: car.modelSlug ?? '',
    engineCode: car.engine ?? '',
  }
}

/**
 * Automatically syncs the logged-in user's first saved account vehicle into
 * the vehicle store so that VehicleContextBar and catalogue filters work
 * without the user having to go through the Oil Finder.
 *
 * Rules:
 * - Only runs when the user is authenticated.
 * - Only sets the vehicle if the store is currently empty (never overwrites a
 *   vehicle the user explicitly chose via the Oil Finder).
 * - Only uses cars that have a known makeSlug + modelSlug (DB-linked cars).
 */
export function useAccountVehicleSync() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const currentVehicle = useVehicleStore((state) => state.vehicle)
  const setVehicle = useVehicleStore((state) => state.setVehicle)

  const { data: cars } = useQuery({
    queryKey: ['my-cars'],
    queryFn: carsApi.getAll,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min — no need to re-fetch on every mount
  })

  useEffect(() => {
    // Don't overwrite if the user already has an active vehicle
    if (currentVehicle) return
    if (!cars || cars.length === 0) return

    // Pick the first car that has both makeSlug and modelSlug
    const primary = cars.find((c) => c.makeSlug && c.modelSlug)
    if (!primary) return

    setVehicle(userCarToSelectedVehicle(primary))
  }, [cars, currentVehicle, setVehicle])
}
