'use client'

import { useTranslations } from 'next-intl'
import { Car, Pencil, Tractor, Truck, Bike, BookmarkPlus, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { useVehicleStore } from '@/lib/store/vehicle.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { carsApi } from '@/lib/api/cars'
import { toast } from 'sonner'
import clsx from 'clsx'

const VEHICLE_PARAM_KEYS = ['make', 'model', 'engine']

export function VehicleContextBar() {
  const t = useTranslations('Catalogue')
  const router = useRouter()
  const searchParams = useSearchParams()
  const clearVehicle = useVehicleStore((state) => state.clearVehicle)
  const vehicle = useVehicleStore((state) => state.vehicle)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const queryClient = useQueryClient()

  const urlMake = searchParams.get('make')
  const urlModel = searchParams.get('model')
  const urlEngine = searchParams.get('engine')

  // Only render when make+model are in the URL
  if (!urlMake || !urlModel) return null

  const label = [urlMake, urlModel, urlEngine].filter(Boolean).join(' · ')
  const type = vehicle?.type || 'automobile'

  let VehicleIcon = Car
  if (type === 'agricole') VehicleIcon = Tractor
  else if (type === 'moto') VehicleIcon = Bike
  else if (type === 'poids-lourd') VehicleIcon = Truck

  const { data: cars } = useQuery({
    queryKey: ['my-cars'],
    queryFn: carsApi.getAll,
    enabled: isAuthenticated,
  })

  const isSaved = cars?.some(
    (c) => c.makeSlug === vehicle?.makeSlug && c.modelSlug === vehicle?.modelSlug
  )

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!vehicle) throw new Error('No vehicle data')
      return carsApi.create({
        name: `${vehicle.makeName} ${vehicle.modelName}`,
        make: vehicle.makeName,
        makeSlug: vehicle.makeSlug,
        model: vehicle.modelName,
        modelSlug: vehicle.modelSlug,
        engine: vehicle.engineCode,
        currentMileage: 0,
        lastOilChangeMileage: 0,
      })
    },
    onSuccess: () => {
      toast.success(t('vehicleSaved') || 'Véhicule sauvegardé !')
      queryClient.invalidateQueries({ queryKey: ['my-cars'] })
    },
    onError: () => {
      toast.error(t('vehicleSaveError') || 'Erreur lors de la sauvegarde.')
    },
  })

  const handleEdit = () => {
    clearVehicle()
    const params = new URLSearchParams(searchParams.toString())
    VEHICLE_PARAM_KEYS.forEach((key) => params.delete(key))
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `?${qs}` : '')
  }

  return (
    <div className="mb-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#16254c] to-[#1e3264] px-5 py-4 shadow-xl ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/10 text-white shadow-inner backdrop-blur-md">
          <VehicleIcon size={24} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4A76A]/90">
            {t('yourVehicle')}
          </p>
          <p className="mt-0.5 text-base font-semibold tracking-tight text-white">
            {label}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => !isSaved && saveMutation.mutate()}
            disabled={isSaved || saveMutation.isPending}
            className={clsx(
              "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-bold uppercase tracking-wide transition-all",
              isSaved
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20"
            )}
          >
            {isSaved ? <CheckCircle2 size={16} /> : <BookmarkPlus size={16} />}
            {isSaved ? (t('savedToGarage') || 'Sauvegardé') : (t('saveToGarage') || 'Sauvegarder')}
          </button>
        )}

        <button
          type="button"
          onClick={handleEdit}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-white px-4 text-xs font-black uppercase tracking-[0.12em] text-[#16254c] shadow-md transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Pencil size={14} />
          {t('editVehicle')}
        </button>
      </div>
    </div>
  )
}