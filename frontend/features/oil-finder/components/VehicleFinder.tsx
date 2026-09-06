'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Search, Car, ChevronDown, Check,
  Loader2, X, Fuel, Sparkles, RotateCcw,
  CheckCircle2, AlertCircle, ShieldCheck, Gauge, ArrowRight
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { productsApi } from '@/lib/api/products'
import type { VehicleMake, VehicleModel, VehicleEngine } from '@/lib/types'
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

export function VehicleFinder({ onClose, initialVehicleType }: VehicleFinderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const setVehicle = useVehicleStore((state) => state.setVehicle)

  // Dropdown visibility state
  const [activeDropdown, setActiveDropdown] = useState<'make' | 'model' | 'engine' | null>(null)

  // Search input filters inside dropdowns
  const [makeSearch, setMakeSearch] = useState('')
  const [modelSearch, setModelSearch] = useState('')
  const [engineSearch, setEngineSearch] = useState('')
  const [engineFuelFilter, setEngineFuelFilter] = useState<'all' | 'essence' | 'diesel' | 'hybrid'>('all')

  // Data lists
  const [makes, setMakes] = useState<VehicleMake[]>([])
  const [models, setModels] = useState<VehicleModel[]>([])
  const [engines, setEngines] = useState<VehicleEngine[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Selected items
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null)
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null)
  const [selectedEngine, setSelectedEngine] = useState<VehicleEngine | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const makeInputRef = useRef<HTMLInputElement>(null)
  const modelInputRef = useRef<HTMLInputElement>(null)
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
    } else if (activeDropdown === 'engine') {
      setTimeout(() => engineInputRef.current?.focus(), 50)
    }
  }, [activeDropdown])

  // Load makes on mount
  useEffect(() => {
    let active = true

    const fetchInitialData = async () => {
      setLoading(true)
      setError('')

      try {
        let data = await productsApi.getMakes(initialVehicleType ?? undefined)
        if (!data || data.length < 5) {
          data = await productsApi.getMakes()
        }
        if (active && Array.isArray(data)) setMakes(data)
      } catch {
        if (active) setError('Impossible de charger les marques de véhicules')
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchInitialData()
    return () => { active = false }
  }, [initialVehicleType])

  // Filtered makes directly by name, sorted alphabetically
  const filteredMakes = useMemo(() => {
    const q = makeSearch.trim().toLowerCase()
    const list = q
      ? makes.filter(m => m.name.toLowerCase().includes(q) || (m.slug && m.slug.toLowerCase().includes(q)))
      : makes
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
  }, [makes, makeSearch])

  // Filtered models with generation and year search, sorted alphabetically
  const filteredModels = useMemo(() => {
    const q = modelSearch.trim().toLowerCase()
    let list = models

    if (q) {
      // Check if user is searching by a 4-digit year e.g. "2014"
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

  // Filtered engines by fuel type and search
  const filteredEngines = useMemo(() => {
    let list = engines

    // 1. Filter by fuel tab
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

    // 2. Filter by search query
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

  const loadModels = (make: VehicleMake) => {
    setLoading(true)
    setError('')
    setModels([])
    productsApi.getModels(make.name)
      .then(data => {
        if (Array.isArray(data)) setModels(data)
      })
      .catch(() => setError('Impossible de charger les modèles pour cette marque'))
      .finally(() => setLoading(false))
  }

  const loadEngines = (make: VehicleMake, model: VehicleModel) => {
    setLoading(true)
    setError('')
    setEngines([])
    productsApi.getEngines(make.name, model.name)
      .then(data => {
        if (Array.isArray(data)) setEngines(data)
      })
      .catch(() => setError('Impossible de charger les motorisations pour ce modèle'))
      .finally(() => setLoading(false))
  }

  const handleSelectMake = (make: VehicleMake) => {
    setSelectedMake(make)
    setSelectedModel(null)
    setSelectedEngine(null)
    setMakeSearch('')
    setModelSearch('')
    setEngineSearch('')
    loadModels(make)
    setActiveDropdown('model')
  }

  const handleSelectModel = (model: VehicleModel) => {
    if (!selectedMake) return
    setSelectedModel(model)
    setSelectedEngine(null)
    setModelSearch('')
    setEngineSearch('')
    loadEngines(selectedMake, model)
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
    setSelectedEngine(null)
    setModels([])
    setEngines([])
    setMakeSearch('')
    setModelSearch('')
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
    if (engineCode) params.set('engine', engineCode)

    setVehicle({
      type: selectedModel.vehicleType || initialVehicleType || 'automobile',
      makeId: selectedMake.id || makeSlug,
      makeName: selectedMake.name,
      makeSlug: makeSlug,
      modelId: selectedModel.id || modelSlug,
      modelName: selectedModel.name,
      modelSlug: modelSlug,
      engineCode: engineCode,
    })

    params.set('isOilFinder', 'true')
    if (onClose) onClose()
    router.push(`/${locale}/catalogue?${params.toString()}`)
  }

  // Active confirmed recommendation spec if an engine is selected or preview is available
  const activeSpec = selectedEngine?.previewOil

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-5xl rounded-2xl border border-slate-200/90 bg-white shadow-xl min-h-[420px] transition-all">
      {/* ═══════════════ HEADER BAR ═══════════════ */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80 px-5 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-black text-[#001E3C] flex items-center gap-2">
              <Sparkles size={16} className="text-[#D4A76A]" />
              Sélecteur de Véhicule
            </h2>
            <p className="text-xs text-slate-500">
              Choisissez votre marque, modèle et motorisation pour afficher immédiatement l&apos;huile homologuée
            </p>
          </div>

          {selectedMake && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw size={13} />
              Recommencer
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════ 3 HORIZONTAL CONTROLS (MARQUE - MODÈLE - MOTORISATION) ═══════════════ */}
      <div className="p-5 sm:p-6 pb-48 sm:pb-56">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative">
          {/* ────────────────── 1. MARQUE ────────────────── */}
          <div className="relative flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#001E3C] text-[9px] font-black text-white">1</span>
              MARQUE
            </label>

            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'make' ? null : 'make')}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold text-left transition shadow-2xs outline-none cursor-pointer ${
                activeDropdown === 'make'
                  ? 'border-blue-600 ring-2 ring-blue-600/20 bg-white text-slate-900'
                  : selectedMake
                    ? 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                    : 'border-slate-200 bg-slate-50/70 text-slate-500 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center min-w-0 flex-1 truncate">
                {selectedMake ? (
                  <span className="truncate font-black text-slate-900">{selectedMake.name}</span>
                ) : (
                  <span className="text-slate-400 font-medium">Sélectionner une marque...</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                {selectedMake && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReset()
                    }}
                    className="p-1 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
                  >
                    <X size={12} />
                  </span>
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'make' ? 'rotate-180 text-blue-600' : ''}`} />
              </div>
            </button>

            {/* FLOATING DROPDOWN: MARQUE */}
            {activeDropdown === 'make' && (
              <div className="absolute top-[104%] left-0 right-0 z-[100] rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-[0_25px_60px_-15px_rgba(22,37,76,0.25)] animate-in fade-in zoom-in-95 duration-150 md:min-w-[340px]">
                {/* Search box */}
                <div className="relative mb-3">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={makeInputRef}
                    type="text"
                    value={makeSearch}
                    onChange={(e) => setMakeSearch(e.target.value)}
                    placeholder="Rechercher une marque (ex: Ford, Renault)..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#001E3C] focus:bg-white focus:ring-2 focus:ring-[#001E3C]/15 transition"
                  />
                  {makeSearch && (
                    <button onClick={() => setMakeSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* All Makes List */}
                <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
                  {filteredMakes.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Aucune marque trouvée pour &quot;{makeSearch}&quot;
                    </div>
                  ) : (
                    filteredMakes.map(m => {
                      const isSelected = selectedMake?.name === m.name
                      return (
                        <button
                          key={m.id || m.slug || m.name}
                          type="button"
                          onClick={() => handleSelectMake(m)}
                          className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition text-left cursor-pointer ${
                            isSelected
                              ? 'bg-[#001E3C] text-white font-bold'
                              : 'text-slate-800 hover:bg-slate-100/90'
                          }`}
                        >
                          <span className="truncate">{m.name}</span>
                          {isSelected && <Check size={15} className="text-[#D4A76A] shrink-0" />}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ────────────────── 2. MODÈLE ────────────────── */}
          <div className="relative flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${selectedMake ? 'bg-[#001E3C] text-white' : 'bg-slate-200 text-slate-400'}`}>2</span>
              MODÈLE
            </label>

            <button
              type="button"
              disabled={!selectedMake || loading}
              onClick={() => setActiveDropdown(activeDropdown === 'model' ? null : 'model')}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold text-left transition shadow-2xs outline-none ${
                !selectedMake
                  ? 'border-slate-200/80 bg-slate-100/60 text-slate-400 cursor-not-allowed'
                  : activeDropdown === 'model'
                    ? 'border-blue-600 ring-2 ring-blue-600/20 bg-white text-slate-900 cursor-pointer'
                    : selectedModel
                      ? 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 cursor-pointer'
                      : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                {selectedModel ? (
                  <>
                    <span className="truncate font-black text-slate-900">{selectedModel.name}</span>
                    {formatYearBadge(selectedModel.yearFrom, selectedModel.yearTo) && (
                      <span className="shrink-0 rounded-md bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                        {formatYearBadge(selectedModel.yearFrom, selectedModel.yearTo)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className={selectedMake ? 'text-slate-600' : 'text-slate-400'}>
                    {!selectedMake ? 'Sélectionnez d’abord la marque' : loading ? 'Chargement des modèles...' : 'Sélectionner un modèle...'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                {loading && <Loader2 size={13} className="animate-spin text-blue-600" />}
                {selectedModel && !loading && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedModel(null)
                      setSelectedEngine(null)
                      setEngines([])
                      setActiveDropdown('model')
                    }}
                    className="p-1 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
                  >
                    <X size={12} />
                  </span>
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'model' ? 'rotate-180 text-blue-600' : ''}`} />
              </div>
            </button>

            {/* FLOATING DROPDOWN: MODÈLE */}
            {activeDropdown === 'model' && selectedMake && (
              <div className="absolute top-[104%] left-0 right-0 z-[100] rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-[0_25px_60px_-15px_rgba(22,37,76,0.25)] animate-in fade-in zoom-in-95 duration-150 md:min-w-[360px]">
                {/* Search box */}
                <div className="relative mb-3">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={modelInputRef}
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="Filtrer par modèle ou année (ex: Focus, 2014)..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#001E3C] focus:bg-white focus:ring-2 focus:ring-[#001E3C]/15 transition"
                  />
                  {modelSearch && (
                    <button onClick={() => setModelSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Model List with Explicit Generations and Years */}
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {filteredModels.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      Aucun modèle trouvé pour &quot;{modelSearch}&quot;
                    </div>
                  ) : (
                    filteredModels.map(m => {
                      const isSelected = selectedModel?.name === m.name
                      const yearLabel = formatYearBadge(m.yearFrom, m.yearTo)
                      return (
                        <button
                          key={m.id || m.slug || m.name}
                          type="button"
                          onClick={() => handleSelectModel(m)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                            isSelected
                              ? 'bg-[#001E3C] text-white'
                              : 'text-slate-800 hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-1">
                            <span className="truncate">{m.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {yearLabel && (
                              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200/80'
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

          {/* ────────────────── 3. MOTORISATION ────────────────── */}
          <div className="relative flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${selectedModel ? 'bg-[#001E3C] text-white' : 'bg-slate-200 text-slate-400'}`}>3</span>
              MOTORISATION
            </label>

            <button
              type="button"
              disabled={!selectedModel || loading}
              onClick={() => setActiveDropdown(activeDropdown === 'engine' ? null : 'engine')}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold text-left transition shadow-2xs outline-none ${
                !selectedModel
                  ? 'border-slate-200/80 bg-slate-100/60 text-slate-400 cursor-not-allowed'
                  : activeDropdown === 'engine'
                    ? 'border-blue-600 ring-2 ring-blue-600/20 bg-white text-slate-900 cursor-pointer'
                    : selectedEngine
                      ? 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 cursor-pointer'
                      : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                {selectedEngine ? (
                  <>
                    <span className="truncate font-black text-slate-900">{selectedEngine.engineCode}</span>
                    {selectedEngine.previewOil?.viscosity && (
                      <span className="shrink-0 rounded-md bg-amber-100/90 border border-amber-300 px-1.5 py-0.5 text-[10px] font-black text-amber-900">
                        {selectedEngine.previewOil.viscosity}
                      </span>
                    )}
                  </>
                ) : (
                  <span className={selectedModel ? 'text-slate-600' : 'text-slate-400'}>
                    {!selectedModel ? 'Sélectionnez d’abord le modèle' : loading ? 'Chargement...' : 'Sélectionner une motorisation...'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                {selectedEngine && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedEngine(null)
                      setActiveDropdown('engine')
                    }}
                    className="p-1 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
                  >
                    <X size={12} />
                  </span>
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'engine' ? 'rotate-180 text-blue-600' : ''}`} />
              </div>
            </button>

            {/* FLOATING DROPDOWN: MOTORISATION */}
            {activeDropdown === 'engine' && selectedModel && (
              <div className="absolute top-[104%] left-0 right-0 md:-left-24 md:right-0 z-[100] rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-[0_25px_60px_-15px_rgba(22,37,76,0.25)] animate-in fade-in zoom-in-95 duration-150 md:min-w-[420px]">
                {/* Fuel Filter Pills Tabs */}
                <div className="mb-2.5 flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setEngineFuelFilter('all')}
                    className={`flex-1 py-1.5 text-[11px] font-black rounded-lg transition cursor-pointer ${
                      engineFuelFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    type="button"
                    onClick={() => setEngineFuelFilter('essence')}
                    className={`flex-1 py-1.5 text-[11px] font-black rounded-lg transition cursor-pointer ${
                      engineFuelFilter === 'essence'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-emerald-700'
                    }`}
                  >
                    Essence ⛽
                  </button>
                  <button
                    type="button"
                    onClick={() => setEngineFuelFilter('diesel')}
                    className={`flex-1 py-1.5 text-[11px] font-black rounded-lg transition cursor-pointer ${
                      engineFuelFilter === 'diesel'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-blue-700'
                    }`}
                  >
                    Diesel 🛢️
                  </button>
                  <button
                    type="button"
                    onClick={() => setEngineFuelFilter('hybrid')}
                    className={`flex-1 py-1.5 text-[11px] font-black rounded-lg transition cursor-pointer ${
                      engineFuelFilter === 'hybrid'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-purple-700'
                    }`}
                  >
                    Hybride ⚡
                  </button>
                </div>

                {/* Search box */}
                <div className="relative mb-3">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={engineInputRef}
                    type="text"
                    value={engineSearch}
                    onChange={(e) => setEngineSearch(e.target.value)}
                    placeholder="Filtrer moteur ou puissance (ex: 1.0, 125ch, EcoBoost)..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#001E3C] focus:bg-white focus:ring-2 focus:ring-[#001E3C]/15 transition"
                  />
                  {engineSearch && (
                    <button onClick={() => setEngineSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Engine List */}
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {filteredEngines.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      Aucune motorisation trouvée pour ce filtre.
                    </div>
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
                              ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500/20'
                              : 'border-slate-100 bg-slate-50/40 hover:bg-slate-100/70 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-xs font-black text-slate-900 truncate">
                                {eng.engineCode}
                              </span>
                              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                isHybridEng
                                  ? 'bg-purple-100 text-purple-800'
                                  : isDieselEng
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isHybridEng ? 'Hybride' : isDieselEng ? 'Diesel' : 'Essence'}
                              </span>
                            </div>
                            {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                          </div>

                          {/* Engine details and oil recommendation badge */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                            {eng.powerHp && (
                              <span className="font-semibold text-slate-700">
                                {eng.powerHp} ch
                              </span>
                            )}
                            {eng.displacementCc && (
                              <span>· {(eng.displacementCc / 1000).toFixed(1)}L</span>
                            )}
                            {formatYearBadge(eng.yearFrom, eng.yearTo) && (
                              <span>· ({formatYearBadge(eng.yearFrom, eng.yearTo)})</span>
                            )}
                            {eng.previewOil?.viscosity && (
                              <span className="ml-auto inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200/90 px-1.5 py-0.2 text-[10px] font-black text-amber-900">
                                <span>Huile :</span>
                                <strong className="text-amber-800">{eng.previewOil.viscosity}</strong>
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

        {/* ═══════════════ CONFIRMED VEHICLE BAR & ACTION CTA ═══════════════ */}
        {selectedMake && selectedModel && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#001E3C] text-[#D4A76A]">
                <Car size={20} />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-[#001E3C] flex items-center gap-2 flex-wrap">
                  <span>{selectedMake.name} {selectedModel.name}</span>
                  {selectedEngine && (
                    <span className="text-slate-600 font-bold">
                      · {selectedEngine.engineCode}
                    </span>
                  )}
                </div>

                {/* Confirmed OEM Specification Tag */}
                {activeSpec && (
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-black text-amber-900">
                      <ShieldCheck size={13} className="text-amber-600" />
                      Huile certifiée : <strong className="text-amber-800">{activeSpec.viscosity}</strong>
                      {activeSpec.oemApproval && <span className="text-amber-700 font-semibold">({activeSpec.oemApproval})</span>}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#001E3C] hover:bg-[#002B56] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer shrink-0"
            >
              <Search size={15} className="text-[#D4A76A]" />
              <span>Voir les huiles compatibles</span>
              <ArrowRight size={14} className="text-white/70" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
