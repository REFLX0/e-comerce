'use client'

import { useState } from 'react'
import { Car, Bike, Truck, Tractor, Search, ArrowLeft, Fuel, Gauge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, usePathname } from 'next/navigation'
import type { FuelType } from '@/lib/types'

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

interface Make {
  id: string
  name: string
  slug: string
}

type FetchState = 'idle' | 'loading' | 'error'

interface EngineSpecFinderProps {
  onClose?: () => void
}

export function EngineSpecFinder({ onClose }: EngineSpecFinderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const [step, setStep] = useState(1)
  const [vehicleType, setVehicleType] = useState<VehicleType | ''>('')
  const [selectedMake, setSelectedMake] = useState<Make | null>(null)
  const [cylinders, setCylinders] = useState<number | ''>('')
  const [power, setPower] = useState<number | ''>('')
  const [fuelType, setFuelType] = useState<FuelType | ''>('')

  const [makes, setMakes] = useState<Make[]>([])
  const [makesState, setMakesState] = useState<FetchState>('idle')
  const [makesRetry, setMakesRetry] = useState(0)

  const [showBrandStep, setShowBrandStep] = useState(true)

  const cylinderChoices = vehicleType ? CYLINDER_OPTIONS[vehicleType] : []

  const canSubmit = vehicleType && fuelType && cylinders !== '' && power !== ''

  const selectType = (type: VehicleType) => {
    setVehicleType(type)
    setSelectedMake(null)
    setMakes([])
    setCylinders('')
    setPower('')
    setFuelType('')
    setStep(2)
    if (showBrandStep) fetchMakes(type)
  }

  const fetchMakes = async (type: VehicleType) => {
    setMakesState('loading')
    try {
      const res = await fetch(`${API}/vehicles/makes?type=${encodeURIComponent(type)}`)
      if (!res.ok) throw new Error('Failed to fetch makes')
      const data = await res.json()
      setMakes(data)
      setMakesState('idle')
    } catch {
      setMakes([])
      setMakesState('error')
    }
  }

  const skipBrand = () => {
    setSelectedMake(null)
    setStep(3)
  }

  const selectMake = (make: Make) => {
    setSelectedMake(make)
    setStep(3)
  }

  const selectCylinders = (value: number) => {
    setCylinders(value)
    if (step === 3) setStep(4)
  }

  const resetTo = (targetStep: number) => {
    setStep(targetStep)
    if (targetStep <= 1) {
      setVehicleType('')
      setSelectedMake(null)
      setCylinders('')
      setPower('')
      setFuelType('')
      setMakes([])
    }
    if (targetStep <= 2) {
      setSelectedMake(null)
      setCylinders('')
      setPower('')
      setFuelType('')
    }
    if (targetStep <= 3) {
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
    if (selectedMake) params.set('make', selectedMake.slug)
    if (onClose) onClose()
    router.push(`/${locale}/catalogue?${params.toString()}`)
  }

  const typeIcon = VEHICLE_TYPES.find(t => t.id === vehicleType)

  return (
    <div id="oil-finder" className="relative z-10 mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-brand-border bg-brand-card shadow-overlay">
      <div className="relative border-b border-brand-border bg-brand-card p-5 md:p-7">
        <div className="relative z-10 flex items-start gap-4 sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-brand-accent/25 bg-brand-accent/10">
            <Search size={24} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="font-display mb-1 text-2xl font-bold text-brand-primary md:text-3xl">Recherche par caractéristiques</h2>
            <p className="text-sm leading-6 text-brand-muted">Sélectionnez les caractéristiques de votre moteur pour voir les huiles recommandées.</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-[300px] flex-col bg-brand-card p-5 md:p-7">
        <div className="mb-8 flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-brand-surface"
              onClick={() => i < step && resetTo(i)}
            >
              <div
                className="h-full bg-brand-accent transition-all duration-300 ease-out"
                style={{ width: step >= i ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-1 flex-col transition-all duration-300">
            <p className="mb-4 text-sm font-semibold uppercase tracking-normal text-brand-muted">Type de véhicule</p>
            <div className="grid grid-cols-2 gap-3">
              {VEHICLE_TYPES.map(type => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => selectType(type.id)}
                    className="group flex min-h-20 items-center gap-3 rounded-lg border border-brand-border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-accent/50 hover:bg-brand-accent/10 hover:shadow-card"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-surface transition-colors duration-200 group-hover:bg-brand-accent/15">
                      <Icon size={26} className="text-brand-primary transition-colors group-hover:text-brand-accent" />
                    </div>
                    <span className="text-sm font-bold text-brand-primary transition-colors group-hover:text-brand-primary sm:text-base">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 2 && showBrandStep && (
          <div className="flex flex-1 flex-col transition-all duration-300">
            <div className="mb-6 flex items-center gap-3">
              <button onClick={() => resetTo(1)} className="flex h-11 w-11 items-center justify-center rounded-lg text-brand-muted transition-colors duration-150 hover:bg-brand-surface hover:text-brand-primary" aria-label="Revenir au type de véhicule"><ArrowLeft size={20} /></button>
              <h3 className="text-xl font-bold text-brand-primary">Marque <span className="text-sm font-normal text-brand-muted">(optionnelle)</span></h3>
            </div>
            {makesState === 'loading' ? (
              <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" /></div>
            ) : makesState === 'error' ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <p className="text-center text-sm text-red-500">Impossible de charger les marques.</p>
                <Button onClick={() => { setMakesRetry(n => n + 1); fetchMakes(vehicleType as VehicleType) }} variant="outline" size="sm">Réessayer</Button>
                <Button onClick={skipBrand} variant="link" size="sm" className="text-brand-muted">Ignorer la marque</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {makes.map(make => (
                    <button
                      key={make.id}
                      onClick={() => selectMake(make)}
                      className="min-h-12 rounded-lg border border-brand-border p-3 text-center font-medium text-gray-700 transition-all duration-200 hover:border-brand-accent/50 hover:bg-brand-surface hover:text-brand-primary"
                    >
                      {make.name}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <Button onClick={skipBrand} variant="link" size="sm" className="text-brand-muted">Je ne sais pas / Passer</Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-1 flex-col transition-all duration-300">
            <div className="mb-6 flex items-center gap-3">
              <button onClick={() => resetTo(showBrandStep ? 2 : 1)} className="flex h-11 w-11 items-center justify-center rounded-lg text-brand-muted transition-colors duration-150 hover:bg-brand-surface hover:text-brand-primary" aria-label="Revenir"><ArrowLeft size={20} /></button>
              <h3 className="text-xl font-bold text-brand-primary">
                Cylindres
                {typeIcon && <span className="ml-2 text-sm font-normal text-brand-muted">{typeIcon.label}</span>}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {cylinderChoices.map(cyl => (
                <button
                  key={cyl}
                  onClick={() => selectCylinders(cyl)}
                  className={`flex min-h-16 items-center justify-center gap-2 rounded-lg border p-4 text-lg font-bold transition-all duration-200 ${
                    cylinders === cyl
                      ? 'border-brand-accent bg-brand-accent/10 text-brand-primary'
                      : 'border-brand-border text-gray-700 hover:border-brand-accent/50 hover:bg-brand-surface'
                  }`}
                >
                  <span>{cyl}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-1 flex-col transition-all duration-300">
            <div className="mb-6 flex items-center gap-3">
              <button onClick={() => resetTo(3)} className="flex h-11 w-11 items-center justify-center rounded-lg text-brand-muted transition-colors duration-150 hover:bg-brand-surface hover:text-brand-primary" aria-label="Revenir aux cylindres"><ArrowLeft size={20} /></button>
              <h3 className="text-xl font-bold text-brand-primary">Puissance et carburant</h3>
            </div>

            <div className="mb-6">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-muted">
                <Gauge size={16} />
                Puissance (CV)
              </label>
              <input
                type="number"
                min={0}
                max={2000}
                value={power}
                onChange={e => setPower(e.target.value ? Number(e.target.value) : '')}
                placeholder="ex: 90"
                className="w-full rounded-lg border border-brand-border bg-white p-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-muted">
                <Fuel size={16} />
                Carburant
              </label>
              <div className="grid grid-cols-2 gap-3">
                {FUEL_OPTIONS.map(fuel => (
                  <button
                    key={fuel.id}
                    onClick={() => setFuelType(fuel.id)}
                    className={`flex min-h-14 items-center justify-center gap-2 rounded-lg border p-3 text-base font-semibold transition-all duration-200 ${
                      fuelType === fuel.id
                        ? 'border-brand-accent bg-brand-accent/10 text-brand-primary'
                        : 'border-brand-border text-gray-700 hover:border-brand-accent/50 hover:bg-brand-surface'
                    }`}
                  >
                    {fuel.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto flex justify-end">
              <Button
                onClick={handleSearch}
                size="lg"
                disabled={!canSubmit}
                className="btn-primary flex w-full items-center gap-2 sm:w-auto"
              >
                <Search size={18} />
                Voir les huiles recommandées
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
