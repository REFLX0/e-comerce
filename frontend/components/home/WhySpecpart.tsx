"use client"

import { useTranslations } from 'next-intl'
import { ShieldCheck, Tag, Truck, HeadphonesIcon } from 'lucide-react'

const PILLARS = [
  { icon: ShieldCheck, titleKey: 'qualityTitle', descKey: 'qualityDesc' },
  { icon: Tag, titleKey: 'competitivePricesTitle', descKey: 'competitivePricesDesc' },
  { icon: Truck, titleKey: 'fastDeliveryTitle', descKey: 'fastDeliveryDesc' },
  { icon: HeadphonesIcon, titleKey: 'expertSupportTitle', descKey: 'expertSupportDesc' },
]

export function WhySpecpart() {
  const t = useTranslations('Home')

  return (
    <section className="bg-brand-primary py-16 md:py-20">
      <div className="section-padding">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-accent">
            {t('ourCommitment')}
          </p>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
            {t('whyChooseSpecpart')}
          </h2>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.titleKey}
                className="group flex flex-col items-center text-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur transition-all duration-200 hover:border-brand-accent/40 hover:bg-white/10"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-accent/15 text-brand-accent transition-colors group-hover:bg-brand-accent/25">
                  <Icon size={28} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t(p.titleKey)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{t(p.descKey)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}