'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Search, Car, ChevronRight, Check,
  AlertCircle, Loader2, SlidersHorizontal, X
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { productsApi } from '@/lib/api/products'
import type { VehicleMake, VehicleModel, VehicleEngine } from '@/lib/types'


interface VehicleFinderProps {
  onClose?: () => void
  initialVehicleType?: string | null
}

const STEP_LABELS = ['Marque', 'Modèle', 'Motorisation']

// Slug → local path for downloaded logos.
// If a brand is not in this map, the first-letter fallback is shown.
const LOGO_PATHS: Record<string, string> = {
  'abarth': '/img/car-brands/abarth.png',
  'alfa-romeo': '/img/car-brands/alfa-romeo.png',
  'aston-martin': '/img/car-brands/aston-martin.png',
  'audi': '/img/car-brands/audi.png',
  'bentley': '/img/car-brands/bentley.png',
  'bmw': '/img/car-brands/bmw.png',
  'bugatti': '/img/car-brands/bugatti.png',
  'byd': '/img/car-brands/byd.png',
  'cadillac': '/img/car-brands/cadillac.png',
  'chery': '/img/car-brands/chery.png',
  'chevrolet': '/img/car-brands/chevrolet.png',
  'chrysler': '/img/car-brands/chrysler.png',
  'citroen': '/img/car-brands/citroen.png',
  'dacia': '/img/car-brands/dacia.png',
  'dodge': '/img/car-brands/dodge.png',
  'ferrari': '/img/car-brands/ferrari.png',
  'fiat': '/img/car-brands/fiat.png',
  'ford': '/img/car-brands/ford.png',
  'geely': '/img/car-brands/geely.png',
  'genesis': '/img/car-brands/genesis.png',
  'gmc': '/img/car-brands/gmc.png',
  'haval': '/img/car-brands/haval.png',
  'honda': '/img/car-brands/honda.png',
  'hyundai': '/img/car-brands/hyundai.png',
  'infiniti': '/img/car-brands/infiniti.png',
  'isuzu': '/img/car-brands/isuzu.png',
  'iveco': '/img/car-brands/iveco.png',
  'jaguar': '/img/car-brands/jaguar.png',
  'jeep': '/img/car-brands/jeep.png',
  'kia': '/img/car-brands/kia.png',
  'lada': '/img/car-brands/lada.png',
  'lamborghini': '/img/car-brands/lamborghini.png',
  'lancia': '/img/car-brands/lancia.png',
  'land-rover': '/img/car-brands/land-rover.png',
  'lexus': '/img/car-brands/lexus.png',
  'lincoln': '/img/car-brands/lincoln.png',
  'mahindra': '/img/car-brands/mahindra.png',
  'maserati': '/img/car-brands/maserati.png',
  'mazda': '/img/car-brands/mazda.png',
  'mclaren': '/img/car-brands/mclaren.png',
  'mercedes-benz': '/img/car-brands/mercedes-benz.png',
  'mercedes-benz-vans': '/img/car-brands/mercedes-benz-vans.png',
  'mg': '/img/car-brands/mg.png',
  'mini': '/img/car-brands/mini.png',
  'mitsubishi': '/img/car-brands/mitsubishi.png',
  'nissan': '/img/car-brands/nissan.png',
  'opel': '/img/car-brands/opel.png',
  'peugeot': '/img/car-brands/peugeot.png',
  'polestar': '/img/car-brands/polestar.png',
  'porsche': '/img/car-brands/porsche.png',
  'ram': '/img/car-brands/ram.png',
  'renault': '/img/car-brands/renault.png',
  'renault-commercial': '/img/car-brands/renault-commercial.png',
  'rolls-royce': '/img/car-brands/rolls-royce.png',
  'seat': '/img/car-brands/seat.png',
  'skoda': '/img/car-brands/skoda.png',
  'smart': '/img/car-brands/smart.png',
  'ssangyong': '/img/car-brands/ssangyong.png',
  'subaru': '/img/car-brands/subaru.png',
  'suzuki': '/img/car-brands/suzuki.png',
  'tata': '/img/car-brands/tata.png',
  'tesla': '/img/car-brands/tesla.png',
  'toyota': '/img/car-brands/toyota.png',
  'vauxhall': '/img/car-brands/vauxhall.png',
  'volkswagen': '/img/car-brands/volkswagen.png',
  'volvo': '/img/car-brands/volvo.png',
  'wiesmann': '/img/car-brands/wiesmann.png',
}

function BrandLogo({ make: { slug, name } }: { make: { slug: string; name: string } }) {
  const [loaded, setLoaded] = useState(false)
  const localPath = LOGO_PATHS[slug]

  if (!localPath) {
    return <span className="text-xl font-bold text-gray-600">{name.charAt(0).toUpperCase()}</span>
  }

  return (
    <>
      {!loaded && (
        <span className="text-xl font-bold text-gray-600">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <img
        src={localPath}
        alt={name}
        className={`h-8 w-8 object-contain opacity-90 ${loaded ? '' : 'hidden'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      />
    </>
  )
}

export function VehicleFinder({ onClose, initialVehicleType }: VehicleFinderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'

  const [step, setStep] = useState(1)

  const [makes, setMakes] = useState<VehicleMake[]>([])
  const [models, setModels] = useState<VehicleModel[]>([])
  const [engines, setEngines] = useState<VehicleEngine[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [makeSearch, setMakeSearch] = useState('')

  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null)
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null)
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    productsApi.getMakes(initialVehicleType ?? undefined)
      .then(setMakes)
      .catch(() => setError('Impossible de charger les marques'))
      .finally(() => setLoading(false))
  }, [initialVehicleType])

  const filteredMakes = useMemo(
    () => makes.filter(m => m.name.toLowerCase().includes(makeSearch.toLowerCase())),
    [makes, makeSearch]
  )

  const loadModels = (make: VehicleMake) => {
    setLoading(true)
    setError('')
    setModels([])
    productsApi.getModels(make.slug)
      .then(setModels)
      .catch(() => setError('Impossible de charger les modèles'))
      .finally(() => setLoading(false))
  }

  const loadEngines = (model: VehicleModel) => {
    setLoading(true)
    setError('')
    setEngines([])
    productsApi.getEngines(model.slug)
      .then(setEngines)
      .catch(() => setError('Impossible de charger les motorisations'))
      .finally(() => setLoading(false))
  }

  const navigateToStep = (newStep: number) => {
    setStep(newStep)
  }

  const selectMake = (make: VehicleMake) => {
    setSelectedMake(make)
    setSelectedModel(null)
    setSelectedEngine(null)
    setMakeSearch('')
    loadModels(make)
    navigateToStep(2)
  }

  const selectModel = (model: VehicleModel) => {
    setSelectedModel(model)
    setSelectedEngine(null)
    loadEngines(model)
    navigateToStep(3)
  }

  const resetTo = (targetStep: number) => {
    if (targetStep >= step) return
    navigateToStep(targetStep)
    if (targetStep <= 1) {
      setSelectedMake(null)
      setSelectedModel(null)
      setSelectedEngine(null)
      setMakeSearch('')
    }
    if (targetStep <= 2) {
      setSelectedModel(null)
      setSelectedEngine(null)
    }
  }

  const handleSearch = () => {
    if (!selectedMake || !selectedModel) return
    const params = new URLSearchParams()
    params.set('make', selectedMake.slug)
    params.set('model', selectedModel.slug)
    if (selectedEngine) params.set('engine', selectedEngine)
    if (onClose) onClose()
    router.push(`/${locale}/catalogue?${params.toString()}`)
  }

  const renderSearchButton = (disabled = false) => (
    <button
      onClick={handleSearch}
      disabled={disabled}
      className={`
        flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200
        ${!disabled ? 'bg-[#E10600] text-gray-900 hover:bg-[#c80500]' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}
      `}
    >
      <Search size={16} />
      <span>Voir les huiles compatibles</span>
    </button>
  )

  return (
    <div
      className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white"
      style={{ border: '1px solid rgba(0,0,0,0.1)' }}
    >
      {/* Step indicator */}
      <div className="px-6 pt-4 md:px-8">
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Étape {step} sur 3
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full bg-brand-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recherche par véhicule
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Marque → Modèle → Motorisation
            </p>
          </div>

          {/* Step indicator dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {STEP_LABELS.map((label, i) => {
              const s = i + 1
              const isCompleted = s < step
              const isActive = s === step
              return (
                <div key={label} className="flex items-center gap-1.5">
                  <button
                    onClick={() => s < step && resetTo(s)}
                    className={`
                      flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors
                      ${isCompleted ? 'bg-brand-primary/10 text-brand-primary cursor-pointer hover:bg-brand-primary/20' : ''}
                      ${isActive ? 'bg-gray-100 text-gray-900' : ''}
                      ${!isCompleted && !isActive ? 'text-gray-400' : ''}
                    `}
                    disabled={!isCompleted}
                  >
                    {isCompleted ? <Check size={11} strokeWidth={3} /> : null}
                    {label}
                  </button>
                  {i < STEP_LABELS.length - 1 && <ChevronRight size={12} className="text-gray-300" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content — all 3 steps visible at once, future steps disabled */}
      <div className="flex flex-col p-6 md:p-8">
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-500/20">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ═══════════════ STEP 1: MAKE ═══════════════ */}
        <div className={`transition-all duration-300 ${step >= 1 ? 'opacity-100 max-h-[500px]' : 'opacity-40 max-h-[80px] overflow-hidden pointer-events-none'}`}>
          <div className="mb-3 flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step > 1 ? 'bg-green-500 text-white' : step === 1 ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > 1 ? <Check size={14} strokeWidth={3} /> : 1}
            </div>
            <span className="text-sm font-bold text-gray-700">Marque</span>
            {step > 1 && <Check size={14} className="text-green-500" strokeWidth={3} />}
            {step < 1 && <span className="text-xs text-gray-400">— Complétez d'abord cette étape</span>}
          </div>
          {step >= 1 && (
            <div className="ml-9 mb-6">
              <div className="relative mb-4">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={makeSearch}
                  onChange={e => setMakeSearch(e.target.value)}
                  placeholder="Rechercher une marque..."
                  className="w-full rounded-xl bg-gray-50 py-3 pl-11 pr-10 text-sm text-gray-900 placeholder-neutral-600 outline-none ring-1 ring-gray-200 transition-all focus:ring-brand-primary/30"
                />
                {makeSearch && (
                  <button
                    onClick={() => setMakeSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {loading && makes.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-brand-primary" />
                </div>
              ) : filteredMakes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                  <Search size={32} className="mb-3 opacity-50" />
                  <p className="text-sm">Aucune marque trouvée pour &ldquo;{makeSearch}&rdquo;</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredMakes.map((make) => {
                    const isSelected = selectedMake?.id === make.id
                    return (
                      <button
                        key={make.id}
                        onClick={() => selectMake(make)}
                        className={`
                          relative flex flex-col items-center gap-3 rounded-xl p-4 transition-all duration-200
                          ${isSelected
                            ? 'bg-brand-primary/5 ring-1 ring-brand-primary/20'
                            : 'bg-white ring-1 ring-gray-200 hover:bg-gray-100 hover:ring-gray-300'
                          }
                        `}
                      >
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${isSelected ? 'bg-gray-50' : 'bg-transparent'}`}>
                          <BrandLogo make={make} />
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                          {make.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-9 mb-6 border-t border-gray-100" />

        {/* ═══════════════ STEP 2: MODEL ═══════════════ */}
        <div className={`transition-all duration-300 ${step >= 2 ? 'opacity-100 max-h-[500px]' : 'opacity-40 max-h-[80px] overflow-hidden pointer-events-none'}`}>
          <div className="mb-3 flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step > 2 ? 'bg-green-500 text-white' : step === 2 ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > 2 ? <Check size={14} strokeWidth={3} /> : 2}
            </div>
            <span className="text-sm font-bold text-gray-700">Modèle</span>
            {selectedMake && step >= 2 && <span className="text-xs text-gray-400">— {selectedMake.name}</span>}
            {step < 2 && <span className="text-xs text-gray-400">— Sélectionnez d'abord une marque</span>}
          </div>
          {step >= 2 && (
            <div className="ml-9 mb-6">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-brand-primary" />
                </div>
              ) : models.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                  <Car size={32} className="mb-3 opacity-50" />
                  <p className="text-sm">Aucun modèle trouvé pour {selectedMake?.name}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                  {models.map((model) => {
                    const isSelected = selectedModel?.id === model.id
                    const vehicleTypeLabel =
                      model.vehicleType === 'poids_lourd' ? 'PL' :
                      model.vehicleType === 'agricole' ? 'AG' :
                      model.vehicleType === 'moto' ? 'MO' : 'VL'
                    return (
                      <button
                        key={model.id}
                        onClick={() => selectModel(model)}
                        className={`
                          relative flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-200
                          ${isSelected
                            ? 'bg-brand-primary/5 ring-1 ring-brand-primary/20'
                            : 'bg-white ring-1 ring-gray-200 hover:bg-gray-100 hover:ring-gray-300'
                          }
                        `}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors ${isSelected ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-50 text-gray-500'}`}>
                          {model.name.replace(/\(.*\)/, '').trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-medium truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                            {model.name}
                          </div>
                          <div className="mt-1">
                            <span className="inline-flex items-center rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                              {vehicleTypeLabel}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className={isSelected ? 'text-gray-900' : 'text-gray-400'} />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-9 mb-6 border-t border-gray-100" />

        {/* ═══════════════ STEP 3: ENGINE ═══════════════ */}
        <div className={`transition-all duration-300 ${step >= 3 ? 'opacity-100 max-h-[500px]' : 'opacity-40 max-h-[80px] overflow-hidden pointer-events-none'}`}>
          <div className="mb-3 flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step > 3 ? 'bg-green-500 text-white' : step === 3 ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
              3
            </div>
            <span className="text-sm font-bold text-gray-700">Motorisation</span>
            {selectedModel && step >= 3 && <span className="text-xs text-gray-400">— {selectedMake?.name} {selectedModel?.name}</span>}
            {step < 3 && <span className="text-xs text-gray-400">— Sélectionnez d'abord un modèle</span>}
          </div>
          {step >= 3 && (
            <div className="ml-9 mb-6">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-brand-primary" />
                </div>
              ) : engines.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center">
                  <SlidersHorizontal size={32} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aucune motorisation référencée</p>
                    <p className="mt-1 text-xs text-gray-500">Vous pouvez lancer la recherche sans préciser la motorisation.</p>
                  </div>
                  {renderSearchButton()}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                    {engines.map((eng) => {
                      const isSelected = selectedEngine === eng.engineCode
                      const yearLabel = eng.yearFrom || eng.yearTo ? `${eng.yearFrom || '…'}–${eng.yearTo || '…'}` : null
                      return (
                        <button
                          key={eng.engineCode}
                          onClick={() => setSelectedEngine(eng.engineCode)}
                          className={`
                            relative flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-200
                            ${isSelected
                              ? 'bg-brand-primary/5 ring-1 ring-brand-primary/20'
                              : 'bg-white ring-1 ring-gray-200 hover:bg-gray-100 hover:ring-gray-300'
                            }
                          `}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold transition-colors ${isSelected ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-50 text-gray-500'}`}>
                            {eng.engineCode.length > 4 ? eng.engineCode.substring(0, 2).toUpperCase() : eng.engineCode.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-medium truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                              {eng.engineCode}
                            </div>
                            {yearLabel && (
                              <div className="mt-1">
                                <span className="inline-flex items-center rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">{yearLabel}</span>
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-6 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
                    {selectedModel && (
                      <button onClick={handleSearch} className="text-sm font-medium text-gray-500 hover:text-gray-900">
                        Passer cette étape →
                      </button>
                    )}
                    {renderSearchButton(!selectedEngine)}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
