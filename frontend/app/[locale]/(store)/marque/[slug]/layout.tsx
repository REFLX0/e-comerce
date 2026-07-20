import { brandsApi } from '@/lib/api/brands'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const brand = await brandsApi.getBySlug(slug)
    return {
      title: `${brand.name} | specpart`,
      description:
        brand.description?.substring(0, 160) || `Découvrez nos produits de la marque ${brand.name}`,
    }
  } catch {
    return {
      title: 'Marque introuvable | specpart',
    }
  }
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children
}
