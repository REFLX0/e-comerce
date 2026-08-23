'use client'

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

interface FilterSectionProps {
  value: string
  title: string
  /** Number of active filters inside this section (badge + clear button). */
  activeCount?: number
  /** Called by the per-section "clear" button. */
  onClear?: () => void
  children: ReactNode
}

/**
 * Collapsible accordion section used by every group in the filter sidebar.
 * Controlled by the accordion root it lives in; the trigger + clear button
 * are siblings inside the header for a valid a11y tree.
 */
export function FilterSection({
  value,
  title,
  activeCount = 0,
  onClear,
  children,
}: FilterSectionProps) {
  const t = useTranslations('Catalogue')
  const isActive = activeCount > 0

  return (
    <AccordionPrimitive.Item value={value} className="not-last:border-b border-white/10 px-4">
      <AccordionPrimitive.Header className="flex items-center gap-2">
        <AccordionPrimitive.Trigger
          data-slot="filter-section-trigger"
          className="group/filter-trigger flex min-h-12 flex-1 items-center justify-between gap-2 py-3 text-start text-[11px] font-black uppercase tracking-[0.16em] text-white outline-none transition-colors hover:text-[#D4A76A] focus-visible:ring-2 focus-visible:ring-[#D4A76A]/30 rounded-lg px-1"
        >
          <span className="flex items-center gap-2.5">
            {title}
            {isActive && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4A76A] px-1 text-[10px] font-black text-[#16254c] shadow-[0_0_10px_rgba(212,167,106,0.3)]">
                {activeCount}
              </span>
            )}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-white/40 transition-transform duration-200 group-aria-expanded/filter-trigger:rotate-180"
          />
        </AccordionPrimitive.Trigger>
        {isActive && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#D4A76A]/30 outline-none"
            aria-label={`${t('clear')} ${title}`}
          >
            {t('clear')}
          </button>
        )}
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Panel
        data-slot="filter-section-content"
        className="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden px-1"
      >
        <div className={cn('pb-4')}>{children}</div>
      </AccordionPrimitive.Panel>
    </AccordionPrimitive.Item>
  )
}