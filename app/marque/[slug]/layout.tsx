import { brandsApi } from '@/lib/api/brands'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const brand = await brandsApi.getBySlug(params.slug)
    return {
      title: `${brand.name} | BestLub`,
      description: brand.description?.substring(0, 160) || `Découvrez nos produits de la marque ${brand.name}`,
    }
  } catch (error) {
    return {
      title: 'Marque introuvable | BestLub',
    }
  }
}

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
