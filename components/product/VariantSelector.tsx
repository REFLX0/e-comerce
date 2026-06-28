'use client'

import type { ProductVariant } from '@/lib/types'

interface Props {
  variants: ProductVariant[]
  selectedVariant: ProductVariant
  onChange: (variant: ProductVariant) => void
}

export function VariantSelector({ variants, selectedVariant, onChange }: Props) {
  if (!variants || variants.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-brand-primary mb-3">Volume</h3>
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => onChange(variant)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
              selectedVariant.id === variant.id
                ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                : 'border-brand-surface-dark text-gray-600 hover:border-brand-primary/30'
            }`}
          >
            {variant.volume}
          </button>
        ))}
      </div>
    </div>
  )
}
