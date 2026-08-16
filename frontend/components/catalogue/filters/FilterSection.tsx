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
    <AccordionPrimitive.Item value={value} className="not-last:border-b border-black/10">
      <AccordionPrimitive.Header className="flex items-center gap-1">
        <AccordionPrimitive.Trigger
          data-slot="filter-section-trigger"
          className="group/filter-trigger flex min-h-11 flex-1 items-center justify-between gap-2 py-3 pr-1 text-left text-[11px] font-black uppercase tracking-[0.16em] text-[#111] outline-none transition-colors hover:text-[#E10600] focus-visible:ring-2 focus-visible:ring-[#E10600]/30"
        >
          <span className="flex items-center gap-2">
            {title}
            {isActive && (
              <span className="flex h-4.5 min-w-4.5 items-center justify-center bg-[#E10600] px-1 text-[9px] font-black text-white">
                {activeCount}
              </span>
            )}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-3.5 shrink-0 text-neutral-400 transition-transform duration-200 group-aria-expanded/filter-trigger:rotate-180"
          />
        </AccordionPrimitive.Trigger>
        {isActive && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-neutral-400 transition-colors hover:text-[#E10600] focus-visible:ring-2 focus-visible:ring-[#E10600]/30 outline-none"
            aria-label={`${t('clear')} ${title}`}
          >
            {t('clear')}
          </button>
        )}
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Panel
        data-slot="filter-section-content"
        className="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden"
      >
        <div className={cn('pb-4')}>{children}</div>
      </AccordionPrimitive.Panel>
    </AccordionPrimitive.Item>
  )
}