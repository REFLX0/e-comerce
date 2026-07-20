'use client'

import { useState } from 'react'
import { Car, Bike, Truck, Tractor, Search, ArrowLeft, Fuel, Gauge, Check, ChevronRight } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import type { FuelType } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

type VehicleType = 'automobile' | 'moto' | 'poids_lourd' | 'agricole'

const VEHICLE_TYPES = [
  { id: 'automobile' as const, icon: Car, label: 'Automobile', sub: 'Voiture de tourisme' },
  { id: 'moto' as const, icon: Bike, label: 'Moto', sub: '2 roues & scooters' },
  { id: 'poids_lourd' as const, icon: Truck, label: 'Poids Lourd', sub: 'Camions & utilitaires' },
  { id: 'agricole' as const, icon: Tractor, label: 'Agricole', sub: 'Tracteurs & engins' },
]

const CYLINDER_OPTIONS: Record<VehicleType, number[]> = {
  automobile: [3, 4, 6, 8],
  moto: [1, 2, 3, 4, 6],
  poids_lourd: [4, 6, 8],
  agricole: [3, 4, 6],
}

const FUEL_OPTIONS: { id: FuelType; label: string; desc: string }[] = [
  { id: 'essence', label: 'Essence', desc: 'Moteur à essence' },
  { id: 'diesel', label: 'Diesel', desc: 'Moteur diesel' },
]

interface EngineSpecFinderProps {
  onClose?: () => void
  initialVehicleType?: VehicleType | null
}

export function EngineSpecFinder({ onClose, initialVehicleType }: EngineSpecFinderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  
  const [step, setStep] = useState(initialVehicleType ? 2 : 1)
  const [direction, setDirection] = useState(1)
  const [vehicleType, setVehicleType] = useState<VehicleType | ''>(initialVehicleType ?? '')
  const [cylinders, setCylinders] = useState<number | ''>('')
  const [power, setPower] = useState<number | ''>('')
  const [fuelType, setFuelType] = useState<FuelType | ''>('')

  const cylinderChoices = vehicleType ? CYLINDER_OPTIONS[vehicleType] : []
  const canSubmit = vehicleType && fuelType && cylinders !== '' && power !== ''

  const navigateToStep = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1)
    setStep(newStep)
  }

  const selectType = (type: VehicleType) => {
    setVehicleType(type)
    setCylinders('')
    setPower('')
    setFuelType('')
    navigateToStep(2)
  }

  const selectCylinders = (value: number) => {
    setCylinders(value)
    if (step === 2) navigateToStep(3)
  }

  const resetTo = (targetStep: number) => {
    if (targetStep >= step) return
    navigateToStep(targetStep)
    if (targetStep <= 1) {
      setVehicleType('')
      setCylinders('')
      setPower('')
      setFuelType('')
    }
    if (targetStep <= 2) {
      setCylinders('')
      setPower('')
      setFuelType('')
    }
  }

  const handleSearch = () => {
    if (!canSubmit) return
    const params = new URLSearchParams()
    params.set('vehicleType', vehicleType)
    params.set('cylinders', String(cylinders))
    params.set('power', String(power))
    params.set('fuelType', fuelType)
    if (onClose) onClose()
    router.push(`/${locale}/catalogue?${params.toString()}`)
  }

  const selectedVehicleConfig = VEHICLE_TYPES.find(t => t.id === vehicleType)

  const variants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 30 : -30,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.25, ease: 'easeOut' as const }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction < 0 ? 30 : -30,
      transition: { duration: 0.2, ease: 'easeIn' as const }
    }),
  }

  const STEPS = ['Type', 'Cylindres', 'Puissance']

  return (
    <div
      className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white"
      style={{ border: '1px solid rgba(0,0,0,0.1)' }}
    >
      {/* Step indicator — only shown in standalone mode */}
      {!initialVehicleType && (
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
      )}

      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Trouver mon huile
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Renseignez les caractéristiques de votre moteur
            </p>
          </div>

          {/* Step indicator dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {STEPS.map((label, i) => {
              const s = i + 1
              const isCompleted = s < step
              const isActive = s === step
              return (
                <div key={s} className="flex items-center gap-1.5">
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
                  {i < 2 && <ChevronRight size={12} className="text-gray-300" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-[320px] flex-col px-6 py-6 md:px-8">
        <AnimatePresence mode="wait" custom={direction}>
          {/* STEP 1: Vehicle Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <p className="mb-5 text-sm font-medium text-gray-600">
                Quel type de véhicule ?
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {VEHICLE_TYPES.map(type => {
                  const Icon = type.icon
                  const isSelected = vehicleType === type.id
                  return (
                    <button
                      key={type.id}
                      onClick={() => selectType(type.id)}
                      className={`
                        group relative flex flex-col items-center gap-3 rounded-xl p-5 transition-all duration-200
                        ${isSelected
                          ? 'bg-brand-primary/5 ring-1 ring-brand-primary/20'
                          : 'bg-white ring-1 ring-gray-200 hover:bg-gray-100 hover:ring-gray-300'
                        }
                      `}
                    >
                      <div
                        className={`
                          flex h-12 w-12 items-center justify-center rounded-lg transition-colors
                          ${isSelected ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-50 text-gray-500 group-hover:text-gray-800'}
                        `}
                      >
                        <Icon size={24} />
                      </div>
                      <div className="text-center">
                        <span className={`block text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                          {type.label}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-gray-400">
                          {type.sub}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Cylinders */}
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
                  onClick={() => initialVehicleType ? (onClose?.()) : resetTo(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 ring-1 ring-gray-200 transition-colors hover:bg-brand-primary/5 hover:text-gray-900"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Combien de cylindres ?
                  </p>
                  {selectedVehicleConfig && (
                    <p className="text-xs text-gray-400">{selectedVehicleConfig.label}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {cylinderChoices.map(cyl => {
                  const isSelected = cylinders === cyl
                  return (
                    <button
                      key={cyl}
                      onClick={() => selectCylinders(cyl)}
                      className={`
                        relative flex min-h-[90px] flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200
                        ${isSelected
                          ? 'bg-brand-primary/5 ring-1 ring-red-500/40'
                          : 'bg-white ring-1 ring-gray-200 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span className={`text-2xl font-bold tabular-nums ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                        {cyl}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-brand-primary' : 'text-gray-300'}`}>
                        cylindres
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Power & Fuel */}
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 ring-1 ring-gray-200 transition-colors hover:bg-brand-primary/5 hover:text-gray-900"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Dernières précisions
                  </p>
                  {selectedVehicleConfig && (
                    <p className="text-xs text-gray-400">
                      {selectedVehicleConfig.label} — {cylinders} cyl.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Power input */}
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <Gauge size={13} />
                    Puissance (CV)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={2000}
                      value={power}
                      onChange={e => setPower(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Ex: 110"
                      className="w-full rounded-xl bg-gray-50 px-4 py-3.5 text-lg font-semibold text-gray-900 placeholder-neutral-700 outline-none ring-1 ring-gray-200 transition-all focus:ring-red-500/40"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      CV
                    </div>
                  </div>
                </div>

                {/* Fuel type */}
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <Fuel size={13} />
                    Carburant
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {FUEL_OPTIONS.map(fuel => {
                      const isSelected = fuelType === fuel.id
                      return (
                        <button
                          key={fuel.id}
                          onClick={() => setFuelType(fuel.id)}
                          className={`
                            flex flex-col items-center justify-center gap-1 rounded-xl py-4 transition-all duration-200
                            ${isSelected
                              ? 'bg-brand-primary/5 ring-1 ring-red-500/40'
                              : 'bg-white ring-1 ring-gray-200 hover:bg-gray-100'
                            }
                          `}
                        >
                          <span className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                            {fuel.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSearch}
                  disabled={!canSubmit}
                  className="flex items-center gap-2.5 rounded-xl bg-[#E10600] px-6 py-3 text-sm font-semibold text-gray-900 transition-all duration-200 hover:bg-[#c80500] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Search size={16} />
                  Voir les huiles recommandées
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
