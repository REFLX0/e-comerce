'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { useVehicleStore } from '@/lib/store/vehicle.store'

const VEHICLE_PARAM_KEYS = ['make', 'model', 'engine']

/**
 * Keeps the URL in sync with the persisted vehicle selection.
 *
 * When a vehicle exists in the store but the URL carries none (e.g. the user
 * lands on /catalogue from the footer or a category link), the vehicle is
 * written into the URL so the compatibility context survives refresh, the
 * back/forward buttons and direct links. `replace` avoids polluting history.
 */
export function useVehicleUrlSync(enabled = true) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const vehicle = useVehicleStore((state) => state.vehicle)

  useEffect(() => {
    if (!enabled || !vehicle) return
    const hasMake = searchParams.get('make')
    const hasModel = searchParams.get('model')
    if (hasMake && hasModel) return

    const params = new URLSearchParams(searchParams.toString())
    if (!hasMake) params.set('make', vehicle.makeSlug)
    if (!hasModel) params.set('model', vehicle.modelSlug)
    if (vehicle.engineCode && !params.get('engine')) {
      params.set('engine', vehicle.engineCode)
    }
    params.delete('page')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, vehicle?.makeSlug, vehicle?.modelSlug, vehicle?.engineCode])
}

export { VEHICLE_PARAM_KEYS }