"use client";

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
    activeFilters.push({
      key: 'categorySlug',
      label: `Catégorie: ${searchParams.get('categorySlug')}`,
    })
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
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="mr-2 text-sm text-gray-500">Filtres actifs :</span>
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => removeFilter(filter.key)}
          className="bg-gray-100 text-[#111] hover:bg-[#E10600] flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
        >
          {filter.label}
          <X size={14} />
        </button>
      ))}
      <button
        onClick={clearAll}
        className="text-[#E10600] ml-2 text-xs font-medium hover:underline"
      >
        Tout effacer
      </button>
    </div>
  )
}
