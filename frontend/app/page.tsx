import { HeroBanner } from '@/components/home/HeroBanner'
import { TrustBadges } from '@/components/home/TrustBadges'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { BestSellers } from '@/components/home/BestSellers'
import { BrandsBar } from '@/components/home/BrandsBar'
import { PromosBanner } from '@/components/home/PromosBanner'

export default function Home() {
  return (
    <>
      <HeroBanner />
      <TrustBadges />
      <BrandsBar />
      <CategoryGrid />
      <PromosBanner />
      <BestSellers />
    </>
  )
}
