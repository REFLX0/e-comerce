import { HeroBanner } from '@/components/home/HeroBanner'
import { BestSellers } from '@/components/home/BestSellers'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { TrustBadges } from '@/components/common/TrustBadges'
import { BrandsBar } from '@/components/home/BrandsBar'
import { WhySpecpart } from '@/components/home/WhySpecpart'
import { OilFinderTabs } from '@/features/oil-finder/components/OilFinderTabs'

export default function Home() {
  return (
    <>
      {/* 1. Hero */}
      <HeroBanner />

      {/* 2. Oil Finder — full section */}
      <section id="oil-finder" className="bg-white py-16 md:py-20 border-b border-gray-100">
        <div className="section-padding">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-accent">
              Outil de recherche
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tight text-brand-primary md:text-4xl">
              Trouver mon huile
            </h2>
            <p className="mt-3 text-sm text-gray-500 max-w-md mx-auto">
              Trouvez l&apos;huile parfaitement adaptée à votre véhicule en quelques clics
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
