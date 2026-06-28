import { categoriesApi } from '@/lib/api/categories'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const category = await categoriesApi.getBySlug(slug)
    return {
      title: `${category.name} | Bestoil`,
      description: category.description?.substring(0, 160) || `Découvrez nos produits dans la catégorie ${category.name}`,
    }
  } catch (error) {
    return {
      title: 'Catégorie introuvable | Bestoil',
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
