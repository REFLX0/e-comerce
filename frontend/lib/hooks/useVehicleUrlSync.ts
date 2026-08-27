'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePathname, useRouter } from '@/i18n/routing'
import { useVehicleStore } from '@/lib/store/vehicle.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { carsApi } from '@/lib/api/cars'

const VEHICLE_PARAM_KEYS = ['make', 'model', 'engine']

/**
 * Keeps the URL in sync with the persisted vehicle selection.
 *
 * When a vehicle exists in the store (or user's saved account garage) but the URL
 * carries none, the vehicle is written into the URL so the compatibility filter
 * is applied automatically and only compatible parts are shown.
 */
export function useVehicleUrlSync(enabled = true) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const vehicle = useVehicleStore((state) => state.vehicle)
  const setVehicle = useVehicleStore((state) => state.setVehicle)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  // Load user's garage cars if authenticated and vehicle store is empty
  const { data: userCars } = useQuery({
    queryKey: ['my-cars'],
    queryFn: carsApi.getAll,
    enabled: isHydrated && isAuthenticated && !vehicle,
    staleTime: 5 * 60 * 1000,
  })

  // Automatically activate the customer's vehicle from their garage
  useEffect(() => {
    if (!vehicle && userCars && userCars.length > 0) {
      const primaryCar = userCars.find((c) => c.makeSlug && c.modelSlug) || userCars[0]
      if (primaryCar) {
        const makeSlug = primaryCar.makeSlug || (primaryCar.make ? primaryCar.make.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '')
        const modelSlug = primaryCar.modelSlug || (primaryCar.model ? primaryCar.model.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '')
        if (makeSlug && modelSlug) {
          setVehicle({
            type: 'automobile',
            makeId: makeSlug,
            makeName: primaryCar.make ?? makeSlug,
            makeSlug,
            modelId: modelSlug,
            modelName: primaryCar.model ?? modelSlug,
            modelSlug,
            engineCode: primaryCar.engine ?? '',
          })
        }
      }
    }
  }, [vehicle, userCars, setVehicle])

  useEffect(() => {
    if (!enabled || !vehicle) return
    const isExplicitAll = searchParams.get('all') === '1'
    if (isExplicitAll) return

    const hasMake = searchParams.get('make')
    const hasModel = searchParams.get('model')
    const isSpecSearch = searchParams.has('vehicleType') && searchParams.has('power')
    
    if (hasMake && hasModel) return
    if (isSpecSearch) return

    const params = new URLSearchParams(searchParams.toString())
    if (!hasMake && vehicle.makeSlug) params.set('make', vehicle.makeSlug)
    if (!hasModel && vehicle.modelSlug) params.set('model', vehicle.modelSlug)
    if (vehicle.engineCode && !params.get('engine')) {
      params.set('engine', vehicle.engineCode)
    }
    params.delete('page')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, vehicle?.makeSlug, vehicle?.modelSlug, vehicle?.engineCode, searchParams])
}

export { VEHICLE_PARAM_KEYS }