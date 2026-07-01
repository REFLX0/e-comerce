"use client";

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="bg-brand-surface border-brand-surface-dark flex aspect-square items-center justify-center rounded-2xl border">
        <span className="text-gray-400">Image non disponible</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-brand-surface border-brand-surface-dark relative aspect-square overflow-hidden rounded-2xl border">
        <Image
          src={images[currentIndex] || ''}
          alt={`${productName} - Image ${currentIndex + 1}`}
          fill
          className="object-contain p-8"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="text-brand-primary absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-sm transition-colors hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="text-brand-primary absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-sm transition-colors hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                currentIndex === idx
                  ? 'border-brand-primary'
                  : 'hover:border-brand-primary/50 border-transparent'
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
