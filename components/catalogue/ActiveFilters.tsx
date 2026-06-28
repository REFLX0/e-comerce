'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

export function ActiveFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    params.delete('page')
    router.push(`/catalogue?${params.toString()}`)
  }

  const clearAll = () => {
    router.push('/catalogue')
  }

  const activeFilters: { key: string; label: string }[] = []

  if (searchParams.get('categorySlug')) {
    activeFilters.push({ key: 'categorySlug', label: `Catégorie: ${searchParams.get('categorySlug')}` })
  }
  if (searchParams.get('brandSlug')) {
    activeFilters.push({ key: 'brandSlug', label: `Marque: ${searchParams.get('brandSlug')}` })
  }
  if (searchParams.get('viscosity')) {
    activeFilters.push({ key: 'viscosity', label: `Viscosité: ${searchParams.get('viscosity')}` })
  }
  if (searchParams.get('inStockOnly') === 'true') {
    activeFilters.push({ key: 'inStockOnly', label: 'En stock uniquement' })
  }
  if (searchParams.get('isPromo') === 'true') {
    activeFilters.push({ key: 'isPromo', label: 'En promotion' })
  }
  if (searchParams.get('search')) {
    activeFilters.push({ key: 'search', label: `Recherche: "${searchParams.get('search')}"` })
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm text-gray-500 mr-2">Filtres actifs :</span>
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => removeFilter(filter.key)}
          className="flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
        >
          {filter.label}
          <X size={14} />
        </button>
      ))}
      <button
        onClick={clearAll}
        className="text-xs text-brand-accent hover:underline font-medium ml-2"
      >
        Tout effacer
      </button>
    </div>
  )
}
