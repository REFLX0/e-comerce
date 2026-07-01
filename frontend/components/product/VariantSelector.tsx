"use client";

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
      <h3 className="text-brand-primary mb-3 text-sm font-semibold">Volume</h3>
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariant.id === variant.id
          return (
            <button
              key={variant.id}
              onClick={() => onChange(variant)}
              disabled={variant.status === 'out_of_stock'}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all ${
                isSelected
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'hover:border-brand-primary/50 border-gray-200'
              } ${variant.status === 'out_of_stock' ? 'cursor-not-allowed opacity-50' : ''} `}
            >
              <span
                className={`font-semibold ${isSelected ? 'text-brand-primary' : 'text-gray-700'}`}
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
