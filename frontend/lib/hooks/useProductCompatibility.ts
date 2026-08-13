"use client"

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Product } from '@/lib/types'
import { carsApi } from '@/lib/api/cars'
import { useAuthStore } from '@/lib/store/auth.store'
import { useVehicleStore } from '@/lib/store/vehicle.store'
import { findProductCompatibilityMatch } from '@/lib/utils/compatibility'

export function useProductCompatibility(product: Product) {
  const selectedVehicle = useVehicleStore((state) => state.vehicle)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: savedCars = [] } = useQuery({
    queryKey: ['my-cars'],
    queryFn: carsApi.getAll,
    enabled: isHydrated && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const match = useMemo(
    () => findProductCompatibilityMatch(product, mounted ? [selectedVehicle, ...savedCars] : []),
    [product, mounted, selectedVehicle, savedCars]
  )

  return {
    isCompatible: Boolean(match),
    vehicleLabel: match?.label ?? null,
    matchedVehicle: match?.vehicle ?? null,
  }
}
