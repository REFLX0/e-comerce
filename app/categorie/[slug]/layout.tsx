import { categoriesApi } from '@/lib/api/categories'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const category = await categoriesApi.getBySlug(params.slug)
    return {
      title: `${category.name} | BestLub`,
      description: category.description?.substring(0, 160) || `Découvrez nos produits dans la catégorie ${category.name}`,
    }
  } catch (error) {
    return {
      title: 'Catégorie introuvable | BestLub',
    }
  }
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
