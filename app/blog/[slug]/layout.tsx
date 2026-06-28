import { blogApi } from '@/lib/api/blog'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const post = await blogApi.getBySlug(params.slug)
    return {
      title: `${post.title} | Blog BestLub`,
      description: post.content?.substring(0, 160).replace(/<[^>]*>?/gm, '') || `Lisez notre article ${post.title}`,
    }
  } catch (error) {
    return {
      title: 'Article introuvable | Blog BestLub',
    }
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
