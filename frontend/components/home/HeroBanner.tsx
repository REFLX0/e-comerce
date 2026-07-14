"use client"

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export function HeroBanner() {
  const t = useTranslations('Home')
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div className="section-padding relative z-10 grid min-h-[520px] items-center gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-0">

        {/* ── Left: Copy ────────────────────────────────────────── */}
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
            {t('maxProtection')}
          </p>

          <h1
            className="mt-4 text-4xl font-bold uppercase tracking-tight text-brand-primary sm:text-5xl lg:text-6xl xl:text-7xl"
            style={{ lineHeight: 1.08 }}
          >
            {t('highPerformance')}
          </h1>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-600">
            {t('heroDescription')}
          </p>

          {/* CTA */}
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/catalogue"
              className="group inline-flex h-12 items-center gap-2 rounded bg-brand-primary px-8 text-sm font-semibold uppercase tracking-wider text-white transition-colors duration-200 hover:bg-brand-primary-light"
            >
              {t('shopNow')}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#oil-finder"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-brand-accent"
            >
              {t('findMyOil')} →
            </Link>
          </div>
        </div>

        {/* ── Right: Product Image ──────────────────────────────── */}
        <div className="relative hidden h-[480px] items-center justify-center lg:flex">
          <Image
            src="/img/hero/hero_oils.png"
            alt="Premium Motor Oils"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>
    </section>
  )
}
