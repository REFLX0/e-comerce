import { blogApi } from '@/lib/api/blog'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await blogApi.getBySlug(slug)
    return {
      title: `${post.title} | Blog Bestoil`,
      description: post.content?.substring(0, 160).replace(/<[^>]*>?/gm, '') || `Lisez notre article ${post.title}`,
    }
  } catch (error) {
    return {
      title: 'Article introuvable | Blog Bestoil',
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
