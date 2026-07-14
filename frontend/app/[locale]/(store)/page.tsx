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
      {/* 1. Hero */}
      <HeroBanner />

      {/* 2. Oil finder */}
      <section className="py-14 md:py-20 bg-white">
        <div className="mb-10 text-center px-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-red-600">
            {t('findYourOil')}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            {t('rightLubricant')}
          </h2>
          <p className="mt-3 text-sm text-neutral-500 max-w-md mx-auto">
            Deux méthodes pour trouver l&apos;huile parfaitement adaptée à votre véhicule
          </p>
        </div>

        <div>
          <OilFinderTabs />
        </div>
      </section>

      {/* 3. Trust strip */}
      <section className="bg-neutral-50">
        <TrustBadges />
      </section>

      {/* 4. Category tiles */}
      <CategoryGrid />

      {/* 5. Best sellers — dark block */}
      <BestSellers />
    </>
  )
}
