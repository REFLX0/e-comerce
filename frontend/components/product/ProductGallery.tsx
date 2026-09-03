"use client";

import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import type { ProductVariant } from '@/lib/types'

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

  // 1. Variant Detection & Sorting
  const sortedVariantImages = useMemo(() => {
    if (!variants || variants.length === 0) return []
    // Filter variants that have images and volumes, sort by volume ascending
    const withImages = variants
      .filter((v) => !!v.imageUrl && v.volumeL !== undefined)
      .sort((a, b) => (a.volumeL || 0) - (b.volumeL || 0))
    
    // Extract just the image URLs
    return withImages.map(v => v.imageUrl as string)
  }, [variants])

  // Combine product images and variant images for the static thumbnail grid, removing duplicates
  const allThumbnails = useMemo(() => {
    const combined = [...images, ...sortedVariantImages]
    return Array.from(new Set(combined))
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
      const idx = allThumbnails.indexOf(variantImageUrl)
      if (idx !== -1) {
        setCurrentIndex(idx)
      }
    }
  }, [isVariantManuallySelected, variantImageUrl, allThumbnails])

  // If autoplaying, display the currently cycling variant image.
  // Otherwise, fallback to the manual selection or standard grid behavior.
  const currentMainImage = isAutoplayEligible 
    ? sortedVariantImages[currentIndex]
    : allThumbnails[currentIndex]

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
            src={currentMainImage || ''}
            alt={`${productName} - Image ${currentIndex + 1}`}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            priority
            onError={() => setImageUnavailable(true)}
          />
        )}

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

        {/* Image counter pill */}
        {allThumbnails.length > 1 && !isAutoplayEligible && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
            {currentIndex + 1} / {allThumbnails.length}
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
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                (isAutoplayEligible ? (img === currentMainImage) : currentIndex === idx)
                  ? 'border-brand-primary shadow-md ring-2 ring-brand-primary/20 scale-105'
                  : 'hover:border-brand-primary/40 border-gray-200 opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
