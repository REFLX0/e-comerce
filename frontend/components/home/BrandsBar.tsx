"use client";

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Static list of brands with confirmed local PNG logos
const KNOWN_BRANDS = [
  { slug: 'yacco',         name: 'Yacco',         logo: '/img/b/Yacco.png' },
  { slug: 'shell',         name: 'Shell',         logo: '/img/b/Shell.png' },
  { slug: 'totalenergies', name: 'TotalEnergies', logo: '/img/b/Total.png' },
  { slug: 'castrol',       name: 'Castrol',       logo: '/img/b/Castrol.png' },
  { slug: 'liqui-moly',    name: 'Liqui Moly',    logo: '/img/b/Liqui Moly.png' },
  { slug: 'motul',         name: 'Motul',         logo: '/img/b/Motul.png' },
  { slug: 'bosch',         name: 'Bosch',         logo: '/img/b/Bosch.png' },
  { slug: 'purflux',       name: 'Purflux',       logo: '/img/b/Purflux.png' },
  { slug: 'wynns',         name: "Wynn's",        logo: '/img/b/Wynns.png' },
]

export function BrandsBar() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const t = useTranslations('Home')

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
              aria-label={t('previous')}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all hover:border-brand-primary hover:text-brand-primary"
              aria-label={t('next')}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable brand logos */}
        <div
          ref={scrollRef}
          className="hide-scrollbar flex gap-4 overflow-x-auto pb-3 pt-1"
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
              className="group relative flex h-20 w-36 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4A76A]/40 hover:shadow-[0_8px_20px_rgba(22,37,76,0.08)] md:h-24 md:w-44"
            >
              <div className="relative h-full w-full">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
