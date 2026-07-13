import { HeroBanner } from '@/components/home/HeroBanner'
import { BestSellers } from '@/components/home/BestSellers'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { TrustBadges } from '@/components/common/TrustBadges'
import { OilFinderTabs } from '@/features/oil-finder/components/OilFinderTabs'
import { getTranslations } from 'next-intl/server'

export default async function Home() {
  const t = await getTranslations('Home')
  return (
    <>
      {/* 1. Hero — dark block */}
      <HeroBanner />

      {/* 2. Oil finder — dark block */}
      <section
        className="relative overflow-hidden py-14 md:py-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(225,6,0,0.08) 0%, #080808 50%, #050505 100%)',
        }}
      >
        {/* Decorative grid lines */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Top red glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(225,6,0,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Section heading */}
        <div className="relative z-10 mb-10 text-center px-4">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(225,6,0,0.1)',
              border: '1px solid rgba(225,6,0,0.25)',
              color: '#E10600',
            }}
          >
            <span>🔍</span> {t('findYourOil')}
          </div>
          <h2
            className="text-3xl font-black tracking-tight text-white md:text-4xl"
            style={{ textShadow: '0 0 60px rgba(225,6,0,0.2)' }}
          >
            {t('rightLubricant')}
          </h2>
          <p className="mt-3 text-sm text-gray-500 max-w-md mx-auto">
            Deux méthodes pour trouver l&apos;huile parfaitement adaptée à votre véhicule
          </p>
        </div>

        <div className="relative z-10">
          <OilFinderTabs />
        </div>
      </section>

      {/* 3. Trust strip — white block */}
      <section className="bg-white">
        <TrustBadges />
      </section>

      {/* 4. Category tiles — white block */}
      <CategoryGrid />

      {/* 5. Best sellers — dark block */}
      <BestSellers />
    </>
  )
}
