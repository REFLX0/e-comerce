'use client'

import { useEffect, useMemo, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { formatPrice } from '@/lib/utils/format'
import { useTranslations } from 'next-intl'

const FALLBACK_BOUNDS = { min: 0, max: 5000 }

export interface PriceRangeValue {
  min?: number
  max?: number
}

interface PriceFilterProps {
  /** Facet bounds for the slider (from the facets endpoint). */
  bounds: PriceRangeValue
  /** Currently active price range (from URL or draft). */
  value: PriceRangeValue
  onChange: (value: PriceRangeValue) => void
}

function parseAmount(raw: string): number | undefined {
  const normalized = raw.replace(/[^\d.,]/g, '').replace(',', '.')
  if (!normalized) return undefined
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

/**
 * Debounced dual-thumb price slider with editable min/max inputs,
 * DT-formatted labels and a commit-on-release slider.
 */
export function PriceFilter({ bounds, value, onChange }: PriceFilterProps) {
  const t = useTranslations('Catalogue')

  const sliderBounds = useMemo(() => {
    const min = Math.min(bounds.min ?? FALLBACK_BOUNDS.min, value.min ?? bounds.min ?? FALLBACK_BOUNDS.min)
    const max = Math.max(bounds.max ?? FALLBACK_BOUNDS.max, value.max ?? bounds.max ?? FALLBACK_BOUNDS.max)
    return { min, max }
  }, [bounds.min, bounds.max, value.min, value.max])

  const [slider, setSlider] = useState<[number, number]>([
    value.min ?? sliderBounds.min,
    value.max ?? sliderBounds.max,
  ])
  const [minStr, setMinStr] = useState(value.min !== undefined ? String(value.min) : '')
  const [maxStr, setMaxStr] = useState(value.max !== undefined ? String(value.max) : '')

  const debouncedMin = useDebounce(minStr, 500)
  const debouncedMax = useDebounce(maxStr, 500)

  /* External changes (URL navigation, clear-all, draft sync) → local state */
  useEffect(() => {
    setSlider([
      value.min ?? sliderBounds.min,
      value.max ?? sliderBounds.max,
    ])
  }, [value.min, value.max, sliderBounds.min, sliderBounds.max])

  useEffect(() => {
    setMinStr(value.min !== undefined ? String(value.min) : '')
  }, [value.min])

  useEffect(() => {
    setMaxStr(value.max !== undefined ? String(value.max) : '')
  }, [value.max])

  /* Debounced commit for the text inputs */
  useEffect(() => {
    const parsed = parseAmount(debouncedMin)
    if (parsed === value.min) return
    onChange({ min: parsed, max: value.max })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin, value.min, value.max])

  useEffect(() => {
    const parsed = parseAmount(debouncedMax)
    if (parsed === value.max) return
    onChange({ min: value.min, max: parsed })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMax, value.min, value.max])

  const commitSlider = (values: number[]) => {
    const [minV, maxV] = values
    if (minV === undefined || maxV === undefined) return
    setSlider([minV, maxV])
    const commitMin = minV <= sliderBounds.min ? undefined : minV
    const commitMax = maxV >= sliderBounds.max ? undefined : maxV
    onChange({ min: commitMin, max: commitMax })
  }

  const sliderTooWide = sliderBounds.max - sliderBounds.min < 1

  return (
    <div className="px-1">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-[13px] font-black text-[#D4A76A]">{formatPrice(slider[0])}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
        <span className="text-[13px] font-black text-[#D4A76A]">{formatPrice(slider[1])}</span>
      </div>

      {!sliderTooWide ? (
        <Slider
          min={sliderBounds.min}
          max={sliderBounds.max}
          step={1}
          value={[slider[0], slider[1]]}
          onValueChange={(values) => setSlider([values[0], values[1]])}
          onValueCommitted={(values) => commitSlider(values as number[])}
          aria-label={t('price')}
          className="my-5"
        />
      ) : (
        <p className="py-2 text-[11px] text-white/40">
          {formatPrice(sliderBounds.min)} — {formatPrice(sliderBounds.max)}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="relative block">
          <span className="sr-only">{t('priceMin')}</span>
          <input
            type="text"
            inputMode="decimal"
            value={minStr}
            onChange={(event) => setMinStr(event.target.value)}
            placeholder={t('priceMin')}
            aria-label={t('priceMin')}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 pe-9 text-xs font-semibold text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#D4A76A]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/40"
          >
            DT
          </span>
        </label>
        <label className="relative block">
          <span className="sr-only">{t('priceMax')}</span>
          <input
            type="text"
            inputMode="decimal"
            value={maxStr}
            onChange={(event) => setMaxStr(event.target.value)}
            placeholder={t('priceMax')}
            aria-label={t('priceMax')}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 pe-9 text-xs font-semibold text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#D4A76A]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/40"
          >
            DT
          </span>
        </label>
      </div>
    </div>
  )
}