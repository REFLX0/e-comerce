import { HeroBanner } from '@/components/home/HeroBanner'
import { BestSellers } from '@/components/home/BestSellers'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { TrustBadges } from '@/components/common/TrustBadges'
import { OilFinderTabs } from '@/features/oil-finder/components/OilFinderTabs'

export default function Home() {
  return (
    <>
      {/* 1. Hero — dark block */}
      <HeroBanner />

      {/* 2. Oil finder — dark block */}
      <section className="bg-[#0B0B0C] py-12 md:py-16">
        <OilFinderTabs />
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
