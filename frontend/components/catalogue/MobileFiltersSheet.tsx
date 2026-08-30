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
  /** Base filters to apply to the facets query (e.g. { brandSlug: slug } on brand pages) */
  baseFilters?: Record<string, any>
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
  baseFilters,
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
              'flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-[#0a1128] px-4 text-[13px] font-black uppercase tracking-[0.12em] text-[#D4A76A] shadow-[0_8px_30px_rgba(10,17,40,0.15)] transition-all hover:bg-[#16254c] hover:shadow-[0_8px_30px_rgba(10,17,40,0.25)] sm:flex-none lg:hidden',
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
            className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4A76A] px-1 text-[11px] font-black text-[#16254c] shadow-[0_0_10px_rgba(212,167,106,0.3)]"
          >
            {activeCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent
        side="bottom"
        showCloseButton
        className="gap-0 border-t-white/10 bg-[#0a1128] p-0 text-white"
      >
        <SheetHeader className="border-b border-white/10 px-5 py-4">
          <SheetTitle className="flex items-center gap-3 text-[13px] font-black uppercase tracking-[0.16em] text-[#D4A76A]">
            {t('filters')}
            {draftCount > 0 && (
              <span className="text-[11px] font-bold normal-case tracking-normal text-white/60">
                {t('filtersActive', { count: draftCount })}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="h-[62dvh] max-h-[640px] min-h-[320px] overflow-y-auto">
          {/* We pass a prop or just let FilterSidebar render its gradient inside the sheet.
              Since FilterSidebar has rounded-2xl, it'll look like a floating card inside the sheet. */}
          <div className="p-3">
            <FilterSidebar
              mode="draft"
              draft={draft}
              onDraftChange={handleDraftChange}
              hideCategories={hideCategories}
              hideBrands={hideBrands}
              baseFilters={baseFilters}
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-white/10 bg-[#0a1128]/95 p-4 backdrop-blur-md">
          <button
            type="button"
            onClick={clearDraft}
            disabled={draftCount === 0}
            className="min-h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-black uppercase tracking-[0.12em] text-white/70 outline-none transition-all hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#D4A76A]/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('clear')}
          </button>
          <button
            type="button"
            onClick={apply}
            className="flex min-h-12 flex-[1.6] items-center justify-center gap-2 rounded-xl bg-[#D4A76A] px-3 text-xs font-black uppercase tracking-[0.12em] text-[#16254c] shadow-[0_0_15px_rgba(212,167,106,0.3)] outline-none transition-all hover:bg-[#e8b975] focus-visible:ring-2 focus-visible:ring-[#D4A76A]/40"
          >
            {t('applyFilters')}
            {draftCount > 0 && (
              <span
                aria-hidden="true"
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#16254c]/20 px-1 text-[11px] font-black"
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