'use client'

import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/lib/api/blog'
import { SectionTitle } from '@/components/common/SectionTitle'
import { BlogCardSkeleton } from '@/components/common/Skeleton'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/format'
import { ArrowRight, Clock } from 'lucide-react'

export function BlogTeaser() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['recent-blog-posts'],
    queryFn: () => blogApi.getRecent(3),
  })

  if (!isLoading && (!posts || posts.length === 0)) return null

  return (
    <section className="section-padding py-16 bg-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <SectionTitle 
          title="Actualités & Conseils" 
          subtitle="Découvrez nos derniers articles pour entretenir votre véhicule comme un pro."
          className="mb-0"
        />
        <Link 
          href="/blog" 
          className="text-brand-primary font-semibold hover:text-brand-accent transition-colors flex items-center gap-2 shrink-0"
        >
          Voir tous les articles
          <ArrowRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BlogCardSkeleton />
          <BlogCardSkeleton />
          <BlogCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {posts?.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`}
              className="group product-card overflow-hidden flex flex-col"
            >
              <div className="relative aspect-video bg-brand-surface overflow-hidden">
                {post.coverImage ? (
                  <Image 
                    src={post.coverImage} 
                    alt={post.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-brand-surface-dark">
                    Pas d'image
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-brand-primary">
                  {post.tags[0] || 'Général'}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span>{formatDate(post.publishedAt)}</span>
                  {post.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.readTime} min de lecture
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-display font-bold text-brand-primary mb-3 line-clamp-2 group-hover:text-brand-accent transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 mt-auto">
                  {post.excerpt}
                </p>
                
                <span className="text-brand-accent font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Lire la suite <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
