"use client"

import Image from 'next/image'
import { ArrowRight, Search } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export function HeroBanner() {
  const t = useTranslations('Home')
  return (
    <section className="relative isolate overflow-hidden bg-[#0a0f1e] min-h-[580px] flex items-center">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-brand-primary/20 blur-[120px]" />
        <div className="absolute -bottom-32 right-0 h-[500px] w-[500px] rounded-full bg-brand-accent/10 blur-[120px]" />
      </div>

      {/* Product image — right side only, desktop */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
        <Image
          src="/img/hero/hero_oils.png"
          alt=""
          fill
          className="object-contain object-right-bottom scale-105"
          priority
        />
        {/* Fade to dark on left edge */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e] via-[#0a0f1e]/30 to-transparent" />
      </div>

      {/* Mobile background */}
      <div className="absolute inset-0 lg:hidden">
        <Image
          src="/img/hero/hero_oils.png"
          alt=""
          fill
          className="object-cover object-center opacity-15"
          priority
        />
      </div>

      {/* Content */}
      <div className="section-padding relative z-10 w-full py-20 md:py-28">
        <div className="max-w-xl">
          {/* Kicker */}
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-accent">
            {t('maxProtection')}
          </p>

          {/* H1 */}
          <h1 className="mt-5 text-4xl font-black uppercase leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
            HUILES MOTEUR<br />
            <span className="text-brand-accent">PREMIUM</span><br />
            POUR CHAQUE TRAJET
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-white/55">
            {t('heroDescription')}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
            <Link
              href="/catalogue"
              className="group inline-flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-lg bg-brand-accent px-8 text-sm font-black uppercase tracking-widest text-brand-primary-dark transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_24px_rgba(230,160,0,0.35)]"
            >
              {t('shopNow')}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#oil-finder"
              className="inline-flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-lg border border-white/25 px-8 text-sm font-bold uppercase tracking-widest text-white transition-all duration-200 hover:border-white/60 hover:bg-white/8"
            >
              <Search size={16} />
              {t('findMyOil')}
            </Link>
          </div>

          {/* Mini stats */}
          <div className="mt-12 flex items-center gap-8">
            <div>
              <p className="text-2xl font-black text-white">500+</p>
              <p className="text-xs text-white/40 uppercase tracking-wider">Produits</p>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div>
              <p className="text-2xl font-black text-white">15+</p>
              <p className="text-xs text-white/40 uppercase tracking-wider">Marques</p>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div>
              <p className="text-2xl font-black text-white">24h</p>
              <p className="text-xs text-white/40 uppercase tracking-wider">Livraison</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
