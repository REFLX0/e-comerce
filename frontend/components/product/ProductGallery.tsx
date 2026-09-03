"use client";

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import type { ProductVariant } from '@/lib/types'
import { parseVolumeToL, matchVolumeImage } from '@/lib/utils/format'

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
    return lastPart.toLowerCase().replace(/[-_.]/g, '')
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
  onVariantChange?: (variant: ProductVariant) => void
}

export function ProductGallery({ images, productName, variantImageUrl, variants, isVariantManuallySelected, onVariantChange }: Props) {
  const t = useTranslations('Product')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageUnavailable, setImageUnavailable] = useState(false)

  // 1. Variant Detection & Sorting — parse the volume string and map to variant
  const variantItems = useMemo(() => {
    if (!variants || variants.length === 0) return []
    // Resolve volume-matching images for variants and sort ascending (1L -> 5L -> 20L)
    const withImages = variants
      .map((v) => {
        const resolved = v.imageUrl || matchVolumeImage(images, v.volume) || undefined
        return resolved ? { ...v, imageUrl: resolved } : v
      })
      .filter((v) => !!v.imageUrl && parseVolumeToL(v.volume) !== null)
      .sort((a, b) => (parseVolumeToL(a.volume) ?? 0) - (parseVolumeToL(b.volume) ?? 0))

    // De-duplicate images strictly (no duplicate bottle images)
    const seen = new Set<string>()
    const items: { url: string; variant: ProductVariant }[] = []
    for (const v of withImages) {
      const url = v.imageUrl as string
      const key = normalizeImageKey(url)
      if (key && !seen.has(key)) {
        seen.add(key)
        items.push({ url, variant: v })
      }
    }
    return items
  }, [variants, images])

  // Thumbnails: Variant images in ascending volume order first, followed by any additional distinct product images
  const allThumbnails = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []

    // 1. Variant images in ascending volume order
    for (const item of variantItems) {
      const key = normalizeImageKey(item.url)
      if (key && !seen.has(key)) {
        seen.add(key)
        result.push(item.url)
      }
    }

    // 2. Any additional product images (e.g. 20L bidon, extra angles) without duplicating
    for (const url of images || []) {
      const key = normalizeImageKey(url)
      if (key && !seen.has(key)) {
        seen.add(key)
        result.push(url)
      }
    }
    return result
  }, [images, variantItems])

  // Snap to variant image if manually selected
  useEffect(() => {
    if (isVariantManuallySelected && variantImageUrl) {
      const targetKey = normalizeImageKey(variantImageUrl)
      const idx = allThumbnails.findIndex((img) => normalizeImageKey(img) === targetKey)
      if (idx !== -1) setCurrentIndex(idx)
    } else if (!isVariantManuallySelected) {
      setCurrentIndex(0)
    }
  }, [isVariantManuallySelected, variantImageUrl, allThumbnails])

  const currentMainImage = (() => {
    if (isVariantManuallySelected && variantImageUrl) return variantImageUrl
    return allThumbnails[currentIndex] || allThumbnails[0]
  })()

  // Edge Case fallback if absolutely no images exist
  if (!allThumbnails || allThumbnails.length === 0) {
    return (
      <div className="bg-brand-surface border-brand-surface-dark flex aspect-square items-center justify-center rounded-2xl border">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Package size={48} strokeWidth={1.5} />
          <span className="text-sm font-medium">{t('imageNotAvailable')}</span>
        </div>
      </div>
    )
  }

  const handleManualNavigation = (index: number) => {
    setCurrentIndex(index)
    setImageUnavailable(false)
    const clickedUrl = allThumbnails[index]
    const matchedItem = variantItems.find(
      (item) => normalizeImageKey(item.url) === normalizeImageKey(clickedUrl)
    )
    if (matchedItem?.variant && onVariantChange) {
      onVariantChange(matchedItem.variant)
    }
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
            className="object-contain p-4 transition-all duration-300 ease-in-out group-hover:scale-105"
            priority
            onError={() => setImageUnavailable(true)}
          />
        )}

        {/* Manual nav arrows */}
        {allThumbnails.length > 1 && (
          <>
            <button
              onClick={() => handleManualNavigation(currentIndex === 0 ? allThumbnails.length - 1 : currentIndex - 1)}
              className="text-brand-primary absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => handleManualNavigation(currentIndex === allThumbnails.length - 1 ? 0 : currentIndex + 1)}
              className="text-brand-primary absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image counter pill */}
        {allThumbnails.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
            {currentIndex + 1} / {allThumbnails.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allThumbnails.length > 1 && (
        <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
          {allThumbnails.map((img, idx) => (
            <button
              key={idx}
              onClick={() => handleManualNavigation(idx)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all duration-200 ${
                currentIndex === idx
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
