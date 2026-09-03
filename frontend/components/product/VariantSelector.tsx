"use client";

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { ProductVariant } from '@/lib/types'
import { parseVolumeToL } from '@/lib/utils/format'

interface Props {
  variants: ProductVariant[]
  selectedVariant: ProductVariant
  onChange: (variant: ProductVariant) => void
}

export function VariantSelector({ variants, selectedVariant, onChange }: Props) {
  const t = useTranslations('Product')

  // Deduplicate variants by normalized volume & sort ascending (250ml -> 500ml -> 1L -> 4L -> 5L...)
  const uniqueVariants = useMemo(() => {
    if (!variants || variants.length === 0) return []
    const seen = new Map<string, ProductVariant>()
    for (const v of variants) {
      const key = (v.volume || v.label || '').trim().toUpperCase().replace(/\s+/g, '')
      if (!key) continue
      const existing = seen.get(key)
      if (!existing) {
        seen.set(key, v)
      } else {
        // Prefer variant with imageUrl or higher price/stock
        if ((!existing.imageUrl && v.imageUrl) || (existing.priceTTC === 0 && v.priceTTC > 0)) {
          seen.set(key, v)
        }
      }
    }

    return Array.from(seen.values()).sort((a, b) => {
      const volA = parseVolumeToL(a.volume || a.label)
      const volB = parseVolumeToL(b.volume || b.label)
      if (volA !== null && volB !== null) return volA - volB
      if (volA !== null) return -1
      if (volB !== null) return 1
      return 0
    })
  }, [variants])

  if (uniqueVariants.length <= 1) return null

  return (
    <div className="mb-6">
      <h3 className="text-brand-primary mb-3 text-sm font-semibold">{t('volume')}</h3>
      <div className="flex flex-wrap gap-3">
        {uniqueVariants.map((variant) => {
          const isSelected =
            selectedVariant?.id === variant.id ||
            (selectedVariant?.volume && variant.volume && selectedVariant.volume.trim().toUpperCase() === variant.volume.trim().toUpperCase())

          return (
            <button
              key={variant.id}
              onClick={() => onChange(variant)}
              disabled={variant.status === 'out_of_stock'}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 px-4 py-2.5 transition-all ${
                isSelected
                  ? 'border-brand-primary bg-brand-primary/5 shadow-sm'
                  : 'hover:border-brand-primary/50 border-gray-200 bg-white'
              } ${variant.status === 'out_of_stock' ? 'cursor-not-allowed opacity-50' : ''} `}
            >
              <span
                className={`text-sm font-bold ${isSelected ? 'text-brand-primary' : 'text-gray-700'}`}
              >
                {variant.label || variant.volume}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

