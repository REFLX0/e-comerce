"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'newest', label: 'Nouveautés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'rating', label: 'Mieux notés' },
]

export function SortDropdown() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sortBy') || 'relevance'

  const handleSortChange = (value: string | null) => {
    if (!value) return
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'relevance') {
      params.delete('sortBy')
    } else {
      params.set('sortBy', value)
    }
    params.delete('page')
    router.push(`/catalogue?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-gray-500 sm:inline-block">Trier par :</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="border-brand-surface-dark focus:ring-brand-primary w-[180px] bg-white">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="cursor-pointer">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
