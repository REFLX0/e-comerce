'use client'

import { useState } from 'react'
import { Car, Bike, Truck, Tractor, Search, ArrowLeft, Check } from 'lucide-react'
import { EngineSpecFinder } from './EngineSpecFinder'
import { VehicleFinder } from './VehicleFinder'
import { motion, AnimatePresence } from 'framer-motion'

type VehicleType = 'automobile' | 'moto' | 'poids_lourd' | 'agricole'
type SearchMode = 'vehicle' | 'specs'

const VEHICLE_TYPES = [
  { id: 'automobile' as const, icon: Car, label: 'Automobile', sub: 'Voiture de tourisme' },
  { id: 'moto' as const, icon: Bike, label: 'Moto', sub: '2 roues & scooters' },
  { id: 'poids_lourd' as const, icon: Truck, label: 'Poids Lourd', sub: 'Camions & utilitaires' },
  { id: 'agricole' as const, icon: Tractor, label: 'Agricole', sub: 'Tracteurs & engins' },
]

export function OilFinderTabs() {
  const [step, setStep] = useState(1)
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null)
  const [searchMode, setSearchMode] = useState<SearchMode | null>(null)

  const progress = (step / 3) * 100

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
    <div id="oil-finder" className="mx-auto w-full max-w-5xl px-4">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-accent">
            Étape {step} sur 3
          </span>
          <button
            onClick={handleReset}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Recommencer
          </button>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-brand-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-card">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="p-6 md:p-8"
            >
              <h3 className="text-lg font-bold text-brand-primary mb-1">
                Quel type de véhicule ?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Sélectionnez la catégorie de votre véhicule pour commencer
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {VEHICLE_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleSelectType(type.id)}
                      className="group flex flex-col items-center gap-3 rounded-xl p-5 bg-white ring-1 ring-gray-200 transition-all duration-200 hover:ring-brand-accent/40 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand-primary/5 text-brand-primary transition-colors group-hover:bg-brand-accent/10 group-hover:text-brand-accent">
                        <Icon size={28} />
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-bold text-gray-800">
                          {type.label}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-gray-400">
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
              className="p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={handleReset}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h3 className="text-lg font-bold text-brand-primary">
                    Comment rechercher ?
                  </h3>
                  <p className="text-sm text-gray-500">
                    {VEHICLE_TYPES.find(t => t.id === vehicleType)?.label} — Choisissez votre méthode
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleSelectMode('vehicle')}
                  className="flex flex-col items-center gap-4 rounded-xl p-8 bg-white ring-1 ring-gray-200 transition-all duration-200 hover:ring-brand-accent/40 hover:shadow-md hover:-translate-y-0.5"
                >
                  <Car size={40} className="text-brand-primary" />
                  <div className="text-center">
                    <span className="block text-base font-bold text-gray-800">Par véhicule</span>
                    <span className="mt-1 block text-sm text-gray-400">Marque → Modèle → Motorisation</span>
                  </div>
                </button>
                <button
                  onClick={() => handleSelectMode('specs')}
                  className="flex flex-col items-center gap-4 rounded-xl p-8 bg-white ring-1 ring-gray-200 transition-all duration-200 hover:ring-brand-accent/40 hover:shadow-md hover:-translate-y-0.5"
                >
                  <Search size={40} className="text-brand-primary" />
                  <div className="text-center">
                    <span className="block text-base font-bold text-gray-800">Par caractéristiques</span>
                    <span className="mt-1 block text-sm text-gray-400">Cylindres → Puissance → Carburant</span>
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
              <div className="p-4 md:p-6 border-b border-gray-100">
                <button
                  onClick={() => { setStep(2); setSearchMode(null) }}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Retour
                </button>
              </div>
              <VehicleFinder onClose={() => {}} />
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
              <div className="p-4 md:p-6 border-b border-gray-100">
                <button
                  onClick={() => { setStep(2); setSearchMode(null) }}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Retour
                </button>
              </div>
              <EngineSpecFinder onClose={() => {}} initialVehicleType={vehicleType} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}