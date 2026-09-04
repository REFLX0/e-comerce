"use client"

import Image from 'next/image'
import { ArrowRight, Search, Star, Award, Truck, ShieldCheck } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export function HeroBanner() {
  const t = useTranslations('Home')
  return (
    <section className="relative isolate overflow-hidden bg-[#0a0f1e] min-h-[580px] flex items-center">
      {/* Full hero background — dark on the left keeps the content readable. */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/img/hero/auto-parts-bg.png"
          alt=""
          fill
          sizes="100vw"
          quality={60}
          className="object-cover object-center"
          priority
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,12,24,0.98)_0%,rgba(5,12,24,0.88)_35%,rgba(5,12,24,0.35)_72%,rgba(5,12,24,0.12)_100%)]" />
      </div>

      {/* Content */}
      <div className="section-padding relative z-10 w-full py-20 md:py-28">
        <div className="max-w-2xl">
          {/* H1 */}
          <h1 className="text-4xl font-black uppercase leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('heroTitle1')}<br />
            <span className="text-brand-accent">{t('heroTitleHighlight')}</span><br />
            {t('heroTitle2')}
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70">
            {t('heroSubtitle')}
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
              {t('findMyPart')}
            </Link>
          </div>

          {/* Mini stats */}
          <div className="mt-12 flex flex-wrap items-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <Star className="text-brand-accent h-6 w-6" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-black text-white leading-tight">500+</p>
                <p className="text-[10px] text-white/75 uppercase tracking-widest">{t('statsProducts')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Award className="text-brand-accent h-6 w-6" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-black text-white leading-tight">15+</p>
                <p className="text-[10px] text-white/75 uppercase tracking-widest">{t('statsBrands')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Truck className="text-brand-accent h-6 w-6" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-black text-white leading-tight">24H</p>
                <p className="text-[10px] text-white/75 uppercase tracking-widest">{t('statsDelivery')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-brand-accent h-6 w-6" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-black text-white leading-tight">{t('statsQuality')}</p>
                <p className="text-[10px] text-white/75 uppercase tracking-widest">{t('statsGuaranteed')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
