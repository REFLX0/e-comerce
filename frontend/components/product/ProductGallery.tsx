"use client";

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'

interface Props {
  images: string[]
  productName: string
  variantImageUrl?: string | null
}

export function ProductGallery({ images, productName, variantImageUrl }: Props) {
  const t = useTranslations('Product')
  const displayImages = variantImageUrl ? [variantImageUrl] : images
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageUnavailable, setImageUnavailable] = useState(false)

  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="bg-brand-surface border-brand-surface-dark flex aspect-square items-center justify-center rounded-2xl border">
        <span className="text-gray-400">{t('imageNotAvailable')}</span>
      </div>
    )
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
            src={displayImages[currentIndex] || ''}
            alt={`${productName} - Image ${currentIndex + 1}`}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            priority
            onError={() => setImageUnavailable(true)}
          />
        )}

        {displayImages.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
              className="text-brand-primary absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))}
              className="text-brand-primary absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image counter pill */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); setImageUnavailable(false) }}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                currentIndex === idx
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
