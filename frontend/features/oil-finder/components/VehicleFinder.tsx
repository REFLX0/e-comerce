'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Search, Car, ChevronRight, Check,
  AlertCircle, Loader2, SlidersHorizontal, X, Fuel, Sparkles, RotateCcw
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { productsApi } from '@/lib/api/products'
import type { VehicleMake, VehicleModel, VehicleEngine } from '@/lib/types'
import { useVehicleStore } from '@/lib/store/vehicle.store'

interface VehicleFinderProps {
  onClose?: () => void
  initialVehicleType?: string | null
}

const STEP_LABELS = ['Marque', 'Modèle', 'Motorisation']

// Top popular automotive brands in the region
const POPULAR_MAKE_NAMES = [
  'RENAULT', 'PEUGEOT', 'VOLKSWAGEN', 'DACIA', 'CITROEN', 'CITROËN',
  'FIAT', 'BMW', 'MERCEDES-BENZ', 'MERCEDES', 'AUDI', 'TOYOTA',
  'FORD', 'KIA', 'HYUNDAI', 'SEAT', 'NISSAN', 'OPEL', 'SKODA', 'LAND ROVER'
]

// Flexible, case-insensitive logo resolver
function getBrandLogo(slug: string, name: string): string | null {
  const s = (slug || '').toLowerCase().trim()
  const n = (name || '').toLowerCase().trim()

  if (s.includes('alfa') || n.includes('alfa')) return '/img/car-brands/alfa-romeo.png'
  if (s.includes('audi') || n.includes('audi')) return '/img/car-brands/audi.png'
  if (s.includes('bmw') || n.includes('bmw')) return '/img/car-brands/bmw.png'
  if (s.includes('citroen') || n.includes('citroen') || n.includes('citroën')) return '/img/car-brands/citroen.png'
  if (s.includes('dacia') || n.includes('dacia')) return '/img/car-brands/dacia.png'
  if (s.includes('fiat') || n.includes('fiat')) return '/img/car-brands/fiat.png'
  if (s.includes('ford') || n.includes('ford')) return '/img/car-brands/ford.png'
  if (s.includes('hyundai') || n.includes('hyundai')) return '/img/car-brands/hyundai.png'
  if (s.includes('kia') || n.includes('kia')) return '/img/car-brands/kia.png'
  if (s.includes('mercedes') || n.includes('mercedes')) return '/img/car-brands/mercedes-benz.png'
  if (s.includes('nissan') || n.includes('nissan')) return '/img/car-brands/nissan.png'
  if (s.includes('opel') || n.includes('opel')) return '/img/car-brands/opel.png'
  if (s.includes('peugeot') || n.includes('peugeot')) return '/img/car-brands/peugeot.png'
  if (s.includes('renault') || n.includes('renault')) return '/img/car-brands/renault.png'
  if (s.includes('seat') || n.includes('seat')) return '/img/car-brands/seat.png'
  if (s.includes('skoda') || n.includes('skoda') || n.includes('škoda')) return '/img/car-brands/skoda.png'
  if (s.includes('toyota') || n.includes('toyota')) return '/img/car-brands/toyota.png'
  if (s.includes('volkswagen') || s === 'vw' || n.includes('volkswagen')) return '/img/car-brands/volkswagen.png'
  if (s.includes('volvo') || n.includes('volvo')) return '/img/car-brands/volvo.png'
  if (s.includes('land') || n.includes('land rover')) return '/img/car-brands/land-rover.png'
  if (s.includes('jeep') || n.includes('jeep')) return '/img/car-brands/jeep.png'
  if (s.includes('honda') || n.includes('honda')) return '/img/car-brands/honda.png'
  if (s.includes('chevrolet') || n.includes('chevrolet')) return '/img/car-brands/chevrolet.png'
  if (s.includes('porsche') || n.includes('porsche')) return '/img/car-brands/porsche.png'
  if (s.includes('mitsubishi') || n.includes('mitsubishi')) return '/img/car-brands/mitsubishi.png'
  if (s.includes('suzuki') || n.includes('suzuki')) return '/img/car-brands/suzuki.png'
  if (s.includes('mazda') || n.includes('mazda')) return '/img/car-brands/mazda.png'
  if (s.includes('mini') || n.includes('mini')) return '/img/car-brands/mini.png'
  if (s.includes('abarth') || n.includes('abarth')) return '/img/car-brands/abarth.png'
  if (s.includes('jaguar') || n.includes('jaguar')) return '/img/car-brands/jaguar.png'

  return null
}

function BrandLogo({ make: { slug, name } }: { make: { slug: string; name: string } }) {
  const [loaded, setLoaded] = useState(false)
  const logoSrc = getBrandLogo(slug, name)

  if (!logoSrc) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-700 shadow-2xs group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
        {name.substring(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div className="relative flex h-11 w-11 items-center justify-center">
      {!loaded && (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
          {name.substring(0, 2).toUpperCase()}
        </div>
      )}
      <img
        src={logoSrc}
        alt={name}
        className={`h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-110 ${loaded ? 'block' : 'hidden'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      />
    </div>
  )
}

export function VehicleFinder({ onClose, initialVehicleType }: VehicleFinderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const setVehicle = useVehicleStore((state) => state.setVehicle)

  const [step, setStep] = useState(1)

  const [makes, setMakes] = useState<VehicleMake[]>([])
  const [models, setModels] = useState<VehicleModel[]>([])
  const [engines, setEngines] = useState<VehicleEngine[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [makeSearch, setMakeSearch] = useState('')
  const [modelSearch, setModelSearch] = useState('')

  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null)
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null)
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const fetchInitialData = async () => {
      await Promise.resolve()
      if (!active) return

      setLoading(true)
      setError('')

      try {
        const data = await productsApi.getMakes(initialVehicleType ?? undefined)
        if (active) setMakes(data)
      } catch {
        if (active) setError('Impossible de charger les marques de véhicules')
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchInitialData()
    return () => { active = false }
  }, [initialVehicleType])

  // Partition into Popular Makes and Other Makes
  const { popularMakes, filteredMakes } = useMemo(() => {
    const search = makeSearch.trim().toLowerCase()

    if (search) {
      const filtered = makes.filter(m => m.name.toLowerCase().includes(search))
      return { popularMakes: [], filteredMakes: filtered }
    }

    const popularMap = new Map<string, VehicleMake>()
    makes.forEach(m => {
      const upper = m.name.toUpperCase().trim()
      if (POPULAR_MAKE_NAMES.some(p => upper.includes(p) || p.includes(upper))) {
        popularMap.set(m.name, m)
      }
    })

    const popularList: VehicleMake[] = []
    POPULAR_MAKE_NAMES.forEach(pName => {
      for (const [name, make] of popularMap.entries()) {
        if (name.toUpperCase().includes(pName)) {
          if (!popularList.some(item => item.id === make.id)) {
            popularList.push(make)
          }
        }
      }
    })

    const otherList = makes.filter(m => !popularList.some(p => p.id === m.id))

    return { popularMakes: popularList, filteredMakes: otherList }
  }, [makes, makeSearch])

  // Filter models based on search
  const filteredModels = useMemo(() => {
    const search = modelSearch.trim().toLowerCase()
    if (!search) return models
    return models.filter(m => m.name.toLowerCase().includes(search))
  }, [models, modelSearch])

  const loadModels = (make: VehicleMake) => {
    setLoading(true)
    setError('')
    setModels([])
    setModelSearch('')
    productsApi.getModels(make.name)
      .then(setModels)
      .catch(() => setError('Impossible de charger les modèles pour cette marque'))
      .finally(() => setLoading(false))
  }

  const loadEngines = (model: VehicleModel) => {
    if (!selectedMake) return
    setLoading(true)
    setError('')
    setEngines([])
    productsApi.getEngines(selectedMake.name, model.name)
      .then(setEngines)
      .catch(() => setError('Impossible de charger les motorisations pour ce modèle'))
      .finally(() => setLoading(false))
  }

  const selectMake = (make: VehicleMake) => {
    setSelectedMake(make)
    setSelectedModel(null)
    setSelectedEngine(null)
    setMakeSearch('')
    loadModels(make)
    setStep(2)
  }

  const selectModel = (model: VehicleModel) => {
    setSelectedModel(model)
    setSelectedEngine(null)
    loadEngines(model)
    setStep(3)
  }

  const resetTo = (targetStep: number) => {
    setStep(targetStep)
    if (targetStep === 1) {
      setSelectedMake(null)
      setSelectedModel(null)
      setSelectedEngine(null)
      setMakeSearch('')
      setModelSearch('')
    } else if (targetStep === 2) {
      setSelectedModel(null)
      setSelectedEngine(null)
      setModelSearch('')
    }
  }

  const handleSearch = () => {
    if (!selectedMake || !selectedModel) return
    const params = new URLSearchParams()
    params.set('make', selectedMake.slug)
    params.set('model', selectedModel.slug)
    if (selectedEngine) params.set('engine', selectedEngine)
    setVehicle({
      type: selectedModel.vehicleType,
      makeId: selectedMake.id,
      makeName: selectedMake.name,
      makeSlug: selectedMake.slug,
      modelId: selectedModel.id,
      modelName: selectedModel.name,
      modelSlug: selectedModel.slug,
      engineCode: selectedEngine ?? '',
    })
    params.set('isOilFinder', 'true')
    if (onClose) onClose()
    router.push(`/${locale}/catalogue?${params.toString()}`)
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl">
      {/* Sleek Top Stepper Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#0B1528] flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              Sélecteur de Véhicule
            </h2>
            <p className="text-xs text-slate-500">
              Sélectionnez votre véhicule pour filtrer automatiquement les huiles certifiées
            </p>
          </div>

          {/* Interactive Stepper Breadcrumbs */}
          <div className="flex items-center gap-1.5">
            {STEP_LABELS.map((label, i) => {
              const s = i + 1
              const isCompleted = s < step
              const isActive = s === step
              return (
                <div key={label} className="flex items-center gap-1">
                  <button
                    onClick={() => isCompleted && resetTo(s)}
                    disabled={!isCompleted}
                    className={`
                      flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all
                      ${isCompleted ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer' : ''}
                      ${isActive ? 'bg-[#001E3C] text-white shadow-xs' : ''}
                      ${!isCompleted && !isActive ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}
                    `}
                  >
                    {isCompleted ? <Check size={12} strokeWidth={3} /> : <span>{s}</span>}
                    <span>{label}</span>
                  </button>
                  {i < STEP_LABELS.length - 1 && <ChevronRight size={12} className="text-slate-300" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Vehicle Badge Ribbon */}
        {selectedMake && (
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Sélection en cours :</span>
            <button
              onClick={() => resetTo(1)}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-900 ring-1 ring-blue-200/70 hover:bg-blue-100 transition-colors"
            >
              <span>{selectedMake.name}</span>
              <X size={12} className="text-blue-500" />
            </button>

            {selectedModel && (
              <button
                onClick={() => resetTo(2)}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-900 ring-1 ring-blue-200/70 hover:bg-blue-100 transition-colors"
              >
                <span>{selectedModel.name}</span>
                <X size={12} className="text-blue-500" />
              </button>
            )}

            {selectedEngine && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 font-bold text-amber-900 ring-1 ring-amber-200">
                <span>{selectedEngine}</span>
              </span>
            )}

            <button
              onClick={() => resetTo(1)}
              className="ml-auto text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1"
            >
              <RotateCcw size={11} />
              Recommencer
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6">
        {error && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 ring-1 ring-red-200">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            {error}
          </div>
        )}

        {/* ═══════════════ STEP 1: MARQUE ═══════════════ */}
        {step === 1 && (
          <div>
            {/* Search Input */}
            <div className="relative mb-5">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={makeSearch}
                onChange={e => setMakeSearch(e.target.value)}
                placeholder="Rechercher une marque (Renault, Peugeot, Volkswagen, BMW...)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-10 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
              {makeSearch && (
                <button
                  onClick={() => setMakeSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {loading && makes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 size={30} className="animate-spin text-blue-600 mb-2" />
                <span className="text-xs font-medium">Chargement des marques constructeurs...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Popular Brands Grid (when no search query) */}
                {!makeSearch && popularMakes.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-500" />
                        Marques les plus recherchées
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{popularMakes.length} marques</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                      {popularMakes.map(make => {
                        const isSelected = selectedMake?.id === make.id
                        return (
                          <button
                            key={make.id}
                            onClick={() => selectMake(make)}
                            className={`
                              group relative flex items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-200
                              ${isSelected
                                ? 'border-2 border-blue-600 bg-blue-50/70 shadow-sm'
                                : 'border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/20 hover:shadow-md hover:-translate-y-0.5'
                              }
                            `}
                          >
                            <BrandLogo make={make} />
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-bold text-slate-800 truncate group-hover:text-blue-900">
                                {make.name}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* All / Filtered Brands */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {makeSearch ? `Résultats pour "${makeSearch}"` : 'Toutes les marques (A-Z)'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {filteredMakes.length} marques disponibles
                    </span>
                  </div>

                  {filteredMakes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                      <Search size={28} className="mb-2 opacity-40" />
                      <p className="text-sm font-medium text-slate-600">Aucune marque trouvée pour &ldquo;{makeSearch}&rdquo;</p>
                      <p className="text-xs text-slate-400 mt-1">Vérifiez l'orthographe ou essayez avec une autre marque</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                      {filteredMakes.map(make => {
                        const isSelected = selectedMake?.id === make.id
                        return (
                          <button
                            key={make.id}
                            onClick={() => selectMake(make)}
                            className={`
                              group flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-150
                              ${isSelected
                                ? 'border border-blue-500 bg-blue-50 text-blue-900 font-bold'
                                : 'border border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-white hover:shadow-2xs text-slate-700'
                              }
                            `}
                          >
                            <BrandLogo make={make} />
                            <span className="text-xs font-semibold truncate group-hover:text-blue-900">
                              {make.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ STEP 2: MODÈLE ═══════════════ */}
        {step === 2 && selectedMake && (
          <div>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Choisissez le modèle pour <span className="text-blue-600">{selectedMake.name}</span>
                </h3>
                <p className="text-xs text-slate-400">{models.length} modèles disponibles</p>
              </div>

              {/* Model Search Filter */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={modelSearch}
                  onChange={e => setModelSearch(e.target.value)}
                  placeholder="Filtrer les modèles..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-8 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
                />
                {modelSearch && (
                  <button
                    onClick={() => setModelSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 size={28} className="animate-spin text-blue-600 mb-2" />
                <span className="text-xs font-medium">Chargement des modèles {selectedMake.name}...</span>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <Car size={32} className="mb-2 opacity-40" />
                <p className="text-sm font-medium text-slate-600">Aucun modèle trouvé pour cette recherche</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredModels.map(model => {
                  const isSelected = selectedModel?.id === model.id
                  const vehicleTypeLabel =
                    model.vehicleType === 'poids_lourd' ? 'Poids Lourd' :
                    model.vehicleType === 'agricole' ? 'Agricole' :
                    model.vehicleType === 'moto' ? 'Moto' : 'Tourisme'

                  return (
                    <button
                      key={model.id}
                      onClick={() => selectModel(model)}
                      className={`
                        group flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-150
                        ${isSelected
                          ? 'border-2 border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/20 hover:shadow-xs'
                        }
                      `}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-900">
                          {model.name}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {vehicleTypeLabel}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ STEP 3: MOTORISATION ═══════════════ */}
        {step === 3 && selectedMake && selectedModel && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Sélectionnez la motorisation de votre <span className="text-blue-600">{selectedMake.name} {selectedModel.name}</span>
                </h3>
                <p className="text-xs text-slate-400">Précisez le moteur pour une compatibilité d'huile exacte</p>
              </div>

              <button
                onClick={handleSearch}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Passer cette étape & voir les huiles →
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 size={28} className="animate-spin text-blue-600 mb-2" />
                <span className="text-xs font-medium">Chargement des motorisations compatibles...</span>
              </div>
            ) : engines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <SlidersHorizontal size={32} className="mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-700">Aucune motorisation détaillée spécifique</p>
                <p className="mt-1 text-xs text-slate-400 max-w-sm">
                  Vous pouvez directement consulter le catalogue d'huiles homologuées pour votre {selectedMake.name} {selectedModel.name}.
                </p>
                <button
                  onClick={handleSearch}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#001E3C] hover:bg-[#002B56] px-6 py-3 text-xs font-bold text-white shadow-md transition active:scale-95"
                >
                  <Search size={14} className="text-amber-400" />
                  Voir les huiles compatibles
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {engines.map(eng => {
                    const isSelected = selectedEngine === eng.engineCode
                    const yearLabel = eng.yearFrom || eng.yearTo ? `${eng.yearFrom || '…'} – ${eng.yearTo || '…'}` : null

                    const isDiesel = eng.engineCode.toUpperCase().includes('DCI') || eng.engineCode.toUpperCase().includes('TDI') || eng.engineCode.toUpperCase().includes('HDI') || eng.engineCode.toUpperCase().includes('CDI') || eng.engineCode.toUpperCase().includes('DIESEL')
                    const fuelLabel = isDiesel ? 'Diesel' : 'Essence'

                    return (
                      <button
                        key={eng.engineCode}
                        onClick={() => setSelectedEngine(eng.engineCode)}
                        className={`
                          group flex items-start gap-3 rounded-xl border p-3 text-left transition-all duration-150
                          ${isSelected
                            ? 'border-2 border-blue-600 bg-blue-50/70 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/20 hover:shadow-xs'
                          }
                        `}
                      >
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'} transition-colors`}>
                          <Fuel size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-900">
                            {eng.engineCode}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${isDiesel ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {fuelLabel}
                            </span>
                            {yearLabel && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                                {yearLabel}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && <Check size={16} className="text-blue-600 shrink-0 mt-1" strokeWidth={3} />}
                      </button>
                    )
                  })}
                </div>

                {/* Final Action Button */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500">
                    {selectedEngine ? `Motorisation sélectionnée : ${selectedEngine}` : 'Précision optionnelle'}
                  </span>
                  <button
                    onClick={handleSearch}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#001E3C] hover:bg-[#002B56] px-7 py-3 text-xs font-bold text-white shadow-md transition active:scale-95"
                  >
                    <Search size={14} className="text-amber-400" />
                    Voir les huiles pour {selectedMake.name} {selectedModel.name}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
