'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Search, ArrowLeft, Car, ChevronRight, CheckCircle2,
  AlertCircle, Loader2, SlidersHorizontal, X, Zap
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { productsApi } from '@/lib/api/products'
import type { VehicleMake, VehicleModel, VehicleEngine } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

interface VehicleFinderProps {
  onClose?: () => void
}

const STEP_LABELS = ['Marque', 'Modèle', 'Motorisation']

// Assign a consistent accent color per make (by index mod colors length)
const BRAND_COLORS = [
  { bg: 'rgba(59,130,246,0.18)', border: 'rgba(59,130,246,0.4)', text: '#60a5fa', glow: 'rgba(59,130,246,0.25)' },
  { bg: 'rgba(168,85,247,0.18)', border: 'rgba(168,85,247,0.4)', text: '#c084fc', glow: 'rgba(168,85,247,0.25)' },
  { bg: 'rgba(249,115,22,0.18)', border: 'rgba(249,115,22,0.4)', text: '#fb923c', glow: 'rgba(249,115,22,0.25)' },
  { bg: 'rgba(34,197,94,0.18)', border: 'rgba(34,197,94,0.4)', text: '#4ade80', glow: 'rgba(34,197,94,0.25)' },
  { bg: 'rgba(236,72,153,0.18)', border: 'rgba(236,72,153,0.4)', text: '#f472b6', glow: 'rgba(236,72,153,0.25)' },
  { bg: 'rgba(20,184,166,0.18)', border: 'rgba(20,184,166,0.4)', text: '#2dd4bf', glow: 'rgba(20,184,166,0.25)' },
  { bg: 'rgba(234,179,8,0.18)', border: 'rgba(234,179,8,0.4)', text: '#facc15', glow: 'rgba(234,179,8,0.25)' },
  { bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.4)', text: '#f87171', glow: 'rgba(239,68,68,0.25)' },
]

function getBrandColor(index: number) {
  return BRAND_COLORS[index % BRAND_COLORS.length]!
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
    initial: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40, scale: 0.97 }),
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
    exit: (d: number) => ({ opacity: 0, x: d < 0 ? 40 : -40, scale: 0.97, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } }),
  }

  const renderSearchButton = (disabled = false) => (
    <button
      onClick={handleSearch}
      disabled={disabled}
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl px-8 py-4 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      style={{
        background: !disabled
          ? 'linear-gradient(135deg, #E10600 0%, #b80500 100%)'
          : 'rgba(255,255,255,0.06)',
        color: '#fff',
        boxShadow: !disabled
          ? '0 8px 32px rgba(225,6,0,0.4), 0 2px 8px rgba(0,0,0,0.3)'
          : 'none',
      }}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
      <Search size={17} />
      <span>Voir les huiles compatibles</span>
      <Zap size={15} className="opacity-80" />
    </button>
  )

  return (
    <div
      className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(145deg, rgba(20,20,25,0.95) 0%, rgba(12,12,16,0.98) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset',
      }}
    >
      {/* Ambient top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(225,6,0,0.5), transparent)' }}
      />

      {/* Header */}
      <div
        className="relative border-b p-6 md:p-8"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 0% 0%, rgba(225,6,0,0.15) 0%, transparent 60%)',
          }}
        />
        <div className="relative z-10 flex items-center gap-5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(225,6,0,0.2) 0%, rgba(225,6,0,0.05) 100%)',
              border: '1px solid rgba(225,6,0,0.25)',
              boxShadow: '0 0 30px rgba(225,6,0,0.15)',
            }}
          >
            <Car size={24} className="text-[#E10600]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Recherche par véhicule
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Marque → Modèle → Motorisation pour trouver les huiles compatibles.
            </p>
          </div>
        </div>

        {/* Step progress */}
        <div className="relative z-10 mt-5">
          <div className="flex items-center gap-0">
            {STEP_LABELS.map((label, idx) => {
              const s = idx + 1
              const isCompleted = s < step
              const isActive = s === step
              const canClick = s < step
              return (
                <div key={label} className="flex items-center flex-1">
                  <button
                    onClick={() => canClick && resetTo(s)}
                    disabled={!canClick && !isActive}
                    style={{ cursor: canClick ? 'pointer' : 'default' }}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
                      style={{
                        background: isCompleted
                          ? 'linear-gradient(135deg, #E10600, #b80500)'
                          : isActive
                          ? 'rgba(225,6,0,0.15)'
                          : 'rgba(255,255,255,0.05)',
                        border: isCompleted
                          ? '1px solid #E10600'
                          : isActive
                          ? '1px solid rgba(225,6,0,0.6)'
                          : '1px solid rgba(255,255,255,0.1)',
                        color: isCompleted ? '#fff' : isActive ? '#E10600' : 'rgba(255,255,255,0.3)',
                        boxShadow: isCompleted ? '0 0 12px rgba(225,6,0,0.3)' : 'none',
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={14} /> : s}
                    </div>
                    <span
                      className="text-xs font-medium transition-colors"
                      style={{
                        color: isCompleted
                          ? '#E10600'
                          : isActive
                          ? '#fff'
                          : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      {label}
                    </span>
                  </button>
                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      className="flex-1 mx-3 h-px transition-all duration-500"
                      style={{
                        background: isCompleted
                          ? 'linear-gradient(90deg, #E10600, rgba(225,6,0,0.3))'
                          : 'rgba(255,255,255,0.07)',
                      }}
                    />
                  )}
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
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-xl p-3 text-sm text-red-400"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
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
                <div className="mb-5">
                  <h3 className="text-xl font-semibold text-white">Quelle est la marque de votre véhicule ?</h3>
                  <p className="mt-1 text-sm text-gray-500">Choisissez parmi les marques disponibles</p>
                </div>

                {/* Search input */}
                <div className="relative mb-5">
                  <Search
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                  />
                  <input
                    type="text"
                    value={makeSearch}
                    onChange={e => setMakeSearch(e.target.value)}
                    placeholder="Rechercher une marque..."
                    className="w-full rounded-2xl py-3 pl-11 pr-10 text-sm text-white placeholder-gray-700 outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: makeSearch ? '1px solid rgba(225,6,0,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    }}
                  />
                  {makeSearch && (
                    <button
                      onClick={() => setMakeSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100 opacity-60"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {loading && makes.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-[#E10600]" />
                  </div>
                ) : filteredMakes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Search size={40} className="mb-3 text-gray-700" />
                    <p className="text-sm text-gray-600">Aucune marque trouvée pour &ldquo;{makeSearch}&rdquo;</p>
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 max-h-[320px] overflow-y-auto pr-1"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
                  >
                    {filteredMakes.map((make, idx) => {
                      const isSelected = selectedMake?.id === make.id
                      const color = getBrandColor(idx)
                      return (
                        <button
                          key={make.id}
                          onClick={() => selectMake(make)}
                          className="group relative flex flex-col items-center gap-3 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1"
                          style={{
                            background: isSelected
                              ? color.bg
                              : 'rgba(255,255,255,0.03)',
                            border: isSelected
                              ? `1px solid ${color.border}`
                              : '1px solid rgba(255,255,255,0.06)',
                            boxShadow: isSelected
                              ? `0 0 30px ${color.glow}, 0 8px 24px rgba(0,0,0,0.3)`
                              : '0 2px 8px rgba(0,0,0,0.2)',
                          }}
                        >
                          {isSelected && (
                            <div className="absolute right-2 top-2">
                              <CheckCircle2 size={14} style={{ color: color.text }} />
                            </div>
                          )}
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black transition-all duration-300 group-hover:scale-110"
                            style={{
                              background: isSelected ? color.bg : 'rgba(255,255,255,0.05)',
                              border: isSelected ? `1px solid ${color.border}` : '1px solid rgba(255,255,255,0.07)',
                              color: isSelected ? color.text : 'rgba(255,255,255,0.3)',
                              boxShadow: isSelected ? `0 0 20px ${color.glow}` : 'none',
                            }}
                          >
                            {make.name.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className="text-xs font-semibold tracking-wide text-center leading-tight transition-colors"
                            style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)' }}
                          >
                            {make.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                <div className="mt-3 text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {filteredMakes.length} marque{filteredMakes.length !== 1 ? 's' : ''} disponible{filteredMakes.length !== 1 ? 's' : ''}
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
                <div className="mb-5 flex items-center gap-4">
                  <button
                    onClick={() => resetTo(1)}
                    className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(225,6,0,0.5)'
                      ;(e.currentTarget as HTMLElement).style.color = '#E10600'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
                      ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'
                    }}
                  >
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-white">Sélectionnez le modèle</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                      <CheckCircle2 size={12} className="text-green-500" />
                      <span>{selectedMake?.name}</span>
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-[#E10600]" />
                  </div>
                ) : models.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Car size={40} className="mb-3 text-gray-700" />
                    <p className="text-sm text-gray-600">Aucun modèle trouvé pour {selectedMake?.name}</p>
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[320px] overflow-y-auto pr-1"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
                  >
                    {models.map((model, idx) => {
                      const isSelected = selectedModel?.id === model.id
                      const color = getBrandColor(idx)
                      const vehicleTypeLabel =
                        model.vehicleType === 'poids_lourd' ? 'PL' :
                        model.vehicleType === 'agricole' ? 'AG' :
                        model.vehicleType === 'moto' ? 'MO' : 'VL'
                      return (
                        <button
                          key={model.id}
                          onClick={() => selectModel(model)}
                          className="group relative flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5"
                          style={{
                            background: isSelected
                              ? 'linear-gradient(135deg, rgba(225,6,0,0.15) 0%, rgba(225,6,0,0.05) 100%)'
                              : 'rgba(255,255,255,0.03)',
                            border: isSelected
                              ? '1px solid rgba(225,6,0,0.45)'
                              : '1px solid rgba(255,255,255,0.06)',
                            boxShadow: isSelected
                              ? '0 0 30px rgba(225,6,0,0.2), 0 8px 24px rgba(0,0,0,0.3)'
                              : '0 2px 8px rgba(0,0,0,0.2)',
                          }}
                        >
                          {isSelected && (
                            <div className="absolute right-3 top-3">
                              <CheckCircle2 size={15} className="text-[#E10600]" />
                            </div>
                          )}
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-colors"
                            style={{
                              background: isSelected
                                ? 'rgba(225,6,0,0.18)'
                                : color.bg,
                              border: isSelected
                                ? '1px solid rgba(225,6,0,0.4)'
                                : `1px solid ${color.border}`,
                              color: isSelected ? '#E10600' : color.text,
                            }}
                          >
                            {model.name.replace(/\(.*\)/, '').trim().charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className="text-sm font-bold truncate transition-colors"
                              style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)' }}
                            >
                              {model.name}
                            </div>
                            <div className="mt-1">
                              <span
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                style={{
                                  background: 'rgba(255,255,255,0.05)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  color: 'rgba(255,255,255,0.3)',
                                }}
                              >
                                {vehicleTypeLabel}
                              </span>
                            </div>
                          </div>
                          <ChevronRight
                            size={16}
                            className="shrink-0 transition-colors"
                            style={{ color: isSelected ? '#E10600' : 'rgba(255,255,255,0.2)' }}
                          />
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
                <div className="mb-5 flex items-center gap-4">
                  <button
                    onClick={() => resetTo(2)}
                    className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(225,6,0,0.5)'
                      ;(e.currentTarget as HTMLElement).style.color = '#E10600'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
                      ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'
                    }}
                  >
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-white">Motorisation</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                      <CheckCircle2 size={12} className="text-green-500" />
                      <span>{selectedMake?.name} — {selectedModel?.name}</span>
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-[#E10600]" />
                  </div>
                ) : engines.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center">
                    <SlidersHorizontal size={40} className="text-gray-700" />
                    <div>
                      <p className="text-base font-medium text-gray-500">Aucune motorisation référencée</p>
                      <p className="mt-1 text-sm text-gray-600">
                        Vous pouvez lancer la recherche sans préciser la motorisation.
                      </p>
                    </div>
                    {renderSearchButton()}
                  </div>
                ) : (
                  <>
                    <div
                      className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[300px] overflow-y-auto pr-1"
                      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
                    >
                      {engines.map((eng, idx) => {
                        const isSelected = selectedEngine === eng.engineCode
                        const color = getBrandColor(idx)
                        const yearLabel =
                          eng.yearFrom || eng.yearTo
                            ? `${eng.yearFrom || '…'}–${eng.yearTo || '…'}`
                            : null
                        return (
                          <button
                            key={eng.engineCode}
                            onClick={() => setSelectedEngine(eng.engineCode)}
                            className="group relative flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5"
                            style={{
                              background: isSelected
                                ? 'linear-gradient(135deg, rgba(225,6,0,0.15) 0%, rgba(225,6,0,0.05) 100%)'
                                : 'rgba(255,255,255,0.03)',
                              border: isSelected
                                ? '1px solid rgba(225,6,0,0.45)'
                                : '1px solid rgba(255,255,255,0.06)',
                              boxShadow: isSelected
                                ? '0 0 30px rgba(225,6,0,0.2), 0 8px 24px rgba(0,0,0,0.3)'
                                : '0 2px 8px rgba(0,0,0,0.2)',
                            }}
                          >
                            {isSelected && (
                              <div className="absolute right-3 top-3">
                                <CheckCircle2 size={15} className="text-[#E10600]" />
                              </div>
                            )}
                            <div
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-black transition-colors"
                              style={{
                                background: isSelected ? 'rgba(225,6,0,0.18)' : color.bg,
                                border: isSelected ? '1px solid rgba(225,6,0,0.4)' : `1px solid ${color.border}`,
                                color: isSelected ? '#E10600' : color.text,
                              }}
                            >
                              {eng.engineCode.length > 4
                                ? eng.engineCode.substring(0, 2).toUpperCase()
                                : eng.engineCode.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className="text-sm font-bold truncate transition-colors"
                                style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)' }}
                              >
                                {eng.engineCode}
                              </div>
                              {yearLabel && (
                                <div className="mt-1">
                                  <span
                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                                    style={{
                                      background: 'rgba(255,255,255,0.05)',
                                      border: '1px solid rgba(255,255,255,0.08)',
                                      color: 'rgba(255,255,255,0.3)',
                                    }}
                                  >
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
                        className="text-sm font-medium transition-colors hover:text-white"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
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
