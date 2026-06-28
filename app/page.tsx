import { HeroBanner } from '@/components/home/HeroBanner'
import { TrustBadges } from '@/components/home/TrustBadges'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { BestSellers } from '@/components/home/BestSellers'
import { BrandsBar } from '@/components/home/BrandsBar'
import { PromosBanner } from '@/components/home/PromosBanner'
import { VehicleConfiguratorTeaser } from '@/components/home/VehicleConfiguratorTeaser'
import { BlogTeaser } from '@/components/home/BlogTeaser'
import { NewsletterSection } from '@/components/home/NewsletterSection'

export default function Home() {
  return (
    <>
      <HeroBanner />
      <TrustBadges />
      <BrandsBar />
      <CategoryGrid />
      <PromosBanner />
      <BestSellers />
      <VehicleConfiguratorTeaser />
      <BlogTeaser />
      <NewsletterSection />
    </>
  )
}
