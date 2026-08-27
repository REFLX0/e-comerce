'use client'

import { useTranslations } from 'next-intl'
import { Car, Tractor, Truck, Bike, BookmarkPlus, CheckCircle2, X, Wrench } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useRouter, Link } from '@/i18n/routing'
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

  const label =
    vehicle?.makeName && vehicle?.modelName
      ? `${vehicle.makeName} ${vehicle.modelName}${urlEngine ? ` · ${urlEngine}` : ''}`
      : [urlMake, urlModel, urlEngine].filter(Boolean).join(' · ')
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
    (c) => c.makeSlug === (vehicle?.makeSlug || urlMake) && c.modelSlug === (vehicle?.modelSlug || urlModel)
  )

  const saveMutation = useMutation({
    mutationFn: async () => {
      const makeName = vehicle?.makeName || urlMake
      const modelName = vehicle?.modelName || urlModel
      return carsApi.create({
        name: `${makeName} ${modelName}`,
        make: makeName,
        makeSlug: urlMake,
        model: modelName,
        modelSlug: urlModel,
        engine: urlEngine || undefined,
        currentMileage: 0,
        lastOilChangeMileage: 0,
      })
    },
    onSuccess: () => {
      toast.success(t('vehicleSaved') || 'Véhicule enregistré dans votre garage !')
      queryClient.invalidateQueries({ queryKey: ['my-cars'] })
    },
    onError: () => {
      toast.error(t('vehicleSaveError') || 'Erreur lors de la sauvegarde.')
    },
  })

  const handleClear = () => {
    clearVehicle()
    const params = new URLSearchParams(searchParams.toString())
    VEHICLE_PARAM_KEYS.forEach((key) => params.delete(key))
    params.set('all', '1')
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `?${qs}` : '?all=1')
  }

  return (
    <div className="mb-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-[#16254c] via-[#1a2d5a] to-[#16254c] px-5 py-4 shadow-xl ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-400 shadow-inner backdrop-blur-md">
          <VehicleIcon size={24} strokeWidth={1.8} />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
          </span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              Filtre Compatibilité Actif
            </span>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
              Pièces 100% compatibles
            </span>
          </div>
          <p className="mt-0.5 text-base font-bold tracking-tight text-white capitalize">
            {label}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2.5">
        {isAuthenticated && (
          <>
            <Link
              href="/compte/voitures"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-all"
            >
              <Wrench size={14} className="text-[#D4A76A]" />
              Mes Voitures
            </Link>

            {!isSaved && (
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 text-xs font-semibold text-white hover:bg-white/10 transition-all"
              >
                <BookmarkPlus size={14} className="text-emerald-400" />
                {t('saveToGarage') || 'Ajouter à mon compte'}
              </button>
            )}
          </>
        )}

        <button
          type="button"
          onClick={handleClear}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 px-3.5 text-xs font-semibold text-white transition-all"
          title="Désactiver le filtre véhicule et voir tout le catalogue"
        >
          <X size={14} className="text-red-400" />
          <span>Voir tout le catalogue</span>
        </button>
      </div>
    </div>
  )
}