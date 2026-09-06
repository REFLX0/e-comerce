'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Search, Car, ChevronDown, Check,
  Loader2, X, Sparkles, RotateCcw,
  ShieldCheck, Gauge, ArrowRight, Layers
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { productsApi } from '@/lib/api/products'
import type { VehicleMake, VehicleModel, VehicleGeneration, VehicleEngine } from '@/lib/types'
import { useVehicleStore } from '@/lib/store/vehicle.store'

interface VehicleFinderProps {
  onClose?: () => void
  initialVehicleType?: string | null
}

// Format year range badge
function formatYearBadge(yearFrom?: number | null, yearTo?: number | null): string | null {
  if (!yearFrom && !yearTo) return null
  if (yearFrom && yearTo) {
    if (yearFrom === yearTo) return `${yearFrom}`
    return `${yearFrom} – ${yearTo}`
  }
  if (yearFrom) return `${yearFrom} – Présent`
  if (yearTo) return `Jusqu'à ${yearTo}`
  return null
}

// Format clean compact generation label for the trigger button to avoid ugly truncation
function formatGenTrigger(genName: string, modelName?: string): string {
  let s = genName.replace(/\s*\(\d{4}\s*-\s*[^)]+\)/g, '').trim()
  if (modelName) {
    s = s.replace(new RegExp('^' + modelName + '\\s*', 'i'), '').trim()
  }
  return s || genName
}

const CATEGORY_FALLBACK_MAKES: Record<string, VehicleMake[]> = {
  automobile: [
    { slug: 'volkswagen', name: 'Volkswagen' },
    { slug: 'peugeot', name: 'Peugeot' },
    { slug: 'renault', name: 'Renault' },
    { slug: 'audi', name: 'Audi' },
    { slug: 'bmw', name: 'BMW' },
    { slug: 'mercedes-benz', name: 'Mercedes-Benz' },
    { slug: 'toyota', name: 'Toyota' },
    { slug: 'hyundai', name: 'Hyundai' },
    { slug: 'kia', name: 'Kia' },
    { slug: 'seat', name: 'Seat' },
    { slug: 'skoda', name: 'Skoda' },
    { slug: 'citroen', name: 'Citroën' },
    { slug: 'fiat', name: 'Fiat' },
    { slug: 'ford', name: 'Ford' },
    { slug: 'nissan', name: 'Nissan' },
    { slug: 'dacia', name: 'Dacia' },
    { slug: 'ds', name: 'DS Automobiles' },
    { slug: 'opel', name: 'Opel' },
    { slug: 'alfa-romeo', name: 'Alfa Romeo' },
    { slug: 'chevrolet', name: 'Chevrolet' },
    { slug: 'honda', name: 'Honda' },
    { slug: 'jeep', name: 'Jeep' },
    { slug: 'land-rover', name: 'Land Rover' },
    { slug: 'mazda', name: 'Mazda' },
    { slug: 'mini', name: 'Mini' },
    { slug: 'mitsubishi', name: 'Mitsubishi' },
    { slug: 'porsche', name: 'Porsche' },
    { slug: 'smart', name: 'Smart' },
    { slug: 'suzuki', name: 'Suzuki' },
    { slug: 'volvo', name: 'Volvo' },
  ],
  moto: [
    { slug: 'yamaha', name: 'Yamaha' },
    { slug: 'honda', name: 'Honda' },
    { slug: 'suzuki', name: 'Suzuki' },
    { slug: 'kawasaki', name: 'Kawasaki' },
    { slug: 'bmw', name: 'BMW' },
    { slug: 'ktm', name: 'KTM' },
    { slug: 'piaggio', name: 'Piaggio' },
    { slug: 'vespa', name: 'Vespa' },
    { slug: 'aprilia', name: 'Aprilia' },
    { slug: 'kymco', name: 'Kymco' },
    { slug: 'sym', name: 'SYM' },
    { slug: 'moto-guzzi', name: 'Moto Guzzi' },
    { slug: 'cfmoto', name: 'CFMOTO' },
    { slug: 'zimota', name: 'Zimota' },
    { slug: 'zontes', name: 'Zontes' },
    { slug: 'senke', name: 'Senke' },
  ],
  marine: [
    { slug: 'yamaha-marine', name: 'Yamaha Marine' },
    { slug: 'honda-marine', name: 'Honda Marine' },
    { slug: 'suzuki-marine', name: 'Suzuki Marine' },
    { slug: 'mercury', name: 'Mercury' },
    { slug: 'tohatsu', name: 'Tohatsu' },
    { slug: 'parsun', name: 'Parsun' },
    { slug: 'selva', name: 'Selva' },
    { slug: 'yanmar', name: 'Yanmar' },
  ],
  poids_lourd: [
    { slug: 'scania', name: 'Scania' },
    { slug: 'volvo-trucks', name: 'Volvo Trucks' },
    { slug: 'renault-trucks', name: 'Renault Trucks' },
    { slug: 'man', name: 'MAN' },
    { slug: 'mercedes-benz', name: 'Mercedes-Benz' },
    { slug: 'iveco', name: 'Iveco' },
    { slug: 'daf', name: 'DAF' },
    { slug: 'isuzu', name: 'Isuzu' },
    { slug: 'shacman', name: 'Shacman' },
    { slug: 'sinotruk', name: 'Sinotruk' },
    { slug: 'tata', name: 'Tata' },
    { slug: 'king-long', name: 'King Long' },
    { slug: 'otokar', name: 'Otokar' },
  ],
  agricole: [
    { slug: 'massey-ferguson', name: 'Massey Ferguson' },
    { slug: 'new-holland', name: 'New Holland' },
    { slug: 'john-deere', name: 'John Deere' },
    { slug: 'kubota', name: 'Kubota' },
    { slug: 'landini', name: 'Landini' },
    { slug: 'same', name: 'Same' },
    { slug: 'solis', name: 'Solis' },
    { slug: 'agrimont', name: 'Agrimont' },
    { slug: 'lamborghini', name: 'Lamborghini' },
    { slug: 'mahindra', name: 'Mahindra' },
  ],
}

function getCategoryFallbackMakes(type?: string | null): VehicleMake[] {
  const norm = (type || 'automobile').toLowerCase()
  if (norm.includes('moto') || norm.includes('scooter') || norm.includes('2-roues')) return CATEGORY_FALLBACK_MAKES.moto
  if (norm.includes('marine') || norm.includes('boat')) return CATEGORY_FALLBACK_MAKES.marine
  if (norm.includes('poids') || norm.includes('truck')) return CATEGORY_FALLBACK_MAKES.poids_lourd
  if (norm.includes('agri') || norm.includes('tract')) return CATEGORY_FALLBACK_MAKES.agricole
  return CATEGORY_FALLBACK_MAKES.automobile
}

export function VehicleFinder({ onClose, initialVehicleType }: VehicleFinderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const setVehicle = useVehicleStore((state) => state.setVehicle)

  // Dropdown visibility state (4 tiers)
  const [activeDropdown, setActiveDropdown] = useState<'make' | 'model' | 'generation' | 'engine' | null>(null)

  // Search input filters inside dropdowns
  const [makeSearch, setMakeSearch] = useState('')
  const [modelSearch, setModelSearch] = useState('')
  const [generationSearch, setGenerationSearch] = useState('')
  const [engineSearch, setEngineSearch] = useState('')
  const [engineFuelFilter, setEngineFuelFilter] = useState<'all' | 'essence' | 'diesel' | 'hybrid'>('all')

  // Data lists — strictly categorized by vehicle type
  const [makes, setMakes] = useState<VehicleMake[]>(() => getCategoryFallbackMakes(initialVehicleType))
  const [models, setModels] = useState<VehicleModel[]>([])
  const [generations, setGenerations] = useState<VehicleGeneration[]>([])
  const [engines, setEngines] = useState<VehicleEngine[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Selected items
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null)
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null)
  const [selectedGeneration, setSelectedGeneration] = useState<VehicleGeneration | null>(null)
  const [selectedEngine, setSelectedEngine] = useState<VehicleEngine | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const makeInputRef = useRef<HTMLInputElement>(null)
  const modelInputRef = useRef<HTMLInputElement>(null)
  const generationInputRef = useRef<HTMLInputElement>(null)
  const engineInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActiveDropdown(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Auto-focus search input when a dropdown opens
  useEffect(() => {
    if (activeDropdown === 'make') {
      setTimeout(() => makeInputRef.current?.focus(), 50)
    } else if (activeDropdown === 'model') {
      setTimeout(() => modelInputRef.current?.focus(), 50)
    } else if (activeDropdown === 'generation') {
      setTimeout(() => generationInputRef.current?.focus(), 50)
    } else if (activeDropdown === 'engine') {
      setTimeout(() => engineInputRef.current?.focus(), 50)
    }
  }, [activeDropdown])

  // Load makes on mount filtered strictly by category
  useEffect(() => {
    let active = true
    const fallback = getCategoryFallbackMakes(initialVehicleType)
    setMakes(fallback)

    const fetchInitialData = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await productsApi.getMakes(initialVehicleType ?? undefined)
        if (active) {
          if (Array.isArray(data) && data.length > 0) {
            setMakes(data)
          } else {
            setMakes(fallback)
          }
        }
      } catch {
        if (active) {
          setMakes(fallback)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchInitialData()
    return () => { active = false }
  }, [initialVehicleType])

  // Filtered makes
  const filteredMakes = useMemo(() => {
    const q = makeSearch.trim().toLowerCase()
    const list = q
      ? makes.filter(m => m.name.toLowerCase().includes(q) || (m.slug && m.slug.toLowerCase().includes(q)))
      : makes
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
  }, [makes, makeSearch])

  // Filtered models
  const filteredModels = useMemo(() => {
    const q = modelSearch.trim().toLowerCase()
    let list = models
    if (q) {
      const isYearQuery = /^\d{4}$/.test(q)
      const targetYear = isYearQuery ? parseInt(q, 10) : null
      list = models.filter(m => {
        if (m.name.toLowerCase().includes(q) || (m.slug && m.slug.toLowerCase().includes(q))) return true
        if (targetYear) {
          const from = m.yearFrom || 1980
          const to = m.yearTo || new Date().getFullYear() + 1
          if (targetYear >= from && targetYear <= to) return true
        }
        return false
      })
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
  }, [models, modelSearch])

  // Filtered generations — sorted strictly from OLDEST to NEWEST
  const filteredGenerations = useMemo(() => {
    const q = generationSearch.trim().toLowerCase()
    let list = generations
    if (q) {
      list = generations.filter(g =>
        g.name.toLowerCase().includes(q) ||
        (g.slug && g.slug.toLowerCase().includes(q)) ||
        (g.code && g.code.toLowerCase().includes(q)) ||
        (g.yearFrom && String(g.yearFrom).includes(q)) ||
        (g.yearTo && String(g.yearTo).includes(q))
      )
    }
    // Sort chronologically: oldest first -> newest last
    return [...list].sort((a, b) => {
      const yA = a.yearFrom ?? 9999
      const yB = b.yearFrom ?? 9999
      if (yA !== yB) return yA - yB
      return a.name.localeCompare(b.name, 'fr', { numeric: true, sensitivity: 'base' })
    })
  }, [generations, generationSearch])

  // Filtered engines
  const filteredEngines = useMemo(() => {
    let list = engines
    if (engineFuelFilter !== 'all') {
      list = list.filter(eng => {
        const fuel = (eng.fuelType || '').toLowerCase()
        const code = eng.engineCode.toLowerCase()
        if (engineFuelFilter === 'diesel') {
          return fuel === 'diesel' || /tdci|dci|tdi|hdi|cdi|crdi|multijet|ecoblue|diesel/i.test(code)
        }
        if (engineFuelFilter === 'essence') {
          return fuel === 'essence' || (!/tdci|dci|tdi|hdi|cdi|crdi|multijet|ecoblue|diesel/i.test(code) && !/hybrid|e-tech|phev/i.test(code))
        }
        if (engineFuelFilter === 'hybrid') {
          return fuel === 'hybrid' || /hybrid|e-tech|phev|mhev/i.test(code)
        }
        return true
      })
    }
    const q = engineSearch.trim().toLowerCase()
    if (!q) return list
    return list.filter(eng => {
      const code = eng.engineCode.toLowerCase()
      const spec = (eng.previewOil?.viscosity || '').toLowerCase()
      const oem = (eng.previewOil?.oemApproval || '').toLowerCase()
      const hp = eng.powerHp ? `${eng.powerHp}ch` : ''
      return code.includes(q) || spec.includes(q) || oem.includes(q) || hp.includes(q)
    })
  }, [engines, engineFuelFilter, engineSearch])

  const loadModels = async (make: VehicleMake) => {
    setLoading(true)
    setError('')
    setModels([])
    setGenerations([])
    setEngines([])
    try {
      const data = await productsApi.getModels(make.name, initialVehicleType ?? undefined)
      if (Array.isArray(data)) setModels(data)
    } catch {
      setError('Impossible de charger les modèles pour cette marque')
    } finally {
      setLoading(false)
    }
  }

  const loadGenerations = async (make: VehicleMake, model: VehicleModel) => {
    setLoading(true)
    setError('')
    setGenerations([])
    setEngines([])
    try {
      const data = await productsApi.getGenerations(make.name, model.name)
      if (Array.isArray(data) && data.length > 0) {
        setGenerations(data)
        setActiveDropdown('generation')
      } else {
        // Fallback if no specific generation: load engines directly
        const engData = await productsApi.getEngines(make.name, model.name)
        if (Array.isArray(engData)) setEngines(engData)
        setActiveDropdown('engine')
      }
    } catch {
      setError('Impossible de charger les versions pour ce modèle')
    } finally {
      setLoading(false)
    }
  }

  const loadEngines = async (make: VehicleMake, model: VehicleModel, generation?: VehicleGeneration | null) => {
    setLoading(true)
    setError('')
    setEngines([])
    try {
      const data = await productsApi.getEngines(make.name, model.name, generation?.name)
      if (Array.isArray(data)) setEngines(data)
    } catch {
      setError('Impossible de charger les motorisations pour cette version')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMake = (make: VehicleMake) => {
    setSelectedMake(make)
    setSelectedModel(null)
    setSelectedGeneration(null)
    setSelectedEngine(null)
    setMakeSearch('')
    setModelSearch('')
    setGenerationSearch('')
    setEngineSearch('')
    loadModels(make)
    setActiveDropdown('model')
  }

  const handleSelectModel = (model: VehicleModel) => {
    if (!selectedMake) return
    setSelectedModel(model)
    setSelectedGeneration(null)
    setSelectedEngine(null)
    setModelSearch('')
    setGenerationSearch('')
    setEngineSearch('')
    loadGenerations(selectedMake, model)
  }

  const handleSelectGeneration = (gen: VehicleGeneration) => {
    if (!selectedMake || !selectedModel) return
    setSelectedGeneration(gen)
    setSelectedEngine(null)
    setGenerationSearch('')
    setEngineSearch('')
    loadEngines(selectedMake, selectedModel, gen)
    setActiveDropdown('engine')
  }

  const handleSelectEngine = (engine: VehicleEngine) => {
    setSelectedEngine(engine)
    setEngineSearch('')
    setActiveDropdown(null)
  }

  const handleReset = () => {
    setSelectedMake(null)
    setSelectedModel(null)
    setSelectedGeneration(null)
    setSelectedEngine(null)
    setModels([])
    setGenerations([])
    setEngines([])
    setMakeSearch('')
    setModelSearch('')
    setGenerationSearch('')
    setEngineSearch('')
    setActiveDropdown('make')
  }

  const handleSearch = () => {
    if (!selectedMake || !selectedModel) return
    const makeSlug = selectedMake.slug || selectedMake.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const modelSlug = selectedModel.slug || selectedModel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const engineCode = selectedEngine ? selectedEngine.engineCode : ''
    const params = new URLSearchParams()
    params.set('make', makeSlug)
    params.set('model', modelSlug)
    if (selectedGeneration?.slug) params.set('generation', selectedGeneration.slug)
    if (engineCode) params.set('engine', engineCode)
    
    setVehicle({
      type: selectedModel.vehicleType || initialVehicleType || 'automobile',
      makeId: selectedMake.id || makeSlug,
      makeName: selectedMake.name,
      makeSlug: makeSlug,
      modelId: selectedModel.id || modelSlug,
      modelName: selectedModel.name,
      modelSlug: modelSlug,
      generationId: selectedGeneration?.id || selectedGeneration?.slug,
      generationName: selectedGeneration?.name,
      generationSlug: selectedGeneration?.slug,
      engineCode: engineCode,
    })
    params.set('isOilFinder', 'true')
    if (onClose) onClose()
    router.push(`/${locale}/catalogue?${params.toString()}`)
  }

  const activeSpec = selectedEngine?.previewOil

  // ── Step badge ──────────────────────────────────────────────────────────────
  const StepBadge = ({ n, active }: { n: number; active: boolean }) => (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-colors ${
        active
          ? 'bg-[#D4A76A] text-[#16254c]'
          : 'bg-white/10 text-white/50'
      }`}
    >
      {n}
    </span>
  )

  // ── Shared trigger button style ──────────────────────────────────────────────
  const triggerClass = (isOpen: boolean, isSelected: boolean, disabled: boolean) => {
    if (disabled) return 'border-white/5 bg-white/5 text-white/25 cursor-not-allowed'
    if (isOpen)   return 'border-[#D4A76A] ring-2 ring-[#D4A76A]/30 bg-white/10 text-white cursor-pointer'
    if (isSelected) return 'border-white/20 bg-white/10 text-white hover:border-[#D4A76A]/60 cursor-pointer'
    return 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/8 cursor-pointer'
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-6xl overflow-visible rounded-2xl border border-white/10 bg-[#16254c] shadow-[0_24px_80px_rgba(22,37,76,0.45)]"
    >
      {/* ══════ HEADER ══════ */}
      <div className="flex items-center justify-between px-5 py-4 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4A76A]/15 ring-1 ring-[#D4A76A]/30">
            <Sparkles size={16} className="text-[#D4A76A]" />
          </div>
          <div>
            <p className="text-sm font-black tracking-wide text-white">Sélecteur de Véhicule</p>
            <p className="text-[11px] text-white/50 leading-none mt-0.5 hidden sm:block">
              Marque → Modèle → Version / Génération → Motorisation spécifique
            </p>
          </div>
        </div>
        {selectedMake && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/60 transition hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <RotateCcw size={11} />
            Recommencer
          </button>
        )}
      </div>

      {/* ══════ DIVIDER ══════ */}
      <div className="mx-5 h-px bg-white/8 sm:mx-7" />

      {/* ══════ 4 DROPDOWNS — Straight horizontal line on PC, Stacked on Mobile ══════ */}
      {/* Container expands smoothly when dropdown is open so it NEVER gets cut off */}
      <div className={`p-5 sm:p-7 transition-[padding] duration-200 ${activeDropdown ? 'pb-[390px] sm:pb-[410px]' : 'pb-6 sm:pb-7'}`}>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">

          {/* ─── 1. MARQUE ─── */}
          <div className="relative flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/60">
              <StepBadge n={1} active={true} />
              Marque
            </label>

            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'make' ? null : 'make')}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-sm font-semibold text-left transition-all outline-none ${triggerClass(activeDropdown === 'make', !!selectedMake, false)}`}
            >
              <span className="min-w-0 truncate">
                {selectedMake
                  ? <span className="font-black text-white">{selectedMake.name}</span>
                  : <span className="text-white/50">Sélectionner marque…</span>
                }
              </span>
              <div className="flex shrink-0 items-center gap-1.5">
                {selectedMake && (
                  <span
                    onClick={(e) => { e.stopPropagation(); handleReset() }}
                    title="Effacer la marque"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-white/90 transition-all hover:bg-white/30 hover:text-white hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </span>
                )}
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 text-white/40 ${activeDropdown === 'make' ? 'rotate-180 text-[#D4A76A]' : ''}`}
                />
              </div>
            </button>

            {/* DROPDOWN: MARQUE */}
            {activeDropdown === 'make' && (
              <div className="absolute left-0 right-0 lg:right-auto top-[calc(100%+6px)] z-[300] rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.35),0_10px_20px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-150 lg:w-[320px]">
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={makeInputRef}
                    type="text"
                    value={makeSearch}
                    onChange={(e) => setMakeSearch(e.target.value)}
                    placeholder="Rechercher (ex: Volkswagen, Peugeot)…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#16254c] focus:ring-2 focus:ring-[#16254c]/15 transition"
                  />
                  {makeSearch && (
                    <button onClick={() => setMakeSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5">
                  {filteredMakes.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">Aucune marque trouvée</div>
                  ) : (
                    filteredMakes.map(m => {
                      const isSelected = selectedMake?.name === m.name
                      return (
                        <button
                          key={m.id || m.slug || m.name}
                          type="button"
                          onClick={() => handleSelectMake(m)}
                          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition text-left cursor-pointer ${
                            isSelected ? 'bg-[#16254c] text-white' : 'text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{m.name}</span>
                          {isSelected && <Check size={14} className="text-[#D4A76A] shrink-0" />}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── 2. MODÈLE ─── */}
          <div className="relative flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
              <StepBadge n={2} active={!!selectedMake} />
              Modèle
            </label>

            <button
              type="button"
              disabled={!selectedMake || loading}
              onClick={() => setActiveDropdown(activeDropdown === 'model' ? null : 'model')}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-sm font-semibold text-left transition-all outline-none ${triggerClass(activeDropdown === 'model', !!selectedModel, !selectedMake || loading)}`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
                {selectedModel ? (
                  <>
                    <span className="truncate font-black text-white">{selectedModel.name}</span>
                    {formatYearBadge(selectedModel.yearFrom, selectedModel.yearTo) && (
                      <span className="shrink-0 rounded-md bg-[#D4A76A]/20 border border-[#D4A76A]/30 px-1.5 py-0.5 text-[9px] font-bold text-[#D4A76A]">
                        {formatYearBadge(selectedModel.yearFrom, selectedModel.yearTo)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className={!selectedMake ? 'text-white/35' : 'text-white/50'}>
                    {!selectedMake ? "Choisir marque d'abord" : loading ? 'Chargement…' : 'Sélectionner modèle…'}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {loading && activeDropdown === 'model' && <Loader2 size={13} className="animate-spin text-[#D4A76A]" />}
                {selectedModel && !loading && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedModel(null)
                      setSelectedGeneration(null)
                      setSelectedEngine(null)
                      setGenerations([])
                      setEngines([])
                      setActiveDropdown('model')
                    }}
                    title="Effacer le modèle"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-white/90 transition-all hover:bg-white/30 hover:text-white hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </span>
                )}
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 text-white/40 ${activeDropdown === 'model' ? 'rotate-180 text-[#D4A76A]' : ''}`}
                />
              </div>
            </button>

            {/* DROPDOWN: MODÈLE */}
            {activeDropdown === 'model' && selectedMake && (
              <div className="absolute left-0 right-0 lg:right-auto top-[calc(100%+6px)] z-[300] rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.35),0_10px_20px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-150 lg:w-[320px]">
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={modelInputRef}
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="Filtrer modèle (ex: Golf, Passat)…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#16254c] focus:ring-2 focus:ring-[#16254c]/15 transition"
                  />
                  {modelSearch && (
                    <button onClick={() => setModelSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5">
                  {filteredModels.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">Aucun modèle trouvé</div>
                  ) : (
                    filteredModels.map(m => {
                      const isSelected = selectedModel?.name === m.name
                      const yearLabel = formatYearBadge(m.yearFrom, m.yearTo)
                      return (
                        <button
                          key={m.id || m.slug || m.name}
                          type="button"
                          onClick={() => handleSelectModel(m)}
                          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition text-left cursor-pointer ${
                            isSelected ? 'bg-[#16254c] text-white' : 'text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{m.name}</span>
                          <div className="flex shrink-0 items-center gap-2">
                            {yearLabel && (
                              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {yearLabel}
                              </span>
                            )}
                            {isSelected && <Check size={14} className="text-[#D4A76A]" />}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── 3. GÉNÉRATION ─── */}
          <div className="relative flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
              <StepBadge n={3} active={!!selectedModel} />
              Génération / Version
            </label>

            <button
              type="button"
              disabled={!selectedModel || loading}
              onClick={() => setActiveDropdown(activeDropdown === 'generation' ? null : 'generation')}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-sm font-semibold text-left transition-all outline-none ${triggerClass(activeDropdown === 'generation', !!selectedGeneration, !selectedModel || loading)}`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
                {selectedGeneration ? (
                  <>
                    <span className="truncate font-black text-white" title={selectedGeneration.name}>
                      {formatGenTrigger(selectedGeneration.name, selectedModel?.name)}
                    </span>
                    {formatYearBadge(selectedGeneration.yearFrom, selectedGeneration.yearTo) && (
                      <span className="shrink-0 rounded-md bg-[#D4A76A]/20 border border-[#D4A76A]/30 px-1.5 py-0.5 text-[9px] font-bold text-[#D4A76A]">
                        {formatYearBadge(selectedGeneration.yearFrom, selectedGeneration.yearTo)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className={!selectedModel ? 'text-white/35' : 'text-white/50'}>
                    {!selectedModel ? "Choisir modèle d'abord" : loading ? 'Chargement…' : 'Sélectionner version…'}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {loading && activeDropdown === 'generation' && <Loader2 size={13} className="animate-spin text-[#D4A76A]" />}
                {selectedGeneration && !loading && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedGeneration(null)
                      setSelectedEngine(null)
                      setEngines([])
                      setActiveDropdown('generation')
                    }}
                    title="Effacer la version"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-white/90 transition-all hover:bg-white/30 hover:text-white hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </span>
                )}
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 text-white/40 ${activeDropdown === 'generation' ? 'rotate-180 text-[#D4A76A]' : ''}`}
                />
              </div>
            </button>

            {/* DROPDOWN: GÉNÉRATION */}
            {activeDropdown === 'generation' && selectedModel && (
              <div className="absolute left-0 right-0 lg:left-auto lg:right-0 top-[calc(100%+6px)] z-[300] rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.35),0_10px_20px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-150 lg:w-[360px]">
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={generationInputRef}
                    type="text"
                    value={generationSearch}
                    onChange={(e) => setGenerationSearch(e.target.value)}
                    placeholder="Filtrer version (ex: B8, VII, 2015)…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#16254c] focus:ring-2 focus:ring-[#16254c]/15 transition"
                  />
                  {generationSearch && (
                    <button onClick={() => setGenerationSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5">
                  {filteredGenerations.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">Aucune version trouvée</div>
                  ) : (
                    filteredGenerations.map(g => {
                      const isSelected = selectedGeneration?.name === g.name
                      const yearLabel = formatYearBadge(g.yearFrom, g.yearTo)
                      return (
                        <button
                          key={g.id || g.slug || g.name}
                          type="button"
                          onClick={() => handleSelectGeneration(g)}
                          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition text-left cursor-pointer ${
                            isSelected ? 'bg-[#16254c] text-white' : 'text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 truncate">
                            <Layers size={13} className={isSelected ? 'text-[#D4A76A] shrink-0' : 'text-slate-400 shrink-0'} />
                            <span className="truncate">{g.name}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {yearLabel && (
                              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {yearLabel}
                              </span>
                            )}
                            {isSelected && <Check size={14} className="text-[#D4A76A]" />}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── 4. MOTORISATION ─── */}
          <div className="relative flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/60">
              <StepBadge n={4} active={!!selectedGeneration || (!!selectedModel && generations.length === 0)} />
              Motorisation
            </label>

            <button
              type="button"
              disabled={(!selectedGeneration && generations.length > 0) || !selectedModel || loading}
              onClick={() => setActiveDropdown(activeDropdown === 'engine' ? null : 'engine')}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-sm font-semibold text-left transition-all outline-none ${triggerClass(activeDropdown === 'engine', !!selectedEngine, (!selectedGeneration && generations.length > 0) || !selectedModel || loading)}`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 truncate">
                {selectedEngine ? (
                  <>
                    <span className="truncate font-black text-white">{selectedEngine.engineCode}</span>
                    {selectedEngine.previewOil?.viscosity && (
                      <span className="shrink-0 rounded-md bg-[#D4A76A]/20 border border-[#D4A76A]/40 px-1.5 py-0.5 text-[10px] font-black text-[#D4A76A]">
                        {selectedEngine.previewOil.viscosity}
                      </span>
                    )}
                  </>
                ) : (
                  <span className={!selectedModel ? 'text-white/35' : 'text-white/50'}>
                    {!selectedModel ? "Choisir véhicule d'abord" : loading ? 'Chargement…' : 'Sélectionner moteur…'}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {selectedEngine && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedEngine(null)
                      setActiveDropdown('engine')
                    }}
                    title="Effacer la motorisation"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-white/90 transition-all hover:bg-white/30 hover:text-white hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </span>
                )}
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 text-white/40 ${activeDropdown === 'engine' ? 'rotate-180 text-[#D4A76A]' : ''}`}
                />
              </div>
            </button>

            {/* DROPDOWN: MOTORISATION */}
            {activeDropdown === 'engine' && selectedModel && (
              <div className="absolute left-0 right-0 lg:left-auto lg:right-0 top-[calc(100%+6px)] z-[300] rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.35),0_10px_20px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-150 lg:w-[440px]">
                {/* Fuel Filter Pills */}
                <div className="mb-2.5 flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                  {(['all', 'essence', 'diesel', 'hybrid'] as const).map(f => {
                    const labels: Record<string, string> = { all: 'Tous', essence: '⛽ Essence', diesel: '🛢️ Diesel', hybrid: '⚡ Hybride' }
                    const activeClasses: Record<string, string> = {
                      all: 'bg-white text-slate-900 shadow-sm',
                      essence: 'bg-emerald-600 text-white shadow-sm',
                      diesel: 'bg-blue-600 text-white shadow-sm',
                      hybrid: 'bg-purple-600 text-white shadow-sm',
                    }
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setEngineFuelFilter(f)}
                        className={`flex-1 rounded-lg py-1.5 text-[11px] font-black transition cursor-pointer ${
                          engineFuelFilter === f ? activeClasses[f] : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {labels[f]}
                      </button>
                    )
                  })}
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={engineInputRef}
                    type="text"
                    value={engineSearch}
                    onChange={(e) => setEngineSearch(e.target.value)}
                    placeholder="Filtrer moteur (ex: 2.0 TDI, 150ch, CRLB)…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#16254c] focus:ring-2 focus:ring-[#16254c]/15 transition"
                  />
                  {engineSearch && (
                    <button onClick={() => setEngineSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Engine list */}
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-0.5">
                  {filteredEngines.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">Aucune motorisation trouvée</div>
                  ) : (
                    filteredEngines.map(eng => {
                      const isSelected = selectedEngine?.engineCode === eng.engineCode
                      const isDieselEng = (eng.fuelType === 'diesel') || /tdci|dci|tdi|hdi|cdi|crdi|multijet|ecoblue|diesel/i.test(eng.engineCode)
                      const isHybridEng = (eng.fuelType === 'hybrid') || /hybrid|e-tech|phev/i.test(eng.engineCode)
                      return (
                        <button
                          key={eng.engineCode}
                          type="button"
                          onClick={() => handleSelectEngine(eng)}
                          className={`w-full flex flex-col gap-1 p-2.5 rounded-xl text-left transition border cursor-pointer ${
                            isSelected
                              ? 'bg-[#16254c]/8 border-[#16254c]/30 ring-1 ring-[#16254c]/20'
                              : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-xs font-black text-slate-900 truncate">{eng.engineCode}</span>
                              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                                isHybridEng ? 'bg-purple-100 text-purple-800' :
                                isDieselEng ? 'bg-blue-100 text-blue-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isHybridEng ? 'Hybride' : isDieselEng ? 'Diesel' : 'Essence'}
                              </span>
                            </div>
                            {isSelected && <Check size={14} className="text-[#16254c] shrink-0" />}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                            {eng.powerHp && <span className="font-semibold text-slate-700">{eng.powerHp} ch</span>}
                            {eng.displacementCc && <span>· {(eng.displacementCc / 1000).toFixed(1)}L</span>}
                            {formatYearBadge(eng.yearFrom, eng.yearTo) && <span>· ({formatYearBadge(eng.yearFrom, eng.yearTo)})</span>}
                            {eng.previewOil?.viscosity && (
                              <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-black text-amber-900">
                                Huile : <strong className="text-amber-800">{eng.previewOil.viscosity}</strong>
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══════ ASSURANCE BADGES (when vehicle not yet selected and no dropdown is active) ══════ */}
        {(!selectedMake || !selectedModel) && !activeDropdown && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/50">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#D4A76A] shrink-0" />
              <span>100% huiles homologuées constructeurs</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#D4A76A] shrink-0" />
              <span>Précision par génération & motorisation exacte</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Gauge size={14} className="text-[#D4A76A] shrink-0" />
              <span>Normes officielles ACEA, API & OEM</span>
            </div>
          </div>
        )}

        {/* ══════ CONFIRMED VEHICLE + CTA (hidden while a dropdown is active to avoid overlap/bleed) ══════ */}
        {selectedMake && selectedModel && !activeDropdown && (
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in duration-300">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4A76A]/15 ring-1 ring-[#D4A76A]/30">
                <Car size={18} className="text-[#D4A76A]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white flex flex-wrap items-center gap-1.5">
                  <span>{selectedMake.name} {selectedModel.name}</span>
                  {selectedGeneration && (
                    <span className="text-[#D4A76A] font-bold">· {selectedGeneration.name}</span>
                  )}
                  {selectedEngine && (
                    <span className="text-white/60 font-semibold">· {selectedEngine.engineCode}</span>
                  )}
                </p>
                {activeSpec && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#D4A76A]/15 border border-[#D4A76A]/25 px-2 py-0.5 text-[11px] font-black text-[#D4A76A]">
                      <ShieldCheck size={11} />
                      Huile certifiée : <strong>{activeSpec.viscosity}</strong>
                      {activeSpec.oemApproval && <span className="opacity-75">({activeSpec.oemApproval})</span>}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4A76A] hover:bg-[#c99a5e] px-6 py-3 text-sm font-black text-[#16254c] shadow-[0_8px_24px_rgba(212,167,106,0.35)] hover:shadow-[0_12px_30px_rgba(212,167,106,0.5)] transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Search size={15} />
              Voir les huiles compatibles
              <ArrowRight size={14} className="opacity-70" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
