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

// Top popular automotive brands
const POPULAR_MAKE_NAMES = [
  'RENAULT', 'PEUGEOT', 'VOLKSWAGEN', 'DACIA', 'CITROEN', 'CITROËN',
  'FIAT', 'BMW', 'MERCEDES-BENZ', 'MERCEDES', 'AUDI', 'TOYOTA',
  'FORD', 'KIA', 'HYUNDAI', 'SEAT', 'NISSAN', 'OPEL', 'SKODA', 'LAND ROVER',
  'VOLVO', 'JEEP', 'HONDA', 'CHEVROLET', 'SUZUKI', 'MITSUBISHI'
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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-700 shadow-2xs group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
        {name.substring(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      {!loaded && (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
          {name.substring(0, 2).toUpperCase()}
        </div>
      )}
      <img
        src={logoSrc}
        alt={name}
        className={`h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-110 ${loaded ? 'block' : 'hidden'}`}
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
        let data = await productsApi.getMakes(initialVehicleType ?? undefined)
        // If the initial vehicle type returned fewer than 5 makes, load all available makes
        if (!data || data.length < 5) {
          data = await productsApi.getMakes()
        }
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

  // Partition into Popular Makes and All Makes
  const { popularMakes, allMakes } = useMemo(() => {
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

    return { popularMakes: popularList, allMakes: makes }
  }, [makes])

  const loadModels = (make: VehicleMake) => {
    setLoading(true)
    setError('')
    setModels([])
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
    } else if (targetStep === 2) {
      setSelectedModel(null)
      setSelectedEngine(null)
    }
  }

  const handleSearch = () => {
    if (!selectedMake || !selectedModel) return
    const makeSlug = selectedMake.slug || selectedMake.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const modelSlug = selectedModel.slug || selectedModel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const params = new URLSearchParams()
    params.set('make', makeSlug)
    params.set('model', modelSlug)
    if (selectedEngine) params.set('engine', selectedEngine)
    setVehicle({
      type: selectedModel.vehicleType || initialVehicleType || 'automobile',
      makeId: selectedMake.id || makeSlug,
      makeName: selectedMake.name,
      makeSlug: makeSlug,
      modelId: selectedModel.id || modelSlug,
      modelName: selectedModel.name,
      modelSlug: modelSlug,
      engineCode: selectedEngine ?? '',
    })
    params.set('isOilFinder', 'true')
    if (onClose) onClose()
    router.push(`/${locale}/catalogue?${params.toString()}`)
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl">
      {/* ═══════════════ TOP SECTION: 3 DIRECT SELECT DROPDOWNS ═══════════════ */}
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-5 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-[#0B1528] flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              Sélecteur de Véhicule
            </h2>
            <p className="text-xs text-slate-500">
              Choisissez directement votre véhicule dans les listes ci-dessous sans avoir à taper
            </p>
          </div>

          {selectedMake && (
            <button
              onClick={() => resetTo(1)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700"
            >
              <RotateCcw size={12} />
              Recommencer
            </button>
          )}
        </div>

        {/* 3 Main Visible Selection Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Dropdown 1: Marque */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#001E3C] text-[9px] text-white">1</span>
              Marque
            </label>
            <select
              value={selectedMake?.slug || selectedMake?.name || selectedMake?.id || ''}
              onChange={(e) => {
                const found = makes.find(m => (m.slug || m.name || m.id) === e.target.value)
                if (found) selectMake(found)
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-900 shadow-2xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="" disabled>Sélectionner une marque...</option>
              {allMakes.map(m => {
                const val = m.slug || m.name || m.id
                return (
                  <option key={val} value={val}>
                    {m.name}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Dropdown 2: Modèle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${selectedMake ? 'bg-[#001E3C] text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
              Modèle
            </label>
            <select
              value={selectedModel?.slug || selectedModel?.name || selectedModel?.id || ''}
              disabled={!selectedMake || models.length === 0}
              onChange={(e) => {
                const found = models.find(m => (m.slug || m.name || m.id) === e.target.value)
                if (found) selectModel(found)
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-xs font-bold shadow-2xs outline-none transition ${
                selectedMake
                  ? 'border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'border-slate-200/60 bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <option value="" disabled>
                {!selectedMake ? 'Sélectionnez d’abord la marque' : 'Sélectionner un modèle...'}
              </option>
              {models.map(m => {
                const val = m.slug || m.name || m.id
                return (
                  <option key={val} value={val}>
                    {m.name}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Dropdown 3: Motorisation */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${selectedModel ? 'bg-[#001E3C] text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
              Motorisation
            </label>
            <select
              value={selectedEngine || ''}
              disabled={!selectedModel || engines.length === 0}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2.5 text-xs font-bold shadow-2xs outline-none transition ${
                selectedModel
                  ? 'border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'border-slate-200/60 bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <option value="" disabled>
                {!selectedModel ? 'Sélectionnez d’abord le modèle' : 'Sélectionner une motorisation...'}
              </option>
              {engines.map(eng => {
                const yearLabel = eng.yearFrom || eng.yearTo ? `(${eng.yearFrom || '…'}-${eng.yearTo || '…'})` : ''
                return (
                  <option key={eng.engineCode} value={eng.engineCode}>
                    {eng.engineCode} {yearLabel}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {/* Action Button Bar */}
        {selectedMake && selectedModel && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-600 font-medium">
              Véhicule choisi : <strong className="text-blue-900">{selectedMake.name} {selectedModel.name}</strong> {selectedEngine && <span>({selectedEngine})</span>}
            </div>
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#001E3C] hover:bg-[#002B56] px-6 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer"
            >
              <Search size={14} className="text-amber-400" />
              Voir les huiles compatibles
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
