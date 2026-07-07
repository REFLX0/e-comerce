'use client'

import { useState } from 'react'
import { Car, Bike, Truck, Tractor, Search, ArrowLeft, Fuel, Gauge, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, usePathname } from 'next/navigation'
import type { FuelType } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

type VehicleType = 'automobile' | 'moto' | 'poids_lourd' | 'agricole'

const VEHICLE_TYPES = [
  { id: 'automobile' as const, icon: Car, label: 'Automobile' },
  { id: 'moto' as const, icon: Bike, label: 'Moto' },
  { id: 'poids_lourd' as const, icon: Truck, label: 'Poids Lourd' },
  { id: 'agricole' as const, icon: Tractor, label: 'Agricole' },
]

const CYLINDER_OPTIONS: Record<VehicleType, number[]> = {
  automobile: [3, 4, 6, 8],
  moto: [1, 2, 3, 4, 6],
  poids_lourd: [4, 6, 8],
  agricole: [3, 4, 6],
}

const FUEL_OPTIONS: { id: FuelType; label: string }[] = [
  { id: 'essence', label: 'Essence' },
  { id: 'diesel', label: 'Diesel' },
]

const API = process.env.NEXT_PUBLIC_API_URL ?? '/api'

interface EngineSpecFinderProps {
  onClose?: () => void
}

export function EngineSpecFinder({ onClose }: EngineSpecFinderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward
  const [vehicleType, setVehicleType] = useState<VehicleType | ''>('')
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

  const typeIcon = VEHICLE_TYPES.find(t => t.id === vehicleType)

  const variants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 30 : -30,
      scale: 0.98,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.4 }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction < 0 ? 30 : -30,
      scale: 0.98,
      transition: { duration: 0.3 }
    }),
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-brand-card/60 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
      {/* Header */}
      <div className="relative border-b border-white/10 bg-black/40 p-6 md:p-8">
        <div className="relative z-10 flex items-start gap-5 sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-accent/20 to-brand-accent/5 ring-1 ring-brand-accent/30 shadow-[0_0_20px_rgba(var(--brand-accent-rgb),0.2)]">
            <Search size={26} className="text-brand-accent" />
          </div>
          <div>
            <h2 className="mb-1.5 text-2xl font-bold tracking-tight text-white md:text-3xl">Trouver mon huile idéale</h2>
            <p className="text-sm leading-relaxed text-gray-400">Renseignez les caractéristiques de votre moteur pour obtenir nos meilleures recommandations.</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-[380px] flex-col bg-brand-card/40 p-6 md:p-8">
        {/* Progress Summary Breadcrumbs */}
        <div className="mb-8 flex items-center justify-center sm:justify-start">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs font-medium text-gray-400 shadow-inner">
            <button 
              onClick={() => resetTo(1)} 
              className={`transition-colors ${step >= 1 ? 'text-brand-accent hover:text-brand-accent/80' : 'text-gray-600 cursor-default'}`}
              disabled={step === 1}
            >
              1. Type
            </button>
            <ChevronRight size={14} className="text-gray-600" />
            <button 
              onClick={() => resetTo(2)}
              className={`transition-colors ${step >= 2 ? 'text-brand-accent hover:text-brand-accent/80' : 'text-gray-600 cursor-default'}`}
              disabled={step <= 2}
            >
              2. Cylindres
            </button>
            <ChevronRight size={14} className="text-gray-600" />
            <span className={`${step >= 3 ? 'text-white' : 'text-gray-600'}`}>3. Puissance</span>
          </div>
        </div>

        <div className="relative flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-1 flex-col"
              >
                <div className="mb-8 text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-white">Quel est votre type de véhicule ?</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {VEHICLE_TYPES.map(type => {
                    const Icon = type.icon
                    const isSelected = vehicleType === type.id
                    return (
                      <button
                        key={type.id}
                        onClick={() => selectType(type.id)}
                        className={`group relative flex flex-col items-center gap-4 rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                          isSelected 
                            ? 'border-brand-accent bg-brand-accent/10 shadow-[0_0_30px_rgba(var(--brand-accent-rgb),0.15)]' 
                            : 'border-white/10 bg-black/40 hover:border-brand-accent/40 hover:bg-brand-accent/5'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute right-3 top-3">
                            <CheckCircle2 size={18} className="text-brand-accent" />
                          </div>
                        )}
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${
                          isSelected ? 'bg-brand-accent/20 text-brand-accent' : 'bg-white/5 text-gray-400 group-hover:text-brand-accent'
                        }`}>
                          <Icon size={32} />
                        </div>
                        <span className={`text-sm font-semibold tracking-wide transition-colors ${
                          isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'
                        }`}>
                          {type.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-1 flex-col"
              >
                <div className="mb-8 flex items-center gap-4">
                  <button onClick={() => resetTo(1)} className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-gray-400 transition-all hover:border-brand-accent/50 hover:text-brand-accent">
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
                  </button>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Combien de cylindres ?</h3>
                    {typeIcon && <p className="text-sm text-gray-400 mt-1">Pour {typeIcon.label.toLowerCase()}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {cylinderChoices.map(cyl => (
                    <button
                      key={cyl}
                      onClick={() => selectCylinders(cyl)}
                      className={`group flex min-h-24 items-center justify-center rounded-xl border text-2xl font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                        cylinders === cyl
                          ? 'border-brand-accent bg-brand-accent/10 text-white shadow-[0_0_30px_rgba(var(--brand-accent-rgb),0.15)]'
                          : 'border-white/10 bg-black/40 text-gray-400 hover:border-brand-accent/40 hover:text-white'
                      }`}
                    >
                      {cyl} <span className="ml-1 text-sm font-medium text-gray-500 group-hover:text-brand-accent/60 transition-colors">cyl.</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-1 flex-col"
              >
                <div className="mb-8 flex items-center gap-4">
                  <button onClick={() => resetTo(2)} className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-gray-400 transition-all hover:border-brand-accent/50 hover:text-brand-accent">
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
                  </button>
                  <h3 className="text-xl font-semibold text-white">Dernières précisions</h3>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
                      <Gauge size={16} className="text-brand-accent" />
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
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-xl font-medium text-white placeholder-gray-600 transition-all focus:border-brand-accent focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">CV</div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
                      <Fuel size={16} className="text-brand-accent" />
                      Carburant
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {FUEL_OPTIONS.map(fuel => (
                        <button
                          key={fuel.id}
                          onClick={() => setFuelType(fuel.id)}
                          className={`flex min-h-[60px] items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold transition-all duration-200 ${
                            fuelType === fuel.id
                              ? 'border-brand-accent bg-brand-accent/10 text-white shadow-[0_0_20px_rgba(var(--brand-accent-rgb),0.1)]'
                              : 'border-white/10 bg-black/40 text-gray-400 hover:border-brand-accent/40 hover:text-white'
                          }`}
                        >
                          {fuel.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    disabled={!canSubmit}
                    className="group relative overflow-hidden rounded-xl bg-brand-accent px-8 text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <div className="relative z-10 flex items-center gap-2 font-bold">
                      <Search size={18} />
                      Voir les huiles recommandées
                    </div>
                    {/* Hover glare effect */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
