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
  Trash2,
  Wrench,
} from 'lucide-react'
import { toast } from 'sonner'
import { productsApi } from '@/lib/api/products'
import { carsApi, type CarPayload } from '@/lib/api/cars'
import type { UserCar } from '@/lib/types'

type CarForm = {
  name: string
  // slug from DB (used for catalogue URL filter)
  make: string        // makeSlug
  model: string       // modelSlug
  // display names from DB (used for compatibility matching)
  makeName: string
  modelName: string
  // custom free-text fallback
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
  return value.toLocaleString('fr-TN')
}

function getReminder(car: UserCar) {
  const nextMileage = car.lastOilChangeMileage + car.oilChangeIntervalKm
  const remainingKm = nextMileage - car.currentMileage

  if (remainingKm <= 0) {
    return {
      tone: 'danger',
      icon: AlertTriangle,
      title: 'Vidange a faire maintenant',
      text: `Depassee de ${formatKm(Math.abs(remainingKm))} km`,
      barClass: 'bg-red-500',
      badgeClass: 'bg-red-50 text-red-700',
    }
  }

  if (remainingKm <= 1000) {
    return {
      tone: 'warning',
      icon: AlertTriangle,
      title: `Vidange dans ${formatKm(remainingKm)} km`,
      text: `Prochaine vidange a ${formatKm(nextMileage)} km`,
      barClass: 'bg-amber-500',
      badgeClass: 'bg-amber-50 text-amber-700',
    }
  }

  return {
    tone: 'ok',
    icon: CheckCircle2,
    title: `Vidange dans ${formatKm(remainingKm)} km`,
    text: `Prochaine vidange a ${formatKm(nextMileage)} km`,
    barClass: 'bg-green-500',
    badgeClass: 'bg-green-50 text-green-700',
  }
}

function buildPayload(form: CarForm): CarPayload {
  // If custom make/model entered, use that as both name and slug (no DB slug available)
  const isMakeCustom = form.make === 'Autre'
  const isModelCustom = form.model === 'Autre'

  const finalMakeName = isMakeCustom ? form.customMake?.trim() : form.makeName || undefined
  const finalMakeSlug = isMakeCustom ? undefined : (form.make?.trim() || undefined)
  const finalModelName = isModelCustom ? form.customModel?.trim() : form.modelName || undefined
  const finalModelSlug = isModelCustom ? undefined : (form.model?.trim() || undefined)

  return {
    name: form.name.trim(),
    make: finalMakeName,
    makeSlug: finalMakeSlug,
    model: finalModelName,
    modelSlug: finalModelSlug,
    year: form.year ? toNumber(form.year) : undefined,
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

function ServiceCheckbox({
  id,
  checked,
  label,
  onChange,
  disabled,
}: {
  id: string
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/30"
      />
      {label}
    </label>
  )
}

function CarCard({ car }: { car: UserCar }) {
  const queryClient = useQueryClient()
  const reminder = getReminder(car)
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
      toast.success('Voiture mise a jour')
    },
    onError: () => toast.error('Erreur lors de la mise a jour'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => carsApi.delete(car.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-cars'] })
      toast.success('Voiture supprimee')
    },
    onError: () => toast.error('Erreur lors de la suppression'),
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
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-50 bg-gray-50 p-4 sm:flex-row sm:items-start">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-primary shadow-sm">
          <Car size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-brand-primary">{car.name}</h2>
            {car.trim && (
              <span className="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-gray-500">
                {car.trim}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            {[car.make, car.model, car.year, car.engine, car.fuel, car.power ? `${car.power} ch` : null, car.transmission].filter(Boolean).join(' · ') || 'Voiture client'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="self-start rounded-xl p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          aria-label="Supprimer la voiture"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-5 p-4">
        <div className={`rounded-2xl px-4 py-3 ${reminder.badgeClass}`}>
          <div className="flex items-center gap-3">
            <ReminderIcon size={20} />
            <div>
              <p className="text-sm font-bold">{reminder.title}</p>
              <p className="text-xs opacity-80">{reminder.text}</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
            <div className={`h-full rounded-full ${reminder.barClass}`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
              <Gauge size={14} /> Km actuel
            </span>
            <input
              type="number"
              min="0"
              value={currentMileage}
              onChange={(e) => setCurrentMileage(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
              <Wrench size={14} /> Derniere vidange
            </span>
            <input
              type="number"
              min="0"
              value={lastOilChangeMileage}
              onChange={(e) => setLastOilChangeMileage(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
              <Calendar size={14} /> Intervalle
            </span>
            <input
              type="number"
              min="1000"
              step="500"
              value={intervalKm}
              onChange={(e) => setIntervalKm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
            />
          </label>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-700">Entretien realise maintenant</legend>
          <p className="text-xs text-gray-500">
            Cochez les travaux effectues, puis enregistrez. La vidange redemarre le compteur a votre km actuel.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ServiceCheckbox
            id={`oil-change-${car.id}`}
            checked={oilChangeDoneNow}
            disabled={updateMutation.isPending}
            label="Vidange effectuee"
            onChange={setOilChangeDoneNow}
          />
          <ServiceCheckbox
            id={`oil-filter-${car.id}`}
            checked={oilFilterChanged}
            disabled={updateMutation.isPending}
            label="Filtre a huile change"
            onChange={setOilFilterChanged}
          />
          <ServiceCheckbox
            id={`air-filter-${car.id}`}
            checked={airFilterChanged}
            disabled={updateMutation.isPending}
            label="Filtre a air change"
            onChange={setAirFilterChanged}
          />
          <ServiceCheckbox
            id={`cabin-filter-${car.id}`}
            checked={cabinFilterChanged}
            disabled={updateMutation.isPending}
            label="Filtre habitacle change"
            onChange={setCabinFilterChanged}
          />
          </div>
        </fieldset>

        <button
          type="button"
          onClick={saveMaintenance}
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-light disabled:opacity-60"
        >
          <Save size={16} />
          {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer l entretien'}
        </button>
      </div>
    </div>
  )
}

export default function MesVoituresPage() {
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

  const cars = useMemo(() => data ?? [], [data])

  const createMutation = useMutation({
    mutationFn: (payload: CarPayload) => carsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-cars'] })
      setForm(EMPTY_FORM)
      setErrors({})
      setShowForm(false)
      toast.success('Voiture ajoutee')
    },
    onError: () => toast.error('Erreur lors de l ajout'),
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Le nom est requis'
    
    const vinClean = form.vin.trim().toUpperCase()
    if (vinClean && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vinClean)) {
      newErrors.vin = 'Le VIN doit contenir exactement 17 caractères'
    }

    const yearNum = toNumber(form.year)
    if (form.year && (yearNum < 1980 || yearNum > new Date().getFullYear())) {
      newErrors.year = `Annee entre 1980 et ${new Date().getFullYear()}`
    }

    if (form.displacement && (toNumber(form.displacement) < 0.5 || toNumber(form.displacement) > 10)) {
      newErrors.displacement = 'Cylindree entre 0.5 et 10 L'
    }

    if (form.cylinders && (toNumber(form.cylinders) < 2 || toNumber(form.cylinders) > 16)) {
      newErrors.cylinders = 'Entre 2 et 16 cylindres'
    }

    if (form.power && (toNumber(form.power) < 20 || toNumber(form.power) > 2000)) {
      newErrors.power = 'Puissance entre 20 et 2000 ch'
    }

    const currentKm = toNumber(form.currentMileage)
    const lastKm = toNumber(form.lastOilChangeMileage)
    const intervalKm = toNumber(form.oilChangeIntervalKm)

    if (form.currentMileage && currentKm < 0) newErrors.currentMileage = 'Doit etre positif'
    if (form.lastOilChangeMileage && lastKm < 0) newErrors.lastOilChangeMileage = 'Doit etre positif'
    if (form.oilChangeIntervalKm && intervalKm <= 0) newErrors.oilChangeIntervalKm = 'Doit etre > 0'

    if (form.currentMileage && form.lastOilChangeMileage && currentKm < lastKm) {
      newErrors.currentMileage = 'Km actuel doit etre >= derniere vidange'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire')
      return
    }

    const payload = buildPayload(form)
    createMutation.mutate(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Mes voitures</h1>
          <p className="text-sm text-gray-500">
            Suivez la vidange et les filtres de chaque voiture.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-light"
          >
            <Plus size={16} />
            Ajouter une voiture
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Car size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-primary">Nouvelle voiture</h2>
              <p className="text-xs text-gray-500">Les km servent a calculer la prochaine vidange.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Nom de la voiture <span className="text-red-500">*</span></span>
              <input
                value={form.name}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                }}
                placeholder="Ex: Ma Clio"
                className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:bg-white ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-primary'}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">VIN / Numéro de châssis</span>
              <input
                value={form.vin}
                maxLength={17}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, vin: e.target.value.toUpperCase() }))
                  if (errors.vin) setErrors(prev => ({ ...prev, vin: '' }))
                }}
                placeholder="17 caractères (ex: VF1RFA004...)"
                className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm font-mono uppercase outline-none transition-colors focus:bg-white ${errors.vin ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-primary'}`}
              />
              {errors.vin && <p className="mt-1 text-xs text-red-500">{errors.vin}</p>}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Marque</span>
              <select
                value={form.make}
                onChange={(e) => {
                  const slug = e.target.value
                  const selectedMake = makes.find((m: any) => m.slug === slug)
                  setForm((prev) => ({ 
                    ...prev, 
                    make: slug, 
                    makeName: selectedMake?.name || '',
                    model: '', 
                    modelName: '',
                  }))
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
              >
                <option value="">Sélectionner une marque</option>
                {makes.map((make: any) => (
                  <option key={make.slug} value={make.slug}>{make.name}</option>
                ))}
                <option value="Autre">Autre...</option>
              </select>
              {form.make === 'Autre' && (
                <input
                  value={form.customMake || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, customMake: e.target.value }))}
                  placeholder="Saisissez la marque"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
                />
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Modèle</span>
              {form.make === 'Autre' ? (
                <input
                  value={form.customModel || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, customModel: e.target.value }))}
                  placeholder="Saisissez le modèle"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
                />
              ) : (
                <select
                  value={form.model}
                  onChange={(e) => {
                    const slug = e.target.value
                    const selectedModel = models.find((m: any) => m.slug === slug)
                    setForm((prev) => ({ 
                      ...prev, 
                      model: slug, 
                      modelName: selectedModel?.name || '',
                    }))
                  }}
                  disabled={!form.make}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white disabled:opacity-50"
                >
                  <option value="">Sélectionner un modèle</option>
                  {models.map((model: any) => (
                    <option key={model.slug} value={model.slug}>{model.name}</option>
                  ))}
                  <option value="Autre">Autre...</option>
                </select>
              )}
              {form.model === 'Autre' && form.make !== 'Autre' && (
                <input
                  value={form.customModel || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, customModel: e.target.value }))}
                  placeholder="Saisissez le modèle"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
                />
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Année</span>
              <input
                type="number"
                min="1980"
                max={new Date().getFullYear()}
                value={form.year}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, year: e.target.value }))
                  if (errors.year) setErrors(prev => ({ ...prev, year: '' }))
                }}
                placeholder={String(new Date().getFullYear())}
                className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:bg-white ${errors.year ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-primary'}`}
              />
              {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year}</p>}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Motorisation / Engine</span>
              <input
                value={form.engine}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, engine: e.target.value }))
                }}
                placeholder="Ex: 1.5 dCi 90"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Cylindrée (L)</span>
              <input
                type="number"
                min="0.5"
                max="10"
                step="0.1"
                value={form.displacement}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, displacement: e.target.value }))
                  if (errors.displacement) setErrors(prev => ({ ...prev, displacement: '' }))
                }}
                placeholder="1.6"
                className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:bg-white ${errors.displacement ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-primary'}`}
              />
              {errors.displacement && <p className="mt-1 text-xs text-red-500">{errors.displacement}</p>}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Nombre de cylindres</span>
              <select
                value={form.cylinders}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, cylinders: e.target.value }))
                  if (errors.cylinders) setErrors(prev => ({ ...prev, cylinders: '' }))
                }}
                className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:bg-white ${errors.cylinders ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-primary'}`}
              >
                <option value="">Sélectionner</option>
                <option value="3">3 cylindres</option>
                <option value="4">4 cylindres</option>
                <option value="5">5 cylindres</option>
                <option value="6">6 cylindres</option>
                <option value="8">8 cylindres</option>
                <option value="12">12 cylindres</option>
              </select>
              {errors.cylinders && <p className="mt-1 text-xs text-red-500">{errors.cylinders}</p>}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Carburant</span>
              <select
                value={form.fuel}
                onChange={(e) => setForm((prev) => ({ ...prev, fuel: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
              >
                <option value="">Sélectionner</option>
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="hybride">Hybride</option>
                <option value="electrique">Électrique</option>
                <option value="gpl">GPL</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Puissance (ch)</span>
              <input
                type="number"
                min="20"
                max="2000"
                value={form.power}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, power: e.target.value }))
                  if (errors.power) setErrors(prev => ({ ...prev, power: '' }))
                }}
                placeholder="90"
                className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:bg-white ${errors.power ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-primary'}`}
              />
              {errors.power && <p className="mt-1 text-xs text-red-500">{errors.power}</p>}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Boîte de vitesse</span>
              <select
                value={form.transmission}
                onChange={(e) => setForm((prev) => ({ ...prev, transmission: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
              >
                <option value="">Sélectionner</option>
                <option value="manuelle">Manuelle</option>
                <option value="automatique">Automatique</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Version / Finition</span>
              <input
                value={form.trim}
                onChange={(e) => setForm((prev) => ({ ...prev, trim: e.target.value }))}
                placeholder="Ex: Zen, GT-Line, Sport"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Date de production</span>
              <input
                type="month"
                value={form.productionDate}
                onChange={(e) => setForm((prev) => ({ ...prev, productionDate: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:bg-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Km actuel</span>
              <input
                type="number"
                min="0"
                value={form.currentMileage}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, currentMileage: e.target.value }))
                  if (errors.currentMileage) setErrors(prev => ({ ...prev, currentMileage: '' }))
                }}
                placeholder="85000"
                className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:bg-white ${errors.currentMileage ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-primary'}`}
              />
              {errors.currentMileage && <p className="mt-1 text-xs text-red-500">{errors.currentMileage}</p>}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Km dernière vidange</span>
              <input
                type="number"
                min="0"
                value={form.lastOilChangeMileage}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, lastOilChangeMileage: e.target.value }))
                  if (errors.lastOilChangeMileage) setErrors(prev => ({ ...prev, lastOilChangeMileage: '' }))
                }}
                placeholder="76000"
                className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:bg-white ${errors.lastOilChangeMileage ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-primary'}`}
              />
              {errors.lastOilChangeMileage && <p className="mt-1 text-xs text-red-500">{errors.lastOilChangeMileage}</p>}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Vidange chaque (km)</span>
              <input
                type="number"
                min="1000"
                step="500"
                value={form.oilChangeIntervalKm}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, oilChangeIntervalKm: e.target.value }))
                  if (errors.oilChangeIntervalKm) setErrors(prev => ({ ...prev, oilChangeIntervalKm: '' }))
                }}
                className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none transition-colors focus:bg-white ${errors.oilChangeIntervalKm ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-primary'}`}
              />
              {errors.oilChangeIntervalKm && <p className="mt-1 text-xs text-red-500">{errors.oilChangeIntervalKm}</p>}
            </label>
          </div>

          {form.lastOilChangeMileage && form.oilChangeIntervalKm && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-900">Prochaine vidange prévue :</p>
                  <p className="text-2xl font-black text-brand-primary">
                    {formatKm(toNumber(form.lastOilChangeMileage) + toNumber(form.oilChangeIntervalKm))} km
                  </p>
                </div>
                {toNumber(form.currentMileage) >= (toNumber(form.lastOilChangeMileage) + toNumber(form.oilChangeIntervalKm)) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    🔴 Vidange en retard
                  </span>
                )}
              </div>
            </div>
          )}

          <fieldset className="mt-6">
            <legend className="mb-3 text-sm font-semibold text-gray-700">Pièces changées à la dernière vidange</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ServiceCheckbox
                id="new-oil-filter"
                checked={form.oilFilterChanged}
                label="Filtre à huile"
                onChange={(checked) => setForm((prev) => ({ ...prev, oilFilterChanged: checked }))}
              />
              <ServiceCheckbox
                id="new-air-filter"
                checked={form.airFilterChanged}
                label="Filtre à air"
                onChange={(checked) => setForm((prev) => ({ ...prev, airFilterChanged: checked }))}
              />
              <ServiceCheckbox
                id="new-cabin-filter"
                checked={form.cabinFilterChanged}
                label="Filtre habitacle"
                onChange={(checked) => setForm((prev) => ({ ...prev, cabinFilterChanged: checked }))}
              />
            </div>
          </fieldset>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setForm(EMPTY_FORM)
                setErrors({})
              }}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-light disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-14 text-center">
          <Car size={44} className="mx-auto mb-3 text-gray-200" />
          <h3 className="font-semibold text-gray-400">Aucune voiture ajoutee</h3>
          <p className="mt-1 text-sm text-gray-300">
            Ajoutez votre premiere voiture pour savoir quand faire la vidange.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  )
}
