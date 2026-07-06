import { HeroBanner } from '@/components/home/HeroBanner'
import { BestSellers } from '@/components/home/BestSellers'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { TrustBadges } from '@/components/common/TrustBadges'

export default function Home() {
  return (
    <>
      {/* 1. Hero — dark block */}
      <HeroBanner />

      {/* 2. Trust strip — white block */}
      <section className="bg-white">
        <TrustBadges />
      </section>

      {/* 3. Category tiles — white block */}
      <CategoryGrid />

      {/* 4. Best sellers — dark block */}
      <BestSellers />
    </>
  )
}
