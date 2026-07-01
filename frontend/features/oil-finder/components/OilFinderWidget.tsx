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

export function OilFinderWidget() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selections, setSelections] = useState({ type: '' as VehicleType | '', make: null as Make | null, model: null as VehicleModel | null, engine: '' })

  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<VehicleModel[]>([])
  const [engines, setEngines] = useState<Engine[]>([])
  const [loading, setLoading] = useState(false)

  // Load makes when vehicle type selected
  useEffect(() => {
    if (step === 2) {
      setLoading(true)
      fetchJson<Make[]>(`${API}/vehicles/makes`)
        .then(setMakes)
        .catch(() => setMakes([]))
        .finally(() => setLoading(false))
    }
  }, [step])

  // Load models when make selected
  useEffect(() => {
    if (step === 3 && selections.make) {
      setLoading(true)
      fetchJson<VehicleModel[]>(`${API}/vehicles/makes/${selections.make.slug}/models`)
        .then(setModels)
        .catch(() => setModels([]))
        .finally(() => setLoading(false))
    }
  }, [step, selections.make])

  // Load engines when model selected
  useEffect(() => {
    if (step === 4 && selections.model) {
      setLoading(true)
      fetchJson<Engine[]>(`${API}/vehicles/models/${selections.model.slug}/engines`)
        .then(setEngines)
        .catch(() => setEngines([]))
        .finally(() => setLoading(false))
    }
  }, [step, selections.model])

  const selectType = (type: VehicleType) => { setSelections(s => ({ ...s, type })); setStep(2) }
  const selectMake = (make: Make) => { setSelections(s => ({ ...s, make })); setStep(3) }
  const selectModel = (model: VehicleModel) => { setSelections(s => ({ ...s, model })); setStep(4) }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selections.make) params.set('make', selections.make.slug)
    if (selections.model) params.set('model', selections.model.slug)
    if (selections.engine) params.set('engine', selections.engine)
    router.push(`/catalogue?${params.toString()}`)
  }

  const resetTo = (targetStep: number) => {
    setStep(targetStep)
    if (targetStep <= 1) setSelections({ type: '', make: null, model: null, engine: '' })
    if (targetStep <= 2) setSelections(s => ({ ...s, make: null, model: null, engine: '' }))
    if (targetStep <= 3) setSelections(s => ({ ...s, model: null, engine: '' }))
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-md shadow-[var(--shadow-card)] rounded-3xl overflow-hidden border border-brand-surface-dark relative z-10">
      <div className="bg-brand-primary p-6 md:p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-accent mb-2">Trouver mon huile</h2>
          <p className="text-gray-300">Sélectionnez votre véhicule pour voir les huiles compatibles.</p>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-white min-h-[300px] flex flex-col">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden cursor-pointer" onClick={() => i < step && resetTo(i)}>
              <div className="h-full bg-brand-accent transition-all duration-300 ease-out" style={{ width: step >= i ? '100%' : '0%' }} />
            </div>
          ))}
        </div>

          {step === 1 && (
            <div key="step" className="flex-1 flex flex-col transition-all duration-300">
              {VEHICLE_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <button key={type.id} onClick={() => selectType(type.id)} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-100 hover:border-brand-accent hover:bg-brand-surface/50 transition-all group">
                    <Icon size={40} className="mb-4 text-brand-primary group-hover:text-brand-accent transition-colors" />
                    <span className="font-semibold text-brand-primary">{type.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Step 2 — Make */}
          {step === 2 && (
            <div key="step2" className="flex-1 flex flex-col transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => resetTo(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} className="text-gray-500" /></button>
                <h3 className="text-xl font-bold text-brand-primary">Sélectionnez la marque</h3>
              </div>
              {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-brand-accent" size={32} /></div> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {makes.map(make => (
                    <button key={make.id} onClick={() => selectMake(make)} className="p-4 text-center rounded-xl border border-gray-100 hover:border-brand-primary hover:bg-brand-surface font-medium text-gray-700 transition-all">{make.name}</button>
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
                <button onClick={() => resetTo(2)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} className="text-gray-500" /></button>
                <h3 className="text-xl font-bold text-brand-primary">Modèle — <span className="text-brand-accent">{selections.make?.name}</span></h3>
              </div>
              {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-brand-accent" size={32} /></div> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {models.map(model => (
                    <button key={model.id} onClick={() => selectModel(model)} className="p-4 text-center rounded-xl border border-gray-100 hover:border-brand-primary hover:bg-brand-surface font-medium text-gray-700 transition-all">{model.name}</button>
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
                <button onClick={() => resetTo(3)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} className="text-gray-500" /></button>
                <h3 className="text-xl font-bold text-brand-primary">Motorisation — <span className="text-brand-accent">{selections.model?.name}</span></h3>
              </div>
              {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-brand-accent" size={32} /></div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {engines.map(engine => (
                    <button key={engine.engineCode} onClick={() => setSelections(s => ({ ...s, engine: engine.engineCode }))}
                      className={`p-4 text-left rounded-xl border-2 transition-all ${selections.engine === engine.engineCode ? 'border-brand-accent bg-brand-surface font-bold text-brand-primary' : 'border-gray-100 hover:border-gray-300 text-gray-700 font-medium'}`}>
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
                <Button onClick={handleSearch} size="lg" className="btn-primary flex items-center gap-2">
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
