'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Search, ArrowLeft, Car, ChevronRight, CheckCircle2,
  AlertCircle, Loader2, SlidersHorizontal, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, usePathname } from 'next/navigation'
import { productsApi } from '@/lib/api/products'
import type { VehicleMake, VehicleModel, VehicleEngine } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

interface VehicleFinderProps {
  onClose?: () => void
}

const STEP_LABELS = ['Marque', 'Modèle', 'Motorisation']

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
    initial: (d: number) => ({ opacity: 0, x: d > 0 ? 30 : -30, scale: 0.98 }),
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4 } },
    exit: (d: number) => ({ opacity: 0, x: d < 0 ? 30 : -30, scale: 0.98, transition: { duration: 0.3 } }),
  }

  const renderStepIndicator = (current: number) => (
    <div className="mb-8 flex items-center justify-center sm:justify-start">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs font-medium text-gray-400 shadow-inner">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1
          const isActive = stepNum === current
          const isDone = stepNum < current
          const canClick = stepNum < current
          return (
            <span key={label} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight size={14} className="text-gray-600" />}
              {canClick ? (
                <button
                  onClick={() => resetTo(stepNum)}
                  className="transition-colors text-brand-accent hover:text-brand-accent/80"
                >
                  {label}
                </button>
              ) : (
                <span className={isActive ? 'text-white font-bold' : 'text-gray-600'}>
                  {label}
                </span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )

  const renderSearchButton = (disabled = false) => (
    <Button
      onClick={handleSearch}
      size="lg"
      disabled={disabled}
      className="group relative overflow-hidden rounded-xl bg-brand-accent px-8 text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
    >
      <div className="relative z-10 flex items-center gap-2 font-bold">
        <Search size={18} />
        Voir les huiles compatibles
      </div>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
    </Button>
  )

  return (
    <div className="relative z-10 mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-brand-card/60 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
      <div className="relative border-b border-white/10 bg-black/40 p-6 md:p-8">
        <div className="relative z-10 flex items-start gap-5 sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-accent/20 to-brand-accent/5 ring-1 ring-brand-accent/30 shadow-[0_0_20px_rgba(var(--brand-accent-rgb),0.2)]">
            <Car size={26} className="text-brand-accent" />
          </div>
          <div>
            <h2 className="mb-1.5 text-2xl font-bold tracking-tight text-white md:text-3xl">Recherche par véhicule</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Sélectionnez votre marque, modèle et motorisation pour trouver les huiles compatibles.
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-[380px] flex-col bg-brand-card/40 p-6 md:p-8">
        {renderStepIndicator(step)}

        <div className="relative flex-1">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
            >
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </motion.div>
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
                <div className="mb-6 text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-white">Quelle est la marque de votre véhicule ?</h3>
                </div>

                {/* Search input */}
                <div className="relative mb-6">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={makeSearch}
                    onChange={e => setMakeSearch(e.target.value)}
                    placeholder="Rechercher une marque..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-10 text-sm text-white placeholder-gray-600 transition-all focus:border-brand-accent focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                  {makeSearch && (
                    <button
                      onClick={() => setMakeSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {loading && makes.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-brand-accent" />
                  </div>
                ) : filteredMakes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Search size={40} className="mb-3 text-gray-600" />
                    <p className="text-sm text-gray-500">Aucune marque trouvée pour "{makeSearch}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {filteredMakes.map(make => {
                      const isSelected = selectedMake?.id === make.id
                      return (
                        <button
                          key={make.id}
                          onClick={() => selectMake(make)}
                          className={`group relative flex flex-col items-center gap-3 rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                            isSelected
                              ? 'border-brand-accent bg-brand-accent/10 shadow-[0_0_30px_rgba(var(--brand-accent-rgb),0.15)]'
                              : 'border-white/10 bg-black/40 hover:border-brand-accent/40 hover:bg-brand-accent/5'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute right-2 top-2">
                              <CheckCircle2 size={16} className="text-brand-accent" />
                            </div>
                          )}
                          <div className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold transition-all duration-300 group-hover:scale-110 ${
                            isSelected
                              ? 'bg-brand-accent/20 text-brand-accent'
                              : 'bg-white/5 text-gray-500 group-hover:text-brand-accent'
                          }`}>
                            {make.name.charAt(0).toUpperCase()}
                          </div>
                          <span className={`text-sm font-semibold tracking-wide text-center leading-tight transition-colors ${
                            isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'
                          }`}>
                            {make.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                <div className="mt-4 text-center text-xs text-gray-600">
                  {filteredMakes.length} marque{filteredMakes.length !== 1 ? 's' : ''} trouvée{filteredMakes.length !== 1 ? 's' : ''}
                </div>
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
                <div className="mb-6 flex items-center gap-4">
                  <button
                    onClick={() => resetTo(1)}
                    className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-gray-400 transition-all hover:border-brand-accent/50 hover:text-brand-accent"
                  >
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-white">Sélectionnez le modèle</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                      <CheckCircle2 size={12} className="text-green-500" />
                      <span>{selectedMake?.name}</span>
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-brand-accent" />
                  </div>
                ) : models.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Car size={40} className="mb-3 text-gray-600" />
                    <p className="text-sm text-gray-500">Aucun modèle trouvé pour {selectedMake?.name}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {models.map(model => {
                      const isSelected = selectedModel?.id === model.id
                      const vehicleTypeLabel =
                        model.vehicleType === 'poids_lourd' ? 'PL' :
                        model.vehicleType === 'agricole' ? 'AG' :
                        model.vehicleType === 'moto' ? 'MO' : 'VL'
                      return (
                        <button
                          key={model.id}
                          onClick={() => selectModel(model)}
                          className={`group relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
                            isSelected
                              ? 'border-brand-accent bg-brand-accent/10 shadow-[0_0_30px_rgba(var(--brand-accent-rgb),0.15)]'
                              : 'border-white/10 bg-black/40 hover:border-brand-accent/40 hover:bg-brand-accent/5'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute right-3 top-3">
                              <CheckCircle2 size={16} className="text-brand-accent" />
                            </div>
                          )}
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                            isSelected
                              ? 'bg-brand-accent/20 text-brand-accent'
                              : 'bg-white/5 text-gray-500 group-hover:text-brand-accent'
                          }`}>
                            {model.name.replace(/\(.*\)/, '').trim().charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-semibold truncate transition-colors ${
                              isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                            }`}>
                              {model.name}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                                {vehicleTypeLabel}
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="shrink-0 text-gray-600 group-hover:text-brand-accent transition-colors" />
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
                <div className="mb-6 flex items-center gap-4">
                  <button
                    onClick={() => resetTo(2)}
                    className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-gray-400 transition-all hover:border-brand-accent/50 hover:text-brand-accent"
                  >
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-white">Motorisation</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                      <CheckCircle2 size={12} className="text-green-500" />
                      <span>{selectedMake?.name} — {selectedModel?.name}</span>
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-brand-accent" />
                  </div>
                ) : engines.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center">
                    <SlidersHorizontal size={40} className="text-gray-600" />
                    <div>
                      <p className="text-base text-gray-400 font-medium">Aucune motorisation référencée</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Vous pouvez lancer la recherche sans préciser la motorisation.
                      </p>
                    </div>
                    {renderSearchButton()}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {engines.map(eng => {
                        const isSelected = selectedEngine === eng.engineCode
                        const yearLabel =
                          eng.yearFrom || eng.yearTo
                            ? `${eng.yearFrom || '…'}–${eng.yearTo || '…'}`
                            : null
                        return (
                          <button
                            key={eng.engineCode}
                            onClick={() => setSelectedEngine(eng.engineCode)}
                            className={`group relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
                              isSelected
                                ? 'border-brand-accent bg-brand-accent/10 shadow-[0_0_30px_rgba(var(--brand-accent-rgb),0.15)] ring-1 ring-brand-accent/30'
                                : 'border-white/10 bg-black/40 hover:border-brand-accent/40 hover:bg-brand-accent/5'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute right-3 top-3">
                                <CheckCircle2 size={16} className="text-brand-accent" />
                              </div>
                            )}
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold transition-colors ${
                              isSelected
                                ? 'bg-brand-accent/20 text-brand-accent'
                                : 'bg-white/5 text-gray-500 group-hover:text-brand-accent'
                            }`}>
                              {eng.engineCode.length > 4
                                ? eng.engineCode.substring(0, 2).toUpperCase()
                                : eng.engineCode.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`text-sm font-semibold truncate transition-colors ${
                                isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                              }`}>
                                {eng.engineCode}
                              </div>
                              {yearLabel && (
                                <div className="mt-1 flex items-center gap-1">
                                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-500">
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
                        className="text-sm font-medium text-gray-500 transition-colors hover:text-white"
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
