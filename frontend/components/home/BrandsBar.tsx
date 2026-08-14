"use client";

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Static list of brands with confirmed local SVG logos
const KNOWN_BRANDS = [
  { slug: 'yacco',         name: 'Yacco',         logo: '/img/b/yacco.svg' },
  { slug: 'shell',         name: 'Shell',         logo: '/img/b/shell.svg' },
  { slug: 'totalenergies', name: 'TotalEnergies', logo: '/img/b/total.svg' },
  { slug: 'castrol',       name: 'Castrol',       logo: '/img/b/castrol.svg' },
  { slug: 'liqui-moly',    name: 'Liqui Moly',   logo: '/img/b/liqui-moly.svg' },
  { slug: 'motul',         name: 'Motul',         logo: '/img/b/motul.svg' },
  { slug: 'bosch',         name: 'Bosch',         logo: '/img/b/bosch.svg' },
  { slug: 'purflux',       name: 'Purflux',       logo: '/img/b/purflux.svg' },
  { slug: 'wynns',         name: "Wynn's",        logo: '/img/b/wynns.svg' },
]

export function BrandsBar() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused || !scrollRef.current) return
    const timer = window.setInterval(() => {
      const carousel = scrollRef.current
      if (!carousel) return
      const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 8
      carousel.scrollTo({ left: atEnd ? 0 : carousel.scrollLeft + 180, behavior: 'smooth' })
    }, 3000)
    return () => window.clearInterval(timer)
  }, [isPaused])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'right' ? 200 : -200, behavior: 'smooth' })
  }


  return (
    <section className="border-y border-gray-100 bg-white py-12">
      <div className="section-padding">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-accent">
              Partenaires officiels
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-brand-primary">
              Marques de Confiance
            </h2>
          </div>
          {/* Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all hover:border-brand-primary hover:text-brand-primary"
              aria-label="Précédent"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all hover:border-brand-primary hover:text-brand-primary"
              aria-label="Suivant"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable brand logos */}
        <div
          ref={scrollRef}
          className="hide-scrollbar flex gap-4 overflow-x-auto pb-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {KNOWN_BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/marque/${brand.slug}`}
              title={brand.name}
              className="relative flex h-16 w-28 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 opacity-60 transition-all duration-200 hover:border-gray-200 hover:bg-white hover:opacity-100 hover:shadow-md md:h-20 md:w-36"
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain p-3 grayscale transition-all duration-200 hover:grayscale-0"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
