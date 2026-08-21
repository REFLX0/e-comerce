'use client'

import { useState } from 'react'
import { Car, Bike, Truck, Tractor, Search, ArrowLeft, Check, ChevronRight, RotateCcw, Sparkles } from 'lucide-react'
import { EngineSpecFinder } from './EngineSpecFinder'
import { VehicleFinder } from './VehicleFinder'
import { motion, AnimatePresence } from 'framer-motion'

type VehicleType = 'automobile' | 'moto' | 'poids_lourd' | 'agricole' | 'marine'
type SearchMode = 'vehicle' | 'specs'

const VEHICLE_TYPES = [
  { id: 'automobile' as const, image: 'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?q=80&w=600', fallbackIcon: Car, label: 'Automobile', sub: 'Voitures de tourisme & SUV' },
  { id: 'moto' as const, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600', fallbackIcon: Bike, label: 'Moto', sub: '2 roues & scooters' },
  { id: 'marine' as const, image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=600', fallbackIcon: Sparkles, label: 'Marine', sub: 'Bateaux nautiques' },
  { id: 'poids_lourd' as const, image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600', fallbackIcon: Truck, label: 'Poids Lourd', sub: 'Camions & utilitaires' },
  { id: 'agricole' as const, image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600', fallbackIcon: Tractor, label: 'Agricole', sub: 'Tracteurs & engins' },
]

export function OilFinderTabs() {
  const [step, setStep] = useState(1)
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null)
  const [searchMode, setSearchMode] = useState<SearchMode | null>(null)

  const progress = (step / 3) * 100
  const selectedVehicle = VEHICLE_TYPES.find((type) => type.id === vehicleType)

  const handleSelectType = (type: VehicleType) => {
    setVehicleType(type)
    setStep(2)
  }

  const handleSelectMode = (mode: SearchMode) => {
    setSearchMode(mode)
    setStep(3)
  }

  const handleReset = () => {
    setStep(1)
    setVehicleType(null)
    setSearchMode(null)
  }

  return (
    <div id="oil-finder" className="mx-auto w-full max-w-6xl px-4">
      <div className="overflow-hidden rounded-[2rem] border border-brand-primary/10 bg-white shadow-[0_24px_70px_rgba(22,37,76,0.12)]">
        <div className="border-b border-brand-primary/10 bg-[linear-gradient(110deg,#16254c_0%,#1f356b_68%,#283e79_100%)] px-5 py-5 text-white sm:px-8 md:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-accent text-brand-primary shadow-lg shadow-black/10">
                <Sparkles size={20} strokeWidth={2.4} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-accent-light">Assistant de sélection</p>
                <p className="mt-1 text-sm text-white/75">Une recommandation basée uniquement sur les critères que vous renseignez.</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20 sm:self-auto"
            >
              <RotateCcw size={14} />
              Recommencer
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
            {['Véhicule', 'Méthode', 'Recherche'].map((label, index) => {
              const stage = index + 1
              const isComplete = stage < step
              const isCurrent = stage === step
              return (
                <div key={label} className="flex min-w-0 items-center gap-2">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isComplete ? 'bg-brand-accent text-brand-primary' : isCurrent ? 'bg-white text-brand-primary' : 'bg-white/10 text-white/55'}`}>
                    {isComplete ? <Check size={14} strokeWidth={3} /> : stage}
                  </div>
                  <span className={`hidden truncate text-xs font-semibold sm:block ${isCurrent || isComplete ? 'text-white' : 'text-white/50'}`}>{label}</span>
                  {stage < 3 && <div className={`ml-auto h-px flex-1 ${isComplete ? 'bg-brand-accent' : 'bg-white/15'}`} />}
                </div>
              )
            })}
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full rounded-full bg-brand-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="relative bg-[radial-gradient(circle_at_top_right,rgba(212,167,106,0.12),transparent_30%),#fff]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8 md:p-10"
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-accent">Étape 1 · véhicule</p>
              <h3 className="text-2xl font-bold tracking-tight text-brand-primary">
                Quel type de véhicule ?
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                Sélectionnez la catégorie de votre véhicule pour commencer
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {VEHICLE_TYPES.map((type) => {
                  const FallbackIcon = type.fallbackIcon
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleSelectType(type.id)}
                      className="group relative flex min-h-48 flex-col items-center justify-end overflow-hidden rounded-2xl border border-slate-200 bg-white text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                    >
                      {/* Image Background */}
                      <div className="absolute inset-0 z-0 bg-gray-100">
                        {/* We use an img tag instead of next/image here just in case the file doesn't exist yet, so we can use a fallback easily */}
                        <img 
                          src={type.image} 
                          alt={type.label}
                          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        {/* Fallback Icon if image fails to load */}
                        <div className="hidden flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                          <FallbackIcon size={40} />
                        </div>
                      </div>

                      {/* Content Overlay */}
                      <div className="relative w-full z-10 bg-white pt-3 pb-3 px-2 border-t border-gray-100/50">
                        <span className="block text-sm font-bold text-[#16254c]">
                          {type.label}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-gray-500">
                          {type.sub}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && vehicleType && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8 md:p-10"
            >
              <div className="mb-7 flex items-start gap-3">
                <button
                  onClick={handleReset}
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-gray-500 transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
                  aria-label="Retour au choix du véhicule"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-accent">Étape 2 · méthode</p>
                  <h3 className="text-2xl font-bold tracking-tight text-brand-primary">
                    Comment rechercher ?
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedVehicle?.label} · Choisissez le parcours le plus adapté aux informations dont vous disposez.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => handleSelectMode('vehicle')}
                  className="group flex min-h-56 flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-brand-primary/35 hover:shadow-[0_16px_30px_rgba(22,37,76,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/15"><Car size={24} /></div>
                  <div className="mt-auto">
                    <span className="block text-lg font-bold text-brand-primary">Par véhicule</span>
                    <span className="mt-2 block text-sm leading-6 text-gray-500">Sélectionnez marque, modèle et motorisation pour une recherche précise.</span>
                    <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-primary">Commencer <ChevronRight size={14} /></span>
                  </div>
                </button>
                <button
                  onClick={() => handleSelectMode('specs')}
                  className="group flex min-h-56 flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-brand-primary/35 hover:shadow-[0_16px_30px_rgba(22,37,76,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent text-brand-primary shadow-lg shadow-brand-accent/20"><Search size={24} /></div>
                  <div className="mt-auto">
                    <span className="block text-lg font-bold text-brand-primary">Par caractéristiques</span>
                    <span className="mt-2 block text-sm leading-6 text-gray-500">Renseignez cylindres, puissance et carburant si vous ne connaissez pas votre motorisation.</span>
                    <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-primary">Commencer <ChevronRight size={14} /></span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && searchMode === 'vehicle' && (
            <motion.div
              key="vehicle-finder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="border-b border-slate-100 bg-slate-50/70 p-4 md:px-6">
                <button
                  onClick={() => { setStep(2); setSearchMode(null) }}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Retour
                </button>
              </div>
              <VehicleFinder onClose={() => {}} initialVehicleType={vehicleType} />
            </motion.div>
          )}

          {step === 3 && searchMode === 'specs' && (
            <motion.div
              key="specs-finder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="border-b border-slate-100 bg-slate-50/70 p-4 md:px-6">
                <button
                  onClick={() => { setStep(2); setSearchMode(null) }}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Retour
                </button>
              </div>
              <EngineSpecFinder onClose={() => {}} initialVehicleType={vehicleType !== 'marine' ? vehicleType : null} />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
