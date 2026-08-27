"use client"

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Product } from '@/lib/types'
import { carsApi } from '@/lib/api/cars'
import { useAuthStore } from '@/lib/store/auth.store'
import { useVehicleStore } from '@/lib/store/vehicle.store'
import { findProductCompatibilityMatch, getVehicleCompatibilityLabel } from '@/lib/utils/compatibility'

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

  // 1. If backend explicitly verified this product for a vehicle search query:
  const isConfirmedByBackend = (product as any)?.compatLevel === 'confirmed'

  // The active target vehicle is the one in the vehicle store, or the primary saved car
  const activeVehicle = useMemo(() => {
    if (selectedVehicle) return selectedVehicle
    if (savedCars.length > 0) return savedCars[0]
    return null
  }, [selectedVehicle, savedCars])

  const checkedVehicles = useMemo(() => {
    return mounted ? [selectedVehicle, ...savedCars].filter(Boolean) : []
  }, [mounted, selectedVehicle, savedCars])

  const match = useMemo(
    () => findProductCompatibilityMatch(product, checkedVehicles),
    [product, checkedVehicles]
  )

  const activeVehicleLabel = useMemo(() => {
    if (!activeVehicle) return null
    return getVehicleCompatibilityLabel(activeVehicle)
  }, [activeVehicle])

  const isCompatible = isConfirmedByBackend || Boolean(match)
  const resolvedVehicleLabel = match?.label ?? activeVehicleLabel

  return {
    isCompatible,
    vehicleLabel: resolvedVehicleLabel,
    matchedVehicle: match?.vehicle ?? activeVehicle,
    hasCheckedVehicles: Boolean(selectedVehicle) || (mounted && isConfirmedByBackend),
    hasAnySavedVehicle: savedCars.length > 0,
    firstCheckedVehicleLabel: activeVehicleLabel,
  }
}
