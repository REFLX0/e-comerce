"use client"

import Image from 'next/image'
import { ArrowRight, Search } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export function HeroBanner() {
  const t = useTranslations('Home')
  return (
    <section className="relative isolate overflow-hidden bg-brand-primary-dark min-h-[600px] flex items-center">
      {/* Background image with dark overlay */}
      <div className="absolute inset-0">
        <Image
          src="/img/hero/hero_oils.png"
          alt=""
          fill
          className="object-cover object-center scale-110 opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary-dark/95 via-brand-primary-dark/80 to-brand-primary-dark/70" />
      </div>

      {/* Content */}
      <div className="section-padding relative z-10 w-full py-16 md:py-20 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-accent">
            {t('maxProtection')}
          </p>

          <h1
            className="mt-6 text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            style={{ lineHeight: 1.08 }}
          >
            PREMIUM ENGINE OILS FOR EVERY DRIVE
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/60">
            {t('heroDescription')}
          </p>

          {/* Two CTAs side by side */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/catalogue"
              className="group inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded bg-brand-primary px-8 text-sm font-bold uppercase tracking-wider text-brand-accent transition-all duration-200 hover:bg-brand-primary-light hover:shadow-lg"
            >
              {t('shopNow')}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#oil-finder"
              className="inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded border-2 border-white/30 px-8 text-sm font-bold uppercase tracking-wider text-white transition-all duration-200 hover:border-white hover:bg-white/10"
            >
              <Search size={16} />
              {t('findMyOil')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
