"use client";

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: Props) {
  const t = useTranslations('Product')
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="bg-brand-surface border-brand-surface-dark flex aspect-square items-center justify-center rounded-2xl border">
        <span className="text-gray-400">{t('imageNotAvailable')}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="bg-brand-surface border-brand-surface-dark group relative aspect-square overflow-hidden rounded-2xl border shadow-card">
        <Image
          src={images[currentIndex] || ''}
          alt={`${productName} - Image ${currentIndex + 1}`}
          fill
          className="object-contain p-8 transition-transform duration-500 group-hover:scale-110"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="text-brand-primary absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="text-brand-primary absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image counter pill */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                currentIndex === idx
                  ? 'border-brand-accent shadow-md ring-2 ring-brand-accent/30 scale-105'
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
