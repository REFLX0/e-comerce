"use client"

import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { ArrowDownUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'sortRelevance' },
  { value: 'newest', label: 'sortNewest' },
  { value: 'price_asc', label: 'sortPriceAsc' },
  { value: 'price_desc', label: 'sortPriceDesc' },
]

export function SortDropdown() {
  const t = useTranslations('Catalogue')
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sortBy') || 'relevance'

  const handleSortChange = (value: string | null) => {
    if (!value) return
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'relevance') params.delete('sortBy')
    else params.set('sortBy', value)
    params.delete('page')
    router.push(`/catalogue?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <ArrowDownUp size={15} className="hidden text-neutral-500 sm:block" />
      <span className="hidden text-[11px] font-black uppercase tracking-[0.14em] text-neutral-500 md:block">{t('sortBy')}</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="h-11 min-w-[172px] rounded-none border-black/15 bg-white font-semibold text-[#111] focus-visible:border-[#E10600] focus-visible:ring-[#E10600]/20">
          <SelectValue placeholder={t('sortBy')} />
        </SelectTrigger>
        <SelectContent align="end" className="rounded-none border-black/15">
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="cursor-pointer rounded-none font-medium">
              {t(option.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
