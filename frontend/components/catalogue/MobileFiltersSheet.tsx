'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Filter } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { FilterSidebar } from './FilterSidebar'
import {
  useFilterParams,
  countActiveFilters,
  type FilterValue,
} from '@/lib/hooks/useFilterParams'
import { cn } from '@/lib/utils'

interface MobileFiltersSheetProps {
  /** Extra classes for the trigger button (always `lg:hidden`). */
  triggerClassName?: string
  /** Override the trigger label (defaults to the translated "Filters"). */
  triggerLabel?: string
  /** Hide the category nav inside the sheet (fixed context pages). */
  hideCategories?: boolean
  /** Hide the brands section inside the sheet (fixed brand context pages). */
  hideBrands?: boolean
}

/**
 * Mobile filter entry point: bottom-sheet drawer with draft filter state and
 * a sticky "Apply filters (n)" footer. Focus trap, ESC-to-close and overlay
 * dismissal are provided by the Base UI Dialog wrapper (sheet).
 */
export function MobileFiltersSheet({
  triggerClassName,
  triggerLabel,
  hideCategories,
  hideBrands,
}: MobileFiltersSheetProps) {
  const t = useTranslations('Catalogue')
  const searchParams = useSearchParams()
  const { activeCount, replaceParams } = useFilterParams()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})

  /* Re-seed the draft from the URL each time the sheet opens */
  const handleOpenChange = (next: boolean) => {
    if (next) {
      const seed: Record<string, string> = {}
      searchParams.forEach((value, key) => {
        if (key === 'page' || !value) return
        seed[key] = value
      })
      setDraft(seed)
    }
    setOpen(next)
  }

  const draftCount = countActiveFilters(draft)

  const handleDraftChange = (patch: Record<string, FilterValue>) => {
    setDraft((prev) => {
      const next = { ...prev }
      Object.entries(patch).forEach(([key, value]) => {
        if (value) next[key] = value
        else delete next[key]
      })
      return next
    })
  }

  const apply = () => {
    const next = new URLSearchParams()
    Object.entries(draft).forEach(([key, value]) => {
      if (value) next.set(key, value)
    })
    replaceParams(next)
    setOpen(false)
  }

  const clearDraft = () => setDraft({})

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label={`${triggerLabel ?? t('filters')}${activeCount ? ` (${activeCount})` : ''}`}
            className={cn(
              'flex min-h-11 flex-1 items-center justify-center gap-2 border border-black/15 bg-white px-4 text-xs font-black uppercase tracking-[0.12em] text-[#111] transition-colors hover:border-[#E10600] hover:text-[#E10600] sm:flex-none lg:hidden',
              triggerClassName
            )}
          />
        }
      >
        <Filter size={16} aria-hidden="true" />
        {triggerLabel ?? t('filters')}
        {activeCount > 0 && (
          <span
            aria-hidden="true"
            className="flex h-5 min-w-5 items-center justify-center bg-[#E10600] px-1 text-[10px] font-black text-white"
          >
            {activeCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent
        side="bottom"
        showCloseButton
        className="gap-0 bg-white p-0"
      >
        <SheetHeader className="border-b border-black/10 px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.16em] text-[#111]">
            {t('filters')}
            {draftCount > 0 && (
              <span className="text-[11px] font-bold normal-case tracking-normal text-neutral-500">
                {t('filtersActive', { count: draftCount })}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="h-[62dvh] max-h-[640px] min-h-[320px] overflow-y-auto">
          <FilterSidebar
            mode="draft"
            draft={draft}
            onDraftChange={handleDraftChange}
            hideCategories={hideCategories}
            hideBrands={hideBrands}
          />
        </div>

        <div className="sticky bottom-0 flex gap-2 border-t border-black/10 bg-white p-3">
          <button
            type="button"
            onClick={clearDraft}
            disabled={draftCount === 0}
            className="min-h-12 flex-1 border border-black/15 px-3 text-xs font-black uppercase tracking-[0.12em] text-[#111] outline-none transition-colors hover:border-[#E10600] hover:text-[#E10600] focus-visible:ring-2 focus-visible:ring-[#E10600]/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('clear')}
          </button>
          <button
            type="button"
            onClick={apply}
            className="flex min-h-12 flex-[1.6] items-center justify-center gap-2 bg-[#E10600] px-3 text-xs font-black uppercase tracking-[0.12em] text-white outline-none transition-colors hover:bg-[#bd0500] focus-visible:ring-2 focus-visible:ring-[#E10600]/40"
          >
            {t('applyFilters')}
            {draftCount > 0 && (
              <span
                aria-hidden="true"
                className="flex h-5 min-w-5 items-center justify-center bg-white/25 px-1 text-[10px] font-black"
              >
                {draftCount}
              </span>
            )}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}