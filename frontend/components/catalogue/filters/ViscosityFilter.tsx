'use client'

import type { FacetValue } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const ENGINE_OIL_RE = /^\d+w-\d+$/i

interface ViscosityFilterProps {
  viscosities: FacetValue[]
  selected?: string
  onChange: (value: string | null) => void
}

function groupViscosities(values: FacetValue[]) {
  const engine: FacetValue[] = []
  const transmission: FacetValue[] = []
  for (const item of values) {
    if (ENGINE_OIL_RE.test(item.value)) engine.push(item)
    else transmission.push(item)
  }
  return { engine, transmission }
}

/**
 * Grouped, scrollable viscosity picker. Engine grades (e.g. 5W-30) and
 * transmission/gear grades (e.g. 75W-90, ATF) are displayed in separate
 * groups with product counts; single-select toggle with clear state.
 */
export function ViscosityFilter({ viscosities, selected, onChange }: ViscosityFilterProps) {
  const t = useTranslations('Catalogue')
  const { engine, transmission } = groupViscosities(viscosities)

  const renderGroup = (title: string, items: FacetValue[]) => {
    if (items.length === 0) return null
    return (
      <div className="mb-3 last:mb-0">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">
          {title}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => {
            const isActive = selected === item.value
            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChange(isActive ? null : item.value)}
                className={cn(
                  'min-h-8 border px-2.5 text-[11px] font-black tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E10600]/30',
                  isActive
                    ? 'border-[#E10600] bg-[#E10600] text-white'
                    : 'border-black/10 bg-neutral-50 text-[#111] hover:border-black/35 hover:bg-white'
                )}
              >
                {item.value}
                <span className={cn('ml-1 text-[10px] font-bold', isActive ? 'text-white/70' : 'text-neutral-400')}>
                  {item.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-56 overflow-y-auto pr-1">
      {renderGroup(t('viscosityEngine'), engine)}
      {renderGroup(t('viscosityTransmission'), transmission)}
    </div>
  )
}