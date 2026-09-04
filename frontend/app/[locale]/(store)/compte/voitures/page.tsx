"use client";

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Calendar,
  Car,
  CheckCircle2,
  Gauge,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  Wrench,
  Sparkles,
  ShieldCheck,
  Fuel,
  Zap,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Check,
  X,
  ArrowRight
} from 'lucide-react'
import { gooeyToast as toast } from 'goey-toast'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { productsApi } from '@/lib/api/products'
import { carsApi, type CarPayload } from '@/lib/api/cars'
import type { UserCar } from '@/lib/types'
import { useVehicleStore } from '@/lib/store/vehicle.store'

type CarForm = {
  name: string
  make: string        // makeSlug
  model: string       // modelSlug
  makeName: string
  modelName: string
  customMake?: string
  customModel?: string
  year: string
  vin: string
  engine: string
  displacement: string
  cylinders: string
  fuel: string
  power: string
  transmission: string
  trim: string
  productionDate: string
  currentMileage: string
  lastOilChangeMileage: string
  oilChangeIntervalKm: string
  oilFilterChanged: boolean
  airFilterChanged: boolean
  cabinFilterChanged: boolean
  fuelFilterChanged: boolean
  customNotes?: string
}

const EMPTY_FORM: CarForm = {
  name: '',
  make: '',
  makeName: '',
  model: '',
  modelName: '',
  customMake: '',
  customModel: '',
  year: '',
  vin: '',
  engine: '',
  displacement: '',
  cylinders: '',
  fuel: '',
  power: '',
  transmission: '',
  trim: '',
  productionDate: '',
  currentMileage: '',
  lastOilChangeMileage: '',
  oilChangeIntervalKm: '10000',
  oilFilterChanged: false,
  airFilterChanged: false,
  cabinFilterChanged: false,
  fuelFilterChanged: false,
  customNotes: '',
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toOptionalNumber(value: string) {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function formatKm(value: number) {
  return value.toLocaleString()
}

function getReminder(car: UserCar, t: any) {
  const nextMileage = car.lastOilChangeMileage + car.oilChangeIntervalKm
  const remainingKm = nextMileage - car.currentMileage

  if (remainingKm <= 0) {
    return {
      status: 'urgent',
      title: t('oilChangeOverdueTitle'),
      text: t('oilChangeOverdueDesc', { km: formatKm(Math.abs(remainingKm)) }),
      remainingKm,
      progressColor: 'from-rose-500 to-red-600',
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
    }
  }

  if (remainingKm <= 1500) {
    return {
      status: 'warning',
      title: t('oilChangeSoonTitle'),
      text: t('oilChangeSoonDesc', { km: formatKm(remainingKm) }),
      remainingKm,
      progressColor: 'from-amber-400 to-orange-500',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    }
  }

  return {
    status: 'ok',
    title: t('oilChangeOkTitle', { km: formatKm(remainingKm) }),
    text: t('oilChangeOkDesc', { nextMileage: formatKm(nextMileage) }),
    remainingKm,
    progressColor: 'from-emerald-400 to-teal-500',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: ShieldCheck,
    iconColor: 'text-emerald-600',
  }
}

function buildPayload(form: CarForm): CarPayload {
  const isCustomMake = form.make === 'Autre'
  const isCustomModel = form.model === 'Autre'

  const finalMake = isCustomMake ? form.customMake?.trim() : form.makeName || form.make
  const finalMakeSlug = isCustomMake ? undefined : form.make || undefined
  const finalModel = isCustomModel ? form.customModel?.trim() : form.modelName || form.model
  const finalModelSlug = isCustomModel ? undefined : form.model || undefined

  return {
    name: form.name.trim(),
    make: finalMake || undefined,
    makeSlug: finalMakeSlug,
    model: finalModel || undefined,
    modelSlug: finalModelSlug,
    year: toOptionalNumber(form.year),
    vin: form.vin.trim().toUpperCase() || undefined,
    engine: form.engine.trim() || undefined,
    displacement: toOptionalNumber(form.displacement),
    cylinders: toOptionalNumber(form.cylinders),
    fuel: form.fuel || undefined,
    power: toOptionalNumber(form.power),
    transmission: form.transmission || undefined,
    trim: form.trim.trim() || undefined,
    productionDate: form.productionDate || undefined,
    currentMileage: toNumber(form.currentMileage),
    lastOilChangeMileage: toNumber(form.lastOilChangeMileage),
    oilChangeIntervalKm: toNumber(form.oilChangeIntervalKm, 10000),
    oilFilterChanged: form.oilFilterChanged,
    airFilterChanged: form.airFilterChanged,
    cabinFilterChanged: form.cabinFilterChanged,
  }
}

function ServiceToggle({
  id,
  checked,
  label,
  sublabel,
  onChange,
  disabled,
}: {
  id: string
  checked: boolean
  label: string
  sublabel?: string
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <label
      htmlFor={id}
      className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition-all select-none ${
        checked
          ? 'border-emerald-500/40 bg-emerald-50/50 shadow-sm shadow-emerald-500/5'
          : 'border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center gap-3 pr-3">
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
          checked 
            ? 'border-emerald-500 bg-emerald-500 text-white' 
            : 'border-slate-300 bg-white text-transparent group-hover:border-slate-400'
        }`}>
          <Check size={14} strokeWidth={3} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800 tracking-tight">{label}</p>
          {sublabel && <p className="text-[11px] text-slate-500 mt-0.5">{sublabel}</p>}
        </div>
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
    </label>
  )
}

function CarCard({ car }: { car: UserCar }) {
  const t = useTranslations('Vehicle')
  const queryClient = useQueryClient()
  const router = useRouter()
  const locale = useLocale()
  const setVehicle = useVehicleStore((state) => state.setVehicle)
  const activeVehicle = useVehicleStore((state) => state.vehicle)

  const isSelectedForCatalogue = Boolean(
    activeVehicle?.makeSlug &&
    car.makeSlug &&
    activeVehicle.makeSlug.toLowerCase() === car.makeSlug.toLowerCase() &&
    activeVehicle?.modelSlug &&
    car.modelSlug &&
    activeVehicle.modelSlug.toLowerCase() === car.modelSlug.toLowerCase() &&
    (!car.engine || !activeVehicle.engineCode || activeVehicle.engineCode.toLowerCase() === car.engine.toLowerCase())
  )

  const handleActivateAndBrowse = () => {
    setVehicle({
      type: 'automobile',
      makeId: car.makeSlug ?? '',
      makeName: car.make ?? '',
      makeSlug: car.makeSlug ?? '',
      modelId: car.modelSlug ?? '',
      modelName: car.model ?? '',
      modelSlug: car.modelSlug ?? '',
      engineCode: car.engine ?? '',
    })
    const params = new URLSearchParams()
    if (car.makeSlug) params.set('make', car.makeSlug)
    if (car.modelSlug) params.set('model', car.modelSlug)
    if (car.engine) params.set('engine', car.engine)
    router.push(`/${locale}/catalogue?${params.toString()}`)
  }

  const handleSetOnlyActive = () => {
    setVehicle({
      type: 'automobile',
      makeId: car.makeSlug ?? '',
      makeName: car.make ?? '',
      makeSlug: car.makeSlug ?? '',
      modelId: car.modelSlug ?? '',
      modelName: car.model ?? '',
      modelSlug: car.modelSlug ?? '',
      engineCode: car.engine ?? '',
    })
    toast.success(t('filterActivatedToast', { name: car.name }))
  }

  const reminder = getReminder(car, t)
  const ReminderIcon = reminder.icon
  const progress = Math.min(
    100,
    Math.max(
      0,
      ((car.currentMileage - car.lastOilChangeMileage) / car.oilChangeIntervalKm) * 100
    )
  )

  const [currentMileage, setCurrentMileage] = useState(String(car.currentMileage))
  const [lastOilChangeMileage, setLastOilChangeMileage] = useState(
    String(car.lastOilChangeMileage)
  )
  const [intervalKm, setIntervalKm] = useState(String(car.oilChangeIntervalKm))
  const [oilChangeDoneNow, setOilChangeDoneNow] = useState(false)
  const [oilFilterChanged, setOilFilterChanged] = useState(car.oilFilterChanged)
  const [airFilterChanged, setAirFilterChanged] = useState(car.airFilterChanged)
  const [cabinFilterChanged, setCabinFilterChanged] = useState(car.cabinFilterChanged)
  const [fuelFilterChanged, setFuelFilterChanged] = useState(car.fuelFilterChanged ?? false)
  const [customNotes, setCustomNotes] = useState(car.customNotes ?? car.trim ?? '')

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CarPayload>) => carsApi.update(car.id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<UserCar[]>(['my-cars'], (cars) =>
        cars?.map((item) => (item.id === updated.id ? updated : item)) ?? [updated]
      )
      setCurrentMileage(String(updated.currentMileage))
      setLastOilChangeMileage(String(updated.lastOilChangeMileage))
      setIntervalKm(String(updated.oilChangeIntervalKm))
      setOilChangeDoneNow(false)
      setOilFilterChanged(updated.oilFilterChanged)
      setAirFilterChanged(updated.airFilterChanged)
      setCabinFilterChanged(updated.cabinFilterChanged)
      setFuelFilterChanged(updated.fuelFilterChanged ?? false)
      setCustomNotes(updated.customNotes ?? updated.trim ?? '')
      toast.success(t('carUpdated'))
    },
    onError: () => toast.error(t('carUpdateError')),
  })

  const deleteMutation = useMutation({
    mutationFn: () => carsApi.delete(car.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-cars'] })
      toast.success(t('carDeleted'))
    },
    onError: () => toast.error(t('carDeleteError')),
  })

  const saveMaintenance = () => {
    updateMutation.mutate({
      currentMileage: toNumber(currentMileage),
      lastOilChangeMileage: oilChangeDoneNow
        ? undefined
        : toNumber(lastOilChangeMileage),
      oilChangeIntervalKm: toNumber(intervalKm, 10000),
      oilChangeDone: oilChangeDoneNow || undefined,
      oilFilterChanged,
      airFilterChanged,
      cabinFilterChanged,
      fuelFilterChanged,
      customNotes: customNotes.trim() || undefined,
      trim: customNotes.trim() || undefined,
    })
  }

  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_10px_35px_-10px_rgba(22,37,76,0.06)] transition-all duration-300 hover:shadow-[0_20px_45px_-15px_rgba(22,37,76,0.1)] hover:border-slate-300">
      {/* Top Header Card Bar */}
      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-slate-900 via-[#16254c] to-slate-900 p-5 text-white sm:p-6">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full border-[12px] border-white/5 pointer-events-none" />
        
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#D4A76A] to-[#F3D7A4] text-slate-950 shadow-md shadow-black/20 ring-2 ring-white/15">
              <Car size={24} strokeWidth={2} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-black tracking-tight text-white capitalize">{car.name}</h2>
                {car.trim && (
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-md">
                    {car.trim}
                  </span>
                )}
                {isSelectedForCatalogue ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 backdrop-blur-md shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    {t('activeVehicleBadge')}
                  </span>
                ) : (
                  <button
                    onClick={handleSetOnlyActive}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/90 transition-all"
                  >
                    <Zap size={11} className="text-[#D4A76A]" />
                    {t('activate')}
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-white/70 font-medium">
                {[car.make, car.model, car.year, car.engine, car.fuel, car.power ? `${car.power} ch` : null, car.transmission].filter(Boolean).join(' · ') || t('customerCar')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleActivateAndBrowse}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4A76A] to-[#C29557] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-[#D4A76A]/20 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            >
              <Search size={14} strokeWidth={2.5} />
              <span>{t('viewCompatibleParts')}</span>
            </button>
            <button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/70 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 border border-transparent transition-colors"
              title={t('deleteVehicleTitle')}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Body: Maintenance & Oil Tracker */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Gauge Status Box */}
        <div className={`rounded-2xl border p-4.5 transition-all ${reminder.badgeBg}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${reminder.iconColor}`}>
                <ReminderIcon size={20} strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">{reminder.title}</p>
                <p className="text-xs opacity-85 mt-0.5">{reminder.text}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black uppercase tracking-wider opacity-60">{t('wearCycle')}</span>
              <p className="text-sm font-black tracking-tight">{Math.round(progress)}%</p>
            </div>
          </div>
          <div className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-white/80 p-0.5 ring-1 ring-black/5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${reminder.progressColor} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 3 Metric Inputs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3.5 focus-within:border-[#16254c] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#16254c]/10 transition-all">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <Gauge size={13} className="text-[#16254c]" /> {t('currentMileageLabel')}
            </span>
            <div className="relative mt-2 flex items-center">
              <input
                type="number"
                min="0"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(e.target.value)}
                className="w-full bg-transparent font-mono text-base font-bold text-slate-900 outline-none"
              />
              <span className="text-xs font-extrabold text-slate-400">KM</span>
            </div>
          </div>

          <div className="relative rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3.5 focus-within:border-[#16254c] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#16254c]/10 transition-all">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <Wrench size={13} className="text-[#16254c]" /> {t('lastOilMileageLabel')}
            </span>
            <div className="relative mt-2 flex items-center">
              <input
                type="number"
                min="0"
                value={lastOilChangeMileage}
                onChange={(e) => setLastOilChangeMileage(e.target.value)}
                className="w-full bg-transparent font-mono text-base font-bold text-slate-900 outline-none"
              />
              <span className="text-xs font-extrabold text-slate-400">KM</span>
            </div>
          </div>

          <div className="relative rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3.5 focus-within:border-[#16254c] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#16254c]/10 transition-all">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <Calendar size={13} className="text-[#16254c]" /> {t('oilIntervalLabel')}
            </span>
            <div className="relative mt-2 flex items-center">
              <input
                type="number"
                min="1000"
                step="500"
                value={intervalKm}
                onChange={(e) => setIntervalKm(e.target.value)}
                className="w-full bg-transparent font-mono text-base font-bold text-slate-900 outline-none"
              />
              <span className="text-xs font-extrabold text-slate-400">KM</span>
            </div>
          </div>
        </div>

        {/* Maintenance Checklist */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t('maintenanceAndFilters')}
            </p>
            <span className="text-[11px] text-slate-500">{t('checkInterventions')}</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <ServiceToggle
              id={`oil-change-${car.id}`}
              checked={oilChangeDoneNow}
              disabled={updateMutation.isPending}
              label={t('oilChangeDoneToday')}
              sublabel={t('oilChangeDoneTodayHint')}
              onChange={setOilChangeDoneNow}
            />
            <ServiceToggle
              id={`oil-filter-${car.id}`}
              checked={oilFilterChanged}
              disabled={updateMutation.isPending}
              label={t('oilFilterReplaced')}
              sublabel={t('oilFilterReplacedHint')}
              onChange={setOilFilterChanged}
            />
            <ServiceToggle
              id={`air-filter-${car.id}`}
              checked={airFilterChanged}
              disabled={updateMutation.isPending}
              label={t('airFilterReplaced')}
              sublabel={t('airFilterReplacedHint')}
              onChange={setAirFilterChanged}
            />
            <ServiceToggle
              id={`cabin-filter-${car.id}`}
              checked={cabinFilterChanged}
              disabled={updateMutation.isPending}
              label={t('cabinFilterReplaced')}
              sublabel={t('cabinFilterReplacedHint')}
              onChange={setCabinFilterChanged}
            />
            <ServiceToggle
              id={`fuel-filter-${car.id}`}
              checked={fuelFilterChanged}
              disabled={updateMutation.isPending}
              label={t('fuelFilterReplaced')}
              sublabel={t('fuelFilterReplacedHint')}
              onChange={setFuelFilterChanged}
            />
          </div>

          {/* Custom Parts & Maintenance Input - Optimized for Mobile & Touch */}
          <div className="mt-2 rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-4 sm:p-5 transition-all focus-within:border-[#16254c] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#16254c]/10">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#16254c] text-white shadow-sm">
                <Wrench size={14} />
              </div>
              <label htmlFor={`custom-notes-${car.id}`} className="text-xs font-bold text-slate-900 uppercase tracking-wider cursor-pointer">
                {t('customMaintenanceLabel')}
              </label>
            </div>
            
            <div className="relative">
              <input
                id={`custom-notes-${car.id}`}
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder={t('customMaintenancePlaceholder')}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-[#16254c] focus:outline-none focus:ring-2 focus:ring-[#16254c]/20 transition-all"
              />
              {customNotes && (
                <button
                  type="button"
                  onClick={() => setCustomNotes('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={saveMaintenance}
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#16254c] px-5 py-3 text-xs font-bold text-white shadow-md shadow-[#16254c]/15 transition-all hover:bg-[#1f3469] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <Loader2 size={15} className="animate-spin text-[#D4A76A]" />
            ) : (
              <Save size={15} className="text-[#D4A76A]" />
            )}
            <span>{t('saveMaintenanceLog')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MesVoituresPage() {
  const t = useTranslations('Vehicle')
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CarForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['my-cars'],
    queryFn: carsApi.getAll,
  })

  const { data: makes = [] } = useQuery({
    queryKey: ['makes'],
    queryFn: () => productsApi.getMakes(),
  })

  const { data: models = [] } = useQuery({
    queryKey: ['models', form.make],
    queryFn: () => form.make && form.make !== 'Autre' ? productsApi.getModels(form.make) : Promise.resolve([]),
    enabled: !!form.make && form.make !== 'Autre',
  })

  const setVehicle = useVehicleStore((state) => state.setVehicle)

  const cars = useMemo(() => data ?? [], [data])

  const createMutation = useMutation({
    mutationFn: (payload: CarPayload) => carsApi.create(payload),
    onSuccess: (newCar: any) => {
      queryClient.invalidateQueries({ queryKey: ['my-cars'] })
      if (newCar?.makeSlug && newCar?.modelSlug) {
        setVehicle({
          type: 'automobile',
          makeId: newCar.makeSlug,
          makeName: newCar.make ?? newCar.makeSlug,
          makeSlug: newCar.makeSlug,
          modelId: newCar.modelSlug,
          modelName: newCar.model ?? newCar.modelSlug,
          modelSlug: newCar.modelSlug,
          engineCode: newCar.engine ?? '',
        })
      }
      setForm(EMPTY_FORM)
      setErrors({})
      setShowForm(false)
      toast.success(t('vehicleAddedActivatedToast'))
    },
    onError: () => toast.error(t('carAddError')),
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = t('nameRequired')
    
    const vinClean = form.vin.trim().toUpperCase()
    if (vinClean && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vinClean)) {
      newErrors.vin = t('vinLength')
    }

    const yearNum = toNumber(form.year)
    if (form.year && (yearNum < 1980 || yearNum > new Date().getFullYear())) {
      newErrors.year = t('yearRange', { year: new Date().getFullYear() })
    }

    const currentKm = toNumber(form.currentMileage)
    const lastKm = toNumber(form.lastOilChangeMileage)
    const intervalKm = toNumber(form.oilChangeIntervalKm)

    if (form.currentMileage && currentKm < 0) newErrors.currentMileage = t('mustBePositive')
    if (form.lastOilChangeMileage && lastKm < 0) newErrors.lastOilChangeMileage = t('mustBePositive')
    if (form.oilChangeIntervalKm && intervalKm <= 0) newErrors.oilChangeIntervalKm = t('mustBeGreaterThanZero')

    if (form.currentMileage && form.lastOilChangeMileage && currentKm < lastKm) {
      newErrors.currentMileage = t('currentGteLast')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateForm()) {
      toast.error(t('fixFormErrors'))
      return
    }

    const payload = buildPayload(form)
    createMutation.mutate(payload)
  }

  return (
    <div className="space-y-7">
      {/* Hero Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#D4A76A]" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('privateGarage')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#16254c] tracking-tight mt-1">
            {t('myCars')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {t('myCarsSubtitle')}
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#16254c] px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#16254c]/15 transition-all hover:bg-[#1f3469] hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 text-[#D4A76A]">
              <Plus size={14} strokeWidth={3} />
            </div>
            <span>{t('addCar')}</span>
          </button>
        )}
      </div>

      {/* Auto-compatibility Explanation Banner (Matches Image 2) */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#070e1e] p-6 sm:p-7 text-white shadow-xl shadow-slate-950/20">
        {/* Background Image: bluebg with blueprint car */}
        <div 
          className="absolute inset-0 bg-cover bg-right bg-no-repeat opacity-90 pointer-events-none"
          style={{ backgroundImage: "url('/bluebg.png')" }}
        />
        {/* Smooth vignette gradient on the left to guarantee optimal text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070e1e] via-[#070e1e]/85 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                {t('compatAutomated')}
              </span>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 backdrop-blur-sm">
                {t('verified100')}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-2">
              {t('smartFilteringTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300/90 mt-1.5 leading-relaxed">
              {t('smartFilteringDesc')}
            </p>
          </div>
          
          <Link
            href="/catalogue"
            className="group inline-flex items-center gap-2.5 self-start sm:self-center rounded-xl bg-[#131e35]/85 hover:bg-[#1b2b4b] border border-white/15 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all backdrop-blur-md shadow-lg shadow-black/25 whitespace-nowrap"
          >
            <span>{t('exploreCatalog')}</span>
            <ArrowRight size={15} className="text-white/80 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Add Car Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-lg shadow-slate-900/5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#16254c]/10 text-[#16254c]">
                <Car size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#16254c]">{t('newCar')}</h2>
                <p className="text-xs text-slate-500">{t('newCarHint')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('carName')} <span className="text-rose-500">*</span>
              </span>
              <input
                value={form.name}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                }}
                placeholder={t('carNamePlaceholder')}
                className={`w-full rounded-2xl border bg-slate-50/60 px-4 py-3 text-sm font-semibold outline-none transition-all focus:bg-white focus:ring-2 ${errors.name ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:border-[#16254c] focus:ring-[#16254c]/10'}`}
              />
              {errors.name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.name}</p>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('vinLabel')}
              </span>
              <input
                value={form.vin}
                maxLength={17}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, vin: e.target.value.toUpperCase() }))
                  if (errors.vin) setErrors(prev => ({ ...prev, vin: '' }))
                }}
                placeholder={t('vinPlaceholder')}
                className={`w-full rounded-2xl border bg-slate-50/60 px-4 py-3 text-sm font-mono uppercase outline-none transition-all focus:bg-white focus:ring-2 ${errors.vin ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:border-[#16254c] focus:ring-[#16254c]/10'}`}
              />
              {errors.vin && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.vin}</p>}
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">{t('makeLabel')}</span>
              <select
                value={form.make}
                onChange={(e) => {
                  const makeSlug = e.target.value
                  const selectedObj = makes.find((m: any) => m.slug === makeSlug)
                  setForm((prev) => ({
                    ...prev,
                    make: makeSlug,
                    makeName: selectedObj ? selectedObj.name : '',
                    model: '',
                    modelName: '',
                  }))
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
              >
                <option value="">{t('selectMake')}</option>
                {makes.map((m: any) => (
                  <option key={m.id || m.slug} value={m.slug}>
                    {m.name}
                  </option>
                ))}
                <option value="Autre">{t('other')}</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">{t('modelLabel')}</span>
              <select
                value={form.model}
                disabled={!form.make || form.make === 'Autre'}
                onChange={(e) => {
                  const modelSlug = e.target.value
                  const selectedObj = models.find((m: any) => m.slug === modelSlug)
                  setForm((prev) => ({
                    ...prev,
                    model: modelSlug,
                    modelName: selectedObj ? selectedObj.name : '',
                  }))
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10 disabled:opacity-50"
              >
                <option value="">{t('selectModel')}</option>
                {models.map((m: any) => (
                  <option key={m.id || m.slug} value={m.slug}>
                    {m.name}
                  </option>
                ))}
                <option value="Autre">{t('otherModel')}</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">{t('engineLabel')}</span>
              <input
                value={form.engine}
                onChange={(e) => setForm((prev) => ({ ...prev, engine: e.target.value }))}
                placeholder={t('enginePlaceholder')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">{t('currentMileageLabel')}</span>
              <input
                type="number"
                min="0"
                value={form.currentMileage}
                onChange={(e) => setForm((prev) => ({ ...prev, currentMileage: e.target.value }))}
                placeholder={t('currentMileagePlaceholder')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-mono font-semibold outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">{t('lastOilMileageLabel')}</span>
              <input
                type="number"
                min="0"
                value={form.lastOilChangeMileage}
                onChange={(e) => setForm((prev) => ({ ...prev, lastOilChangeMileage: e.target.value }))}
                placeholder={t('lastOilMileagePlaceholder')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-mono font-semibold outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">{t('oilIntervalLabel')}</span>
              <input
                type="number"
                min="1000"
                step="500"
                value={form.oilChangeIntervalKm}
                onChange={(e) => setForm((prev) => ({ ...prev, oilChangeIntervalKm: e.target.value }))}
                placeholder={t('oilIntervalPlaceholder')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-mono font-semibold outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#16254c] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#16254c]/15 transition-all hover:bg-[#1f3469] disabled:opacity-50"
            >
              {createMutation.isPending && <Loader2 size={15} className="animate-spin text-[#D4A76A]" />}
              <span>{t('saveVehicle')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Car List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-100 bg-slate-50/50">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#16254c]" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('loadingGarage')}</p>
            </div>
          </div>
        ) : cars.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 shadow-inner">
              <Car size={32} />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">{t('noCars')}</h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {t('noCarsDesc')}
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#16254c] px-5 py-3 text-xs font-bold text-white shadow-md shadow-[#16254c]/10 hover:bg-[#1f3469] transition-all"
            >
              <Plus size={15} />
              <span>{t('addFirstCar')}</span>
            </button>
          </div>
        ) : (
          cars.map((car) => <CarCard key={car.id} car={car} />)
        )}
      </div>
    </div>
  )
}
