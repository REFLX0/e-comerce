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
        style={{ background: '#080808' }}
      >
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

        {/* Section heading */}
        <div className="relative z-10 mb-10 text-center px-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-red-600/80">
            {t('findYourOil')}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {t('rightLubricant')}
          </h2>
          <p className="mt-3 text-sm text-neutral-500 max-w-md mx-auto">
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
