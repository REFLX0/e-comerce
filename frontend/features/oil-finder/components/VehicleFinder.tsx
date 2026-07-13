'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Search, ArrowLeft, Car, ChevronRight, Check,
  AlertCircle, Loader2, SlidersHorizontal, X
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { productsApi } from '@/lib/api/products'
import type { VehicleMake, VehicleModel, VehicleEngine } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'


interface VehicleFinderProps {
  onClose?: () => void
}

const STEP_LABELS = ['Marque', 'Modèle', 'Motorisation']

const BRAND_DOMAINS: Record<string, string> = {
  'peugeot': 'peugeot.fr',
  'renault': 'renault.fr',
  'volkswagen': 'volkswagen.com',
  'mercedes-benz': 'mercedes-benz.com',
  'bmw': 'bmw.com',
  'audi': 'audi.com',
  'toyota': 'toyota.com',
  'ford': 'ford.com',
  'fiat': 'fiat.com',
  'hyundai': 'hyundai.com',
  'kia': 'kia.com',
  'nissan': 'nissan.com',
  'honda': 'honda.com',
  'mazda': 'mazda.com',
  'citroen': 'citroen.com',
  'citröen': 'citroen.com',
  'citroën': 'citroen.com',
  'opel': 'opel.com',
  'skoda': 'skoda-auto.com',
  'škoda': 'skoda-auto.com',
  'seat': 'seat.com',
  'dacia': 'dacia.com',
  'jeep': 'jeep.com',
  'land rover': 'landrover.com',
  'land-rover': 'landrover.com',
  'volvo': 'volvo.com',
  'subaru': 'subaru.com',
  'suzuki': 'suzuki.com',
  'mitsubishi': 'mitsubishi-motors.com',
  'porsche': 'porsche.com',
  'lexus': 'lexus.com',
  'alfa-romeo': 'alfaromeo.com',
  'alfa romeo': 'alfaromeo.com',
  'chevrolet': 'chevrolet.com',
  'mini': 'mini.com',
  'tesla': 'tesla.com',
  'jaguar': 'jaguar.com',
  'aston martin': 'astonmartin.com',
  'aston-martin': 'astonmartin.com',
  'ferrari': 'ferrari.com',
  'lamborghini': 'lamborghini.com',
  'maserati': 'maserati.com',
  'bentley': 'bentleymotors.com',
  'rolls-royce': 'rolls-roycemotorcars.com',
  'rolls royce': 'rolls-roycemotorcars.com',
  'mclaren': 'mclaren.com',
  'bugatti': 'bugatti.com',
  'cadillac': 'cadillac.com',
  'lincoln': 'lincoln.com',
  'chrysler': 'chrysler.com',
  'dodge': 'dodge.com',
  'ram': 'ramtrucks.com',
  'gmc': 'gmc.com',
  'infiniti': 'infiniti.com',
  'smart': 'smart.com',
  'vauxhall': 'vauxhall.co.uk',
  'abarth': 'abarth.com',
  'lancia': 'lancia.com',
  'mg': 'mg.co.uk',
}

function getBrandLogoUrl(make: { name: string; slug: string }): string | null {
  const key = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const domain = BRAND_DOMAINS[make.slug.toLowerCase()] || BRAND_DOMAINS[make.name.toLowerCase()] || BRAND_DOMAINS[key(make.slug)] || BRAND_DOMAINS[key(make.name)]
  return domain ? `https://logo.clearbit.com/${domain}` : null
}

export function VehicleFinder({ onClose }: VehicleFinderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)

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
    productsApi.getMakes()
      .then(setMakes)
      .catch(() => setError('Impossible de charger les marques'))
      .finally(() => setLoading(false))
  }, [])

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
    setDirection(newStep > step ? 1 : -1)
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

  const variants = {
    initial: (d: number) => ({ opacity: 0, x: d > 0 ? 30 : -30 }),
    animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
    exit: (d: number) => ({ opacity: 0, x: d < 0 ? 30 : -30, transition: { duration: 0.2, ease: 'easeIn' as const } }),
  }

  const renderSearchButton = (disabled = false) => (
    <button
      onClick={handleSearch}
      disabled={disabled}
      className={`
        flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200
        ${!disabled ? 'bg-[#E10600] text-white hover:bg-[#c80500]' : 'bg-white/[0.06] text-neutral-500 cursor-not-allowed'}
      `}
    >
      <Search size={16} />
      <span>Voir les huiles compatibles</span>
    </button>
  )

  return (
    <div
      className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-neutral-950"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-5 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recherche par véhicule
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              Marque → Modèle → Motorisation
            </p>
          </div>

          {/* Step indicator */}
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
                      ${isCompleted ? 'bg-red-600/10 text-red-500 cursor-pointer hover:bg-red-600/20' : ''}
                      ${isActive ? 'bg-white/[0.06] text-white' : ''}
                      ${!isCompleted && !isActive ? 'text-neutral-600' : ''}
                    `}
                    disabled={!isCompleted}
                  >
                    {isCompleted ? <Check size={11} strokeWidth={3} /> : null}
                    {label}
                  </button>
                  {i < STEP_LABELS.length - 1 && <ChevronRight size={12} className="text-neutral-700" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-[400px] flex-col p-6 md:p-8">
        <div className="relative flex-1">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-500/20">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            {/* ═══════════════ STEP 1: MAKE ═══════════════ */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="mb-5">
                  <p className="text-sm font-medium text-neutral-400">
                    Quelle est la marque de votre véhicule ?
                  </p>
                </div>

                {/* Search input */}
                <div className="relative mb-5">
                  <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={makeSearch}
                    onChange={e => setMakeSearch(e.target.value)}
                    placeholder="Rechercher une marque..."
                    className="w-full rounded-xl bg-white/[0.04] py-3.5 pl-11 pr-10 text-sm text-white placeholder-neutral-600 outline-none ring-1 ring-white/[0.06] transition-all focus:ring-red-500/40"
                  />
                  {makeSearch && (
                    <button
                      onClick={() => setMakeSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {loading && makes.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-red-500" />
                  </div>
                ) : filteredMakes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
                    <Search size={32} className="mb-3 opacity-50" />
                    <p className="text-sm">Aucune marque trouvée pour &ldquo;{makeSearch}&rdquo;</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredMakes.map((make) => {
                      const isSelected = selectedMake?.id === make.id
                      const logoUrl = getBrandLogoUrl(make)
                      
                      return (
                        <button
                          key={make.id}
                          onClick={() => selectMake(make)}
                          className={`
                            relative flex flex-col items-center gap-3 rounded-xl p-4 transition-all duration-200
                            ${isSelected
                              ? 'bg-white/[0.08] ring-1 ring-white/20'
                              : 'bg-white/[0.03] ring-1 ring-white/[0.06] hover:bg-white/[0.06] hover:ring-white/10'
                            }
                          `}
                        >
                          <div className={`
                            flex h-12 w-12 items-center justify-center rounded-lg transition-colors
                            ${isSelected ? 'bg-white/[0.04]' : 'bg-transparent'}
                          `}>
                            {logoUrl ? (
                              <img src={logoUrl} alt={make.name} className="h-8 w-8 object-contain opacity-90" />
                            ) : (
                              <span className="text-xl font-bold text-neutral-400">
                                {make.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                            {make.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════ STEP 2: MODEL ═══════════════ */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="mb-5 flex items-center gap-3">
                  <button
                    onClick={() => resetTo(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-neutral-500 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-neutral-400">
                      Sélectionnez le modèle
                    </p>
                    <p className="text-xs text-neutral-600">{selectedMake?.name}</p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-red-500" />
                  </div>
                ) : models.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
                    <Car size={32} className="mb-3 opacity-50" />
                    <p className="text-sm">Aucun modèle trouvé pour {selectedMake?.name}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
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
                              ? 'bg-white/[0.08] ring-1 ring-white/20'
                              : 'bg-white/[0.03] ring-1 ring-white/[0.06] hover:bg-white/[0.06] hover:ring-white/10'
                            }
                          `}
                        >
                          <div className={`
                            flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors
                            ${isSelected ? 'bg-red-600/15 text-red-500' : 'bg-white/[0.04] text-neutral-500'}
                          `}>
                            {model.name.replace(/\(.*\)/, '').trim().charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                              {model.name}
                            </div>
                            <div className="mt-1">
                              <span className="inline-flex items-center rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400">
                                {vehicleTypeLabel}
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={16} className={isSelected ? 'text-white' : 'text-neutral-600'} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════ STEP 3: ENGINE ═══════════════ */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="mb-5 flex items-center gap-3">
                  <button
                    onClick={() => resetTo(2)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-neutral-500 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-neutral-400">
                      Motorisation
                    </p>
                    <p className="text-xs text-neutral-600">
                      {selectedMake?.name} — {selectedModel?.name}
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-red-500" />
                  </div>
                ) : engines.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-5 py-12 text-center">
                    <SlidersHorizontal size={32} className="text-neutral-600" />
                    <div>
                      <p className="text-sm font-medium text-neutral-400">Aucune motorisation référencée</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Vous pouvez lancer la recherche sans préciser la motorisation.
                      </p>
                    </div>
                    {renderSearchButton()}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {engines.map((eng) => {
                        const isSelected = selectedEngine === eng.engineCode
                        const yearLabel =
                          eng.yearFrom || eng.yearTo
                            ? `${eng.yearFrom || '…'}–${eng.yearTo || '…'}`
                            : null
                        return (
                          <button
                            key={eng.engineCode}
                            onClick={() => setSelectedEngine(eng.engineCode)}
                            className={`
                              relative flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-200
                              ${isSelected
                                ? 'bg-white/[0.08] ring-1 ring-white/20'
                                : 'bg-white/[0.03] ring-1 ring-white/[0.06] hover:bg-white/[0.06] hover:ring-white/10'
                              }
                            `}
                          >
                            <div className={`
                              flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold transition-colors
                              ${isSelected ? 'bg-red-600/15 text-red-500' : 'bg-white/[0.04] text-neutral-500'}
                            `}>
                              {eng.engineCode.length > 4
                                ? eng.engineCode.substring(0, 2).toUpperCase()
                                : eng.engineCode.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                                {eng.engineCode}
                              </div>
                              {yearLabel && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400">
                                    {yearLabel}
                                  </span>
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
                      <button
                         onClick={handleSearch}
                         className="text-sm font-medium text-neutral-500 hover:text-white"
                       >
                         Passer cette étape →
                       </button>
                      {renderSearchButton(!selectedEngine)}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
