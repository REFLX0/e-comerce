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

      {/* 2. Trust badges — above fold */}
      <section className="bg-brand-surface py-6 md:py-10 lg:py-16">
        <div className="section-padding">
          <TrustBadges />
        </div>
      </section>

      {/* 3. Oil finder */}
      <section className="py-6 md:py-10 lg:py-16 bg-white">
        <div className="mb-10 text-center px-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-muted">
            {t('findYourOil')}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-brand-primary md:text-4xl">
            {t('rightLubricant')}
          </h2>
          <p className="mt-3 text-sm text-gray-500 max-w-md mx-auto">
            Trouvez l&apos;huile parfaitement adaptée à votre véhicule en quelques clics
          </p>
        </div>

        <div>
          <OilFinderTabs />
        </div>
      </section>

      {/* 4. Category tiles */}
      <CategoryGrid />

      {/* 5. Best sellers */}
      <BestSellers />
    </>
  )
}
