'use client'

import { useTranslations } from 'next-intl'
import { Car, Pencil } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { useVehicleStore } from '@/lib/store/vehicle.store'

const VEHICLE_PARAM_KEYS = ['make', 'model', 'engine']

/**
 * Shows the currently selected vehicle and lets the user clear it.
 * Only renders when make+model are present in the URL — does NOT render
 * purely from the persisted Zustand store, to avoid bleeding into
 * unrelated catalogue/search pages after an oil-finder session.
 */
export function VehicleContextBar() {
  const t = useTranslations('Catalogue')
  const router = useRouter()
  const searchParams = useSearchParams()
  const clearVehicle = useVehicleStore((state) => state.clearVehicle)

  const urlMake = searchParams.get('make')
  const urlModel = searchParams.get('model')
  const urlEngine = searchParams.get('engine')

  // Only render when make+model are in the URL
  if (!urlMake || !urlModel) return null

  const label = [urlMake, urlModel, urlEngine].filter(Boolean).join(' · ')

  const handleEdit = () => {
    clearVehicle()
    const params = new URLSearchParams(searchParams.toString())
    VEHICLE_PARAM_KEYS.forEach((key) => params.delete(key))
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `?${qs}` : '')
  }

  return (
    <div className="mb-6 flex flex-col gap-3 border border-[#16254c]/15 bg-[#16254c]/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#16254c] text-[#D4A76A]">
          <Car size={16} />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#16254c]/60">
            {t('yourVehicle')}
          </p>
          <p className="text-sm font-bold text-[#111]">🚗 {label}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleEdit}
        className="inline-flex min-h-9 items-center justify-center gap-2 border border-[#16254c]/25 bg-white px-4 text-xs font-black uppercase tracking-[0.12em] text-[#16254c] transition-colors hover:border-[#16254c] hover:bg-[#16254c] hover:text-white"
      >
        <Pencil size={13} />
        {t('editVehicle')}
      </button>
    </div>
  )
}