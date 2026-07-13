'use client'

import { useState } from 'react'
import { Car, Bike, Truck, Tractor, Search, ArrowLeft, Fuel, Gauge, CheckCircle2, ChevronRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, usePathname } from 'next/navigation'
import type { FuelType } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

type VehicleType = 'automobile' | 'moto' | 'poids_lourd' | 'agricole'

const VEHICLE_TYPES = [
  {
    id: 'automobile' as const,
    icon: Car,
    label: 'Automobile',
    sub: 'Voiture de tourisme',
    accentColor: '#3b82f6',
    bgSelected: 'linear-gradient(145deg, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.06) 100%)',
    borderSelected: '1px solid rgba(59,130,246,0.45)',
    iconBg: 'rgba(59,130,246,0.18)',
    iconBorder: '1px solid rgba(59,130,246,0.4)',
    glowColor: 'rgba(59,130,246,0.25)',
  },
  {
    id: 'moto' as const,
    icon: Bike,
    label: 'Moto',
    sub: '2 roues & scooters',
    accentColor: '#a855f7',
    bgSelected: 'linear-gradient(145deg, rgba(168,85,247,0.18) 0%, rgba(168,85,247,0.06) 100%)',
    borderSelected: '1px solid rgba(168,85,247,0.45)',
    iconBg: 'rgba(168,85,247,0.18)',
    iconBorder: '1px solid rgba(168,85,247,0.4)',
    glowColor: 'rgba(168,85,247,0.25)',
  },
  {
    id: 'poids_lourd' as const,
    icon: Truck,
    label: 'Poids Lourd',
    sub: 'Camions & utilitaires',
    accentColor: '#f97316',
    bgSelected: 'linear-gradient(145deg, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.06) 100%)',
    borderSelected: '1px solid rgba(249,115,22,0.45)',
    iconBg: 'rgba(249,115,22,0.18)',
    iconBorder: '1px solid rgba(249,115,22,0.4)',
    glowColor: 'rgba(249,115,22,0.25)',
  },
  {
    id: 'agricole' as const,
    icon: Tractor,
    label: 'Agricole',
    sub: 'Tracteurs & engins',
    accentColor: '#22c55e',
    bgSelected: 'linear-gradient(145deg, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0.06) 100%)',
    borderSelected: '1px solid rgba(34,197,94,0.45)',
    iconBg: 'rgba(34,197,94,0.18)',
    iconBorder: '1px solid rgba(34,197,94,0.4)',
    glowColor: 'rgba(34,197,94,0.25)',
  },
]

const CYLINDER_OPTIONS: Record<VehicleType, number[]> = {
  automobile: [3, 4, 6, 8],
  moto: [1, 2, 3, 4, 6],
  poids_lourd: [4, 6, 8],
  agricole: [3, 4, 6],
}

const FUEL_OPTIONS: { id: FuelType; label: string; icon: string; desc: string }[] = [
  { id: 'essence', label: 'Essence', icon: '⛽', desc: 'Moteur à essence' },
  { id: 'diesel', label: 'Diesel', icon: '🛢️', desc: 'Moteur diesel' },
]

interface EngineSpecFinderProps {
  onClose?: () => void
}

export function EngineSpecFinder({ onClose }: EngineSpecFinderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
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

  const selectedVehicleConfig = VEHICLE_TYPES.find(t => t.id === vehicleType)

  const variants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 40 : -40,
      scale: 0.97,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.35, ease: 'easeOut' as const }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction < 0 ? 40 : -40,
      scale: 0.97,
      transition: { duration: 0.25, ease: 'easeIn' as const }
    }),
  }

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
        {/* Background decoration */}
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
            <Search size={24} className="text-[#E10600]" />
          </div>
          <div>
            <h2
              className="text-2xl font-bold tracking-tight text-white md:text-3xl"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              Trouver mon huile idéale
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Renseignez les caractéristiques de votre moteur pour obtenir les meilleures recommandations.
            </p>
          </div>
        </div>

        {/* Step progress bar */}
        <div className="relative z-10 mt-5">
          <div className="flex items-center gap-0">
            {[1, 2, 3].map((s, i) => {
              const labels = ['Type', 'Cylindres', 'Puissance']
              const isCompleted = s < step
              const isActive = s === step
              const canClick = s < step
              return (
                <div key={s} className="flex items-center flex-1">
                  <button
                    onClick={() => canClick && resetTo(s)}
                    disabled={!canClick && !isActive}
                    className="flex items-center gap-2 group"
                    style={{ cursor: canClick ? 'pointer' : 'default' }}
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
                      {labels[i]}
                    </span>
                  </button>
                  {i < 2 && (
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
      <div className="flex min-h-[360px] flex-col p-6 md:p-8">
        <div className="relative flex-1">
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
                className="flex flex-1 flex-col"
              >
                <div className="mb-7">
                  <h3 className="text-xl font-semibold text-white">Quel est votre type de véhicule ?</h3>
                  <p className="mt-1 text-sm text-gray-500">Sélectionnez la catégorie correspondant à votre véhicule</p>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {VEHICLE_TYPES.map(type => {
                    const Icon = type.icon
                    const isSelected = vehicleType === type.id
                    return (
                      <button
                        key={type.id}
                        onClick={() => selectType(type.id)}
                        className="group relative flex flex-col items-center gap-4 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5"
                        style={{
                          background: isSelected ? type.bgSelected : 'rgba(255,255,255,0.03)',
                          border: isSelected ? type.borderSelected : '1px solid rgba(255,255,255,0.07)',
                          boxShadow: isSelected
                            ? `0 0 40px ${type.glowColor}, 0 8px 24px rgba(0,0,0,0.3)`
                            : '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        {isSelected && (
                          <div className="absolute right-3 top-3">
                            <CheckCircle2 size={16} style={{ color: type.accentColor }} />
                          </div>
                        )}
                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110"
                          style={{
                            background: isSelected ? type.iconBg : 'rgba(255,255,255,0.05)',
                            border: isSelected ? type.iconBorder : '1px solid rgba(255,255,255,0.06)',
                            color: isSelected ? type.accentColor : 'rgba(255,255,255,0.35)',
                            boxShadow: isSelected ? `0 0 20px ${type.glowColor}` : 'none',
                          }}
                        >
                          <Icon size={30} />
                        </div>
                        <div className="text-center">
                          <span
                            className="block text-sm font-bold tracking-wide transition-colors"
                            style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.5)' }}
                          >
                            {type.label}
                          </span>
                          <span
                            className="mt-0.5 block text-[10px] transition-colors"
                            style={{ color: isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}
                          >
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
                className="flex flex-1 flex-col"
              >
                <div className="mb-7 flex items-center gap-4">
                  <button
                    onClick={() => resetTo(1)}
                    className="group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200"
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
                  <div>
                    <h3 className="text-xl font-semibold text-white">Combien de cylindres ?</h3>
                    {selectedVehicleConfig && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                        <CheckCircle2 size={12} className="text-green-500" />
                        {selectedVehicleConfig.label}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {cylinderChoices.map(cyl => {
                    const isSelected = cylinders === cyl
                    return (
                      <button
                        key={cyl}
                        onClick={() => selectCylinders(cyl)}
                        className="group relative flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                        style={{
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(225,6,0,0.18) 0%, rgba(225,6,0,0.06) 100%)'
                            : 'rgba(255,255,255,0.03)',
                          border: isSelected
                            ? '1px solid rgba(225,6,0,0.5)'
                            : '1px solid rgba(255,255,255,0.07)',
                          boxShadow: isSelected
                            ? '0 0 30px rgba(225,6,0,0.2), 0 8px 24px rgba(0,0,0,0.3)'
                            : '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        <span
                          className="text-3xl font-black tabular-nums transition-colors"
                          style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)' }}
                        >
                          {cyl}
                        </span>
                        <span
                          className="text-xs font-semibold uppercase tracking-widest transition-colors"
                          style={{ color: isSelected ? 'rgba(225,6,0,0.9)' : 'rgba(255,255,255,0.2)' }}
                        >
                          cyl.
                        </span>
                        {isSelected && (
                          <div className="absolute right-3 top-3">
                            <CheckCircle2 size={15} className="text-[#E10600]" />
                          </div>
                        )}
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
                className="flex flex-1 flex-col"
              >
                <div className="mb-7 flex items-center gap-4">
                  <button
                    onClick={() => resetTo(2)}
                    className="group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200"
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
                  <div>
                    <h3 className="text-xl font-semibold text-white">Dernières précisions</h3>
                    {selectedVehicleConfig && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                        <CheckCircle2 size={12} className="text-green-500" />
                        {selectedVehicleConfig.label} — {cylinders} cyl.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Power input */}
                  <div>
                    <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                      <Gauge size={14} className="text-[#E10600]" />
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
                        className="w-full rounded-2xl px-5 py-4 text-xl font-bold text-white placeholder-gray-700 outline-none transition-all duration-200"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: power !== '' ? '1px solid rgba(225,6,0,0.5)' : '1px solid rgba(255,255,255,0.07)',
                          boxShadow: power !== '' ? '0 0 20px rgba(225,6,0,0.1)' : 'none',
                        }}
                      />
                      <div
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold"
                        style={{ color: 'rgba(255,255,255,0.2)' }}
                      >
                        CV
                      </div>
                    </div>
                  </div>

                  {/* Fuel type */}
                  <div>
                    <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                      <Fuel size={14} className="text-[#E10600]" />
                      Carburant
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {FUEL_OPTIONS.map(fuel => {
                        const isSelected = fuelType === fuel.id
                        return (
                          <button
                            key={fuel.id}
                            onClick={() => setFuelType(fuel.id)}
                            className="flex min-h-[80px] flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                            style={{
                              background: isSelected
                                ? 'linear-gradient(135deg, rgba(225,6,0,0.18) 0%, rgba(225,6,0,0.06) 100%)'
                                : 'rgba(255,255,255,0.03)',
                              border: isSelected
                                ? '1px solid rgba(225,6,0,0.5)'
                                : '1px solid rgba(255,255,255,0.07)',
                              boxShadow: isSelected ? '0 0 20px rgba(225,6,0,0.15)' : 'none',
                            }}
                          >
                            <span className="text-2xl">{fuel.icon}</span>
                            <span
                              className="text-sm font-bold transition-colors"
                              style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)' }}
                            >
                              {fuel.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSearch}
                    disabled={!canSubmit}
                    className="group relative flex items-center gap-3 overflow-hidden rounded-2xl px-8 py-4 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{
                      background: canSubmit
                        ? 'linear-gradient(135deg, #E10600 0%, #b80500 100%)'
                        : 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      boxShadow: canSubmit
                        ? '0 8px 32px rgba(225,6,0,0.4), 0 2px 8px rgba(0,0,0,0.3)'
                        : 'none',
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                    <Search size={18} />
                    <span>Voir les huiles recommandées</span>
                    <Zap size={15} className="opacity-80" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
