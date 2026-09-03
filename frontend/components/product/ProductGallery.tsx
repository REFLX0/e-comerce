"use client";

import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import type { ProductVariant } from '@/lib/types'

/**
 * Parses a volume string like "500ml", "1L", "2.5L", "250mL", "1.5 L"
 * and returns the numeric value in litres. Returns null if unparseable.
 */
function parseVolumeToL(volume?: string | null): number | null {
  if (!volume) return null
  const clean = volume.trim().toLowerCase()
  const match = clean.match(/^([\d.]+)\s*(ml|l)$/)
  if (!match || !match[1] || !match[2]) return null
  const numStr = match[1]
  const unit = match[2]
  const val = parseFloat(numStr)
  if (isNaN(val)) return null
  return unit === 'ml' ? val / 1000 : val
}

/**
 * Normalizes an image URL or path to a comparable key (e.g. filename)
 * so that full URLs and relative URLs referring to the same file are properly deduplicated.
 */
function normalizeImageKey(url?: string | null): string {
  if (!url) return ''
  try {
    const withoutQuery = url.trim().split('?')[0] ?? ''
    const clean = withoutQuery.split('#')[0] ?? ''
    const parts = clean.split('/')
    const lastPart = parts[parts.length - 1] ?? ''
    const filename = lastPart.toLowerCase()
    return filename || clean.toLowerCase()
  } catch {
    return (url || '').trim().toLowerCase()
  }
}

interface Props {
  images: string[]
  productName: string
  variantImageUrl?: string | null
  variants?: ProductVariant[]
  isVariantManuallySelected?: boolean
}

export function ProductGallery({ images, productName, variantImageUrl, variants, isVariantManuallySelected }: Props) {
  const t = useTranslations('Product')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageUnavailable, setImageUnavailable] = useState(false)
  const [hasInteractedWithGallery, setHasInteractedWithGallery] = useState(false)
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 1. Variant Detection & Sorting — parse the volume string since backend doesn't return volumeL
  const sortedVariantImages = useMemo(() => {
    if (!variants || variants.length === 0) return []
    // Filter variants that have images and a parseable volume, sort ascending
    const withImages = variants
      .filter((v) => !!v.imageUrl && parseVolumeToL(v.volume) !== null)
      .sort((a, b) => (parseVolumeToL(a.volume) ?? 0) - (parseVolumeToL(b.volume) ?? 0))

    // De-duplicate images (some variants share the same image)
    const seen = new Set<string>()
    const deduped: string[] = []
    for (const v of withImages) {
      const url = v.imageUrl as string
      const key = normalizeImageKey(url)
      if (key && !seen.has(key)) {
        seen.add(key)
        deduped.push(url)
      }
    }
    return deduped
  }, [variants])

  // Combine variant images (sorted ascending by capacity) and extra product images, eliminating any duplicates
  const allThumbnails = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []

    // 1. Prioritize sorted variant images (1L, 5L, 20L, 60L...)
    for (const url of sortedVariantImages) {
      const key = normalizeImageKey(url)
      if (key && !seen.has(key)) {
        seen.add(key)
        result.push(url)
      }
    }

    // 2. Add extra gallery images that are NOT already in the variant images list
    for (const url of images || []) {
      const key = normalizeImageKey(url)
      if (key && !seen.has(key)) {
        seen.add(key)
        result.push(url)
      }
    }

    return result
  }, [images, sortedVariantImages])

  // 2. Determine if Autoplay is eligible
  // Also stop autoplay if they interacted with the gallery itself (clicked thumbnail/arrows)
  const isAutoplayEligible = !isVariantManuallySelected && !hasInteractedWithGallery && sortedVariantImages.length > 1

  // 3. Autoplay Loop
  useEffect(() => {
    if (isAutoplayEligible) {
      autoplayTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev === sortedVariantImages.length - 1 ? 0 : prev + 1))
      }, 3500)
    }

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current)
    }
  }, [isAutoplayEligible, sortedVariantImages.length])

  // 4. Snap to variant image if manually selected
  useEffect(() => {
    if (isVariantManuallySelected && variantImageUrl) {
      // Try to sync the thumbnail highlight to match the selected variant image
      const targetKey = normalizeImageKey(variantImageUrl)
      const idx = allThumbnails.findIndex((img) => normalizeImageKey(img) === targetKey)
      if (idx !== -1) setCurrentIndex(idx)
    } else if (!isVariantManuallySelected) {
      // Reset to first image when selection is cleared
      setCurrentIndex(0)
    }
  }, [isVariantManuallySelected, variantImageUrl, allThumbnails])

  // If autoplaying, display the currently cycling variant image.
  // If a variant is manually selected and has its own image, show it directly.
  // Otherwise, fallback to the standard thumbnail grid.
  const currentMainImage = (() => {
    if (isAutoplayEligible) return sortedVariantImages[currentIndex]
    if (isVariantManuallySelected && variantImageUrl) return variantImageUrl
    return allThumbnails[currentIndex] || allThumbnails[0]
  })()

  // Edge Case fallback if absolutely no images exist
  if (!allThumbnails || allThumbnails.length === 0) {
    return (
      <div className="bg-brand-surface border-brand-surface-dark flex aspect-square items-center justify-center rounded-2xl border">
        <span className="text-gray-400">{t('imageNotAvailable')}</span>
      </div>
    )
  }

  const handleManualNavigation = (newIndex: number) => {
    setHasInteractedWithGallery(true)
    setCurrentIndex(newIndex)
    setImageUnavailable(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="group relative w-full aspect-square sm:aspect-[4/3] bg-white overflow-hidden rounded-2xl flex items-center justify-center">
        {imageUnavailable ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-400">
            <Package size={34} strokeWidth={1.5} />
            <span className="text-sm">{t('imageNotAvailable')}</span>
          </div>
        ) : (
          <Image
            key={currentMainImage}
            src={currentMainImage || ''}
            alt={`${productName} - Image ${currentIndex + 1}`}
            fill
            className="object-contain p-4 transition-all duration-700 ease-in-out group-hover:scale-105"
            style={{ animation: isAutoplayEligible ? 'galleryFadeIn 0.7s ease-in-out' : undefined }}
            priority
            onError={() => setImageUnavailable(true)}
          />
        )}

        {/* Manual nav arrows — hidden during autoplay */}
        {allThumbnails.length > 1 && !isAutoplayEligible && (
          <>
            <button
              onClick={() => handleManualNavigation(currentIndex === 0 ? allThumbnails.length - 1 : currentIndex - 1)}
              className="text-brand-primary absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => handleManualNavigation(currentIndex === allThumbnails.length - 1 ? 0 : currentIndex + 1)}
              className="text-brand-primary absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image counter pill — manual mode */}
        {allThumbnails.length > 1 && !isAutoplayEligible && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
            {currentIndex + 1} / {allThumbnails.length}
          </div>
        )}

        {/* Autoplay dot indicators */}
        {isAutoplayEligible && sortedVariantImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sortedVariantImages.map((_, i) => (
              <button
                key={i}
                onClick={() => handleManualNavigation(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentIndex
                    ? 'w-6 bg-brand-primary'
                    : 'w-1.5 bg-brand-primary/30 hover:bg-brand-primary/60'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails (Static during autoplay) */}
      {allThumbnails.length > 1 && (
        <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
          {allThumbnails.map((img, idx) => (
            <button
              key={idx}
              onClick={() => handleManualNavigation(idx)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all duration-300 ${
                (isAutoplayEligible ? (normalizeImageKey(img) === normalizeImageKey(currentMainImage)) : currentIndex === idx)
                  ? 'border-brand-primary shadow-md ring-2 ring-brand-primary/20 scale-105'
                  : 'hover:border-brand-primary/40 border-gray-200 opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img} alt="" fill className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
