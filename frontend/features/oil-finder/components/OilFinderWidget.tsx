'use client'

import { useState, useEffect } from 'react'
import { Car, Bike, Truck, Tractor, Search, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

type VehicleType = 'car' | 'moto' | 'truck' | 'agri'

const VEHICLE_TYPES = [
  { id: 'car', icon: Car, label: 'Automobile' },
  { id: 'moto', icon: Bike, label: 'Moto' },
  { id: 'truck', icon: Truck, label: 'Poids Lourd' },
  { id: 'agri', icon: Tractor, label: 'Agricole' },
] as const

const API = process.env.NEXT_PUBLIC_API_URL ?? '/api'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('API error')
  return res.json() as Promise<T>
}

interface Make { id: string; name: string; slug: string }
interface VehicleModel { id: string; name: string; slug: string }
interface Engine { engineCode: string; yearFrom: number | null; yearTo: number | null }

import { useVehicleStore } from '@/lib/store/vehicle.store'
import { usePathname } from 'next/navigation'

export function OilFinderWidget() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const { setVehicle } = useVehicleStore()
  const [step, setStep] = useState(1)
  const [selections, setSelections] = useState({ type: '' as VehicleType | '', make: null as Make | null, model: null as VehicleModel | null, engine: '' })

  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<VehicleModel[]>([])
  const [engines, setEngines] = useState<Engine[]>([])
  const [loading, setLoading] = useState(false)

  // Load makes when vehicle type selected
  useEffect(() => {
    let cancelled = false

    const loadMakes = async () => {
      setLoading(true)
      try {
        const data = await fetchJson<Make[]>(`${API}/vehicles/makes`)
        if (!cancelled) setMakes(data)
      } catch {
        if (!cancelled) setMakes([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (step === 2) void loadMakes()
    return () => {
      cancelled = true
    }
  }, [step])

  // Load models when make selected
  useEffect(() => {
    let cancelled = false

    const loadModels = async () => {
      if (!selections.make) return
      setLoading(true)
      try {
        const data = await fetchJson<VehicleModel[]>(`${API}/vehicles/makes/${selections.make.slug}/models`)
        if (!cancelled) setModels(data)
      } catch {
        if (!cancelled) setModels([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (step === 3 && selections.make) void loadModels()
    return () => {
      cancelled = true
    }
  }, [step, selections.make])

  // Load engines when model selected
  useEffect(() => {
    let cancelled = false

    const loadEngines = async () => {
      if (!selections.model) return
      setLoading(true)
      try {
        const data = await fetchJson<Engine[]>(`${API}/vehicles/models/${selections.model.slug}/engines`)
        if (!cancelled) setEngines(data)
      } catch {
        if (!cancelled) setEngines([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (step === 4 && selections.model) void loadEngines()
    return () => {
      cancelled = true
    }
  }, [step, selections.model])

  const selectType = (type: VehicleType) => { setSelections(s => ({ ...s, type })); setStep(2) }
  const selectMake = (make: Make) => { setSelections(s => ({ ...s, make })); setStep(3) }
  const selectModel = (model: VehicleModel) => { setSelections(s => ({ ...s, model })); setStep(4) }

  const handleSearch = () => {
    if (selections.make && selections.model) {
      setVehicle({
        type: selections.type,
        makeId: selections.make.id,
        makeName: selections.make.name,
        makeSlug: selections.make.slug,
        modelId: selections.model.id,
        modelName: selections.model.name,
        modelSlug: selections.model.slug,
        engineCode: selections.engine,
      })
    }
    
    const params = new URLSearchParams()
    if (selections.make) params.set('make', selections.make.slug)
    if (selections.model) params.set('model', selections.model.slug)
    if (selections.engine) params.set('engine', selections.engine)
    router.push(`/${locale}/catalogue?${params.toString()}`)
  }


  const resetTo = (targetStep: number) => {
    setStep(targetStep)
    if (targetStep <= 1) setSelections({ type: '', make: null, model: null, engine: '' })
    if (targetStep <= 2) setSelections(s => ({ ...s, make: null, model: null, engine: '' }))
    if (targetStep <= 3) setSelections(s => ({ ...s, model: null, engine: '' }))
  }

  return (
    <div id="oil-finder" className="relative z-10 mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-brand-border bg-brand-card shadow-overlay">
      <div className="relative border-b border-brand-border bg-brand-card p-5 md:p-7">
        <div className="relative z-10 flex items-start gap-4 sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-brand-accent/25 bg-brand-accent/10">
            <Search size={24} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="font-display mb-1 text-2xl font-bold text-brand-primary md:text-3xl">Trouver mon huile</h2>
            <p className="text-sm leading-6 text-brand-muted">Sélectionnez votre véhicule pour voir les huiles 100% compatibles.</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-[300px] flex-col bg-brand-card p-5 md:p-7">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-brand-surface" onClick={() => i < step && resetTo(i)}>
              <div className="h-full bg-brand-accent transition-all duration-300 ease-out" style={{ width: step >= i ? '100%' : '0%' }} />
            </div>
          ))}
        </div>

          {step === 1 && (
            <div key="step" className="flex-1 flex flex-col transition-all duration-300">
              <p className="mb-4 text-sm font-semibold uppercase tracking-normal text-brand-muted">Type de véhicule</p>
              <div className="grid grid-cols-2 gap-3">
                {VEHICLE_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => selectType(type.id)}
                      className="group flex min-h-20 items-center gap-3 rounded-lg border border-brand-border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-accent/50 hover:bg-brand-accent/10 hover:shadow-card"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-surface transition-colors duration-200 group-hover:bg-brand-accent/15">
                        <Icon size={26} className="text-brand-primary group-hover:text-brand-accent transition-colors" />
                      </div>
                      <span className="text-sm font-bold text-brand-primary transition-colors group-hover:text-brand-primary sm:text-base">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2 — Make */}
          {step === 2 && (
            <div key="step2" className="flex-1 flex flex-col transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => resetTo(1)} className="flex h-11 w-11 items-center justify-center rounded-lg text-brand-muted transition-colors duration-150 hover:bg-brand-surface hover:text-brand-primary" aria-label="Revenir au type de véhicule"><ArrowLeft size={20} /></button>
                <h3 className="text-xl font-bold text-brand-primary">Sélectionnez la marque</h3>
              </div>
              {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-brand-accent" size={32} /></div> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {makes.map(make => (
                    <button key={make.id} onClick={() => selectMake(make)} className="min-h-12 rounded-lg border border-brand-border p-3 text-center font-medium text-gray-700 transition-all duration-200 hover:border-brand-accent/50 hover:bg-brand-surface hover:text-brand-primary">{make.name}</button>
                  ))}
                  {makes.length === 0 && <p className="col-span-4 text-center text-gray-400 py-4">Aucune marque disponible dans la base de données.</p>}
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Model */}
          {step === 3 && (
            <div key="step3" className="flex-1 flex flex-col transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => resetTo(2)} className="flex h-11 w-11 items-center justify-center rounded-lg text-brand-muted transition-colors duration-150 hover:bg-brand-surface hover:text-brand-primary" aria-label="Revenir à la marque"><ArrowLeft size={20} /></button>
                <h3 className="text-xl font-bold text-brand-primary">Modèle — <span className="text-brand-accent">{selections.make?.name}</span></h3>
              </div>
              {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-brand-accent" size={32} /></div> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {models.map(model => (
                    <button key={model.id} onClick={() => selectModel(model)} className="min-h-12 rounded-lg border border-brand-border p-3 text-center font-medium text-gray-700 transition-all duration-200 hover:border-brand-accent/50 hover:bg-brand-surface hover:text-brand-primary">{model.name}</button>
                  ))}
                  {models.length === 0 && <p className="col-span-4 text-center text-gray-400 py-4">Aucun modèle disponible.</p>}
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Engine */}
          {step === 4 && (
            <div key="step4" className="flex-1 flex flex-col transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => resetTo(3)} className="flex h-11 w-11 items-center justify-center rounded-lg text-brand-muted transition-colors duration-150 hover:bg-brand-surface hover:text-brand-primary" aria-label="Revenir au modèle"><ArrowLeft size={20} /></button>
                <h3 className="text-xl font-bold text-brand-primary">Motorisation — <span className="text-brand-accent">{selections.model?.name}</span></h3>
              </div>
              {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-brand-accent" size={32} /></div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {engines.map(engine => (
                    <button key={engine.engineCode} onClick={() => setSelections(s => ({ ...s, engine: engine.engineCode }))}
                      className={`min-h-12 rounded-lg border p-4 text-left transition-all duration-200 ${selections.engine === engine.engineCode ? 'border-brand-accent bg-brand-accent/10 font-bold text-brand-primary' : 'border-brand-border text-gray-700 font-medium hover:border-brand-accent/50 hover:bg-brand-surface'}`}>
                      {engine.engineCode}
                      {engine.yearFrom && <span className="text-xs text-gray-400 ml-2">({engine.yearFrom}{engine.yearTo ? `–${engine.yearTo}` : '+'})</span>}
                    </button>
                  ))}
                  {engines.length === 0 && (
                    <p className="col-span-2 text-center text-gray-400 py-4">
                      Aucune motorisation répertoriée — vous pouvez tout de même lancer la recherche.
                    </p>
                  )}
                </div>
              )}
              <div className="mt-auto flex justify-end">
                <Button onClick={handleSearch} size="lg" className="btn-primary flex w-full items-center gap-2 sm:w-auto">
                  <Search size={18} />
                  Trouver les huiles compatibles
                </Button>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
