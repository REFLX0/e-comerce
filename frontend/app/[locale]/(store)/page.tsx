import { HeroBanner } from '@/components/home/HeroBanner'
import { BestSellers } from '@/components/home/BestSellers'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { TrustBadges } from '@/components/common/TrustBadges'
import { BrandsBar } from '@/components/home/BrandsBar'
import { WhySpecpart } from '@/components/home/WhySpecpart'
import { OilFinderTabs } from '@/features/oil-finder/components/OilFinderTabs'
import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('Home')

  return (
    <>
      {/* 1. Hero */}
      <HeroBanner />

      {/* 2. Oil Finder — full section */}
      <section id="oil-finder" className="relative overflow-hidden border-b border-brand-primary/10 bg-[linear-gradient(180deg,#f7f9fc_0%,#ffffff_72%)] py-16 md:py-20">
        <div aria-hidden="true" className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-brand-accent/10 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand-primary/[0.06] blur-3xl" />
        <div className="section-padding">
          <div className="relative mb-10 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-brand-accent">
              {t('searchTool')}
            </p>
            <h2 className="text-3xl font-black tracking-tight text-brand-primary md:text-5xl">
              {t('findMyOil')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-500 md:text-base">
              {t('oilFinderDescription')}
            </p>
          </div>
          <OilFinderTabs />
        </div>
      </section>

      {/* 3. Reassurance strip */}
      <section className="bg-white py-10 md:py-14 border-b border-gray-100">
        <div className="section-padding">
          <TrustBadges />
        </div>
      </section>

      {/* 4. Shop by Category */}
      <CategoryGrid />

      {/* 5. Best Sellers */}
      <BestSellers />

      {/* 6. Brands */}
      <BrandsBar />

      {/* 7. Why Specpart */}
      <WhySpecpart />
    </>
  )
}
