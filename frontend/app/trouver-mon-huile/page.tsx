'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { vehiclesApi } from '@/lib/api/vehicles'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ProductGrid } from '@/components/catalogue/ProductGrid'
import { SectionTitle } from '@/components/common/SectionTitle'
import { Car, Search, ChevronRight } from 'lucide-react'

export default function ConfiguratorPage() {
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [engine, setEngine] = useState('')
  
  const [hasSearched, setHasSearched] = useState(false)

  // Fetch options sequentially
  const { data: makes, isLoading: loadingMakes } = useQuery({
    queryKey: ['vehicle-makes'],
    queryFn: () => vehiclesApi.getMakes(),
  })

  const { data: models, isLoading: loadingModels } = useQuery({
    queryKey: ['vehicle-models', make],
    queryFn: () => vehiclesApi.getModels(make),
    enabled: !!make,
  })

  const { data: years, isLoading: loadingYears } = useQuery({
    queryKey: ['vehicle-years', make, model],
    queryFn: () => vehiclesApi.getYears(make, model),
    enabled: !!make && !!model,
  })

  const { data: engines, isLoading: loadingEngines } = useQuery({
    queryKey: ['vehicle-engines', make, model, year],
    queryFn: () => vehiclesApi.getEngines(make, model, parseInt(year)),
    enabled: !!make && !!model && !!year,
  })

  // Fetch recommendations when searched
  const { data: recommendations, isLoading: loadingRecs } = useQuery({
    queryKey: ['vehicle-recommendations', make, model, year, engine],
    queryFn: () => vehiclesApi.getRecommendations({
      make, model, year: parseInt(year), engine
    }),
    enabled: hasSearched && !!make && !!model && !!year && !!engine,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (make && model && year && engine) {
      setHasSearched(true)
    }
  }

  const resetForm = () => {
    setMake('')
    setModel('')
    setYear('')
    setEngine('')
    setHasSearched(false)
  }

  return (
    <div className="bg-brand-surface min-h-screen">
      {/* Header Banner */}
      <div className="bg-brand-primary text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="section-padding relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Trouver mon huile</h1>
          <p className="text-lg text-gray-300">
            Identifiez l'huile parfaitement adaptée à votre moteur en quelques clics grâce à notre base de données constructeurs.
          </p>
        </div>
      </div>

      <div className="section-padding py-8">
        <Breadcrumb items={[{ label: 'Trouver mon huile' }]} />

        {/* Configurator Form */}
        <div className="bg-white rounded-3xl shadow-card border border-brand-surface-dark p-8 md:p-12 -mt-16 relative z-20 mb-16">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-primary">1. Marque</label>
              <select
                value={make}
                onChange={(e) => {
                  setMake(e.target.value)
                  setModel('')
                  setYear('')
                  setEngine('')
                  setHasSearched(false)
                }}
                className="w-full p-4 bg-brand-surface border border-gray-200 rounded-xl focus:border-brand-primary outline-none transition-colors"
                disabled={loadingMakes}
              >
                <option value="">Sélectionner...</option>
                {makes?.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-primary">2. Modèle</label>
              <select
                value={model}
                onChange={(e) => {
                  setModel(e.target.value)
                  setYear('')
                  setEngine('')
                  setHasSearched(false)
                }}
                className="w-full p-4 bg-brand-surface border border-gray-200 rounded-xl focus:border-brand-primary outline-none transition-colors disabled:opacity-50"
                disabled={!make || loadingModels}
              >
                <option value="">Sélectionner...</option>
                {models?.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-primary">3. Année</label>
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value)
                  setEngine('')
                  setHasSearched(false)
                }}
                className="w-full p-4 bg-brand-surface border border-gray-200 rounded-xl focus:border-brand-primary outline-none transition-colors disabled:opacity-50"
                disabled={!model || loadingYears}
              >
                <option value="">Sélectionner...</option>
                {years?.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-primary">4. Motorisation</label>
              <select
                value={engine}
                onChange={(e) => {
                  setEngine(e.target.value)
                  setHasSearched(false)
                }}
                className="w-full p-4 bg-brand-surface border border-gray-200 rounded-xl focus:border-brand-primary outline-none transition-colors disabled:opacity-50"
                disabled={!year || loadingEngines}
              >
                <option value="">Sélectionner...</option>
                {engines?.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <button
              type="submit"
              disabled={!engine || loadingRecs}
              className="btn-primary h-[58px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={20} />
              Rechercher
            </button>
          </form>

          {hasSearched && (
            <div className="mt-6 flex justify-end">
              <button onClick={resetForm} className="text-sm text-gray-500 hover:text-brand-primary underline">
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-3 bg-brand-surface border border-brand-surface-dark px-6 py-3 rounded-full mb-6">
                <Car className="text-brand-accent" size={20} />
                <span className="font-semibold text-brand-primary">
                  {make} {model} {year} {engine}
                </span>
              </div>
              <SectionTitle 
                title="Huiles Recommandées" 
                subtitle="Ces produits sont parfaitement adaptés et répondent aux normes constructeur pour votre véhicule."
                centered
              />
            </div>

            {loadingRecs ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-brand-surface-dark border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Recherche des meilleures huiles...</p>
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-green-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg z-10">
                  COMPATIBILITÉ 100% GARANTIE
                </div>
                <ProductGrid products={recommendations} />
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-brand-surface-dark">
                <p className="text-xl font-medium text-gray-600 mb-4">
                  Aucune huile spécifique trouvée pour ce véhicule.
                </p>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Veuillez vérifier le manuel de votre véhicule ou contacter notre support client pour obtenir de l'aide.
                </p>
                <button className="btn-secondary">Contacter un expert</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
