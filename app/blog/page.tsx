'use client'

import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/lib/api/blog'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function BlogPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['blog', 'all'],
    queryFn: () => blogApi.getRecent(20),
  })

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white py-16 md:py-24">
        <div className="section-padding text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <BookOpen size={18} />
            <span className="text-sm font-medium">Blog & Conseils</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-4">
            Blog & Conseils
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Guides, astuces et actualités pour bien entretenir votre véhicule.
          </p>
        </div>
      </section>

      <div className="section-padding py-12">
        <Breadcrumb items={[{ label: 'Blog' }]} />

        <div className="mt-10">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <ErrorState message="Impossible de charger les articles." onRetry={() => window.location.reload()} />}

          {data && data.length === 0 && (
            <EmptyState
              title="Aucun article pour le moment"
              message="Nos experts préparent de nouveaux contenus. Revenez bientôt !"
              action={{ label: "Retour à l'accueil", href: "/" }}
            />
          )}

          {data && data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-soft border border-gray-100 hover:shadow-lg transition-shadow group">
                  <div className="h-48 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 flex items-center justify-center">
                    <BookOpen size={48} className="text-brand-primary/30" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span>{new Date(post.publishedAt).toLocaleDateString('fr-FR')}</span>
                      {post.readTime && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime} min</span>
                        </>
                      )}
                    </div>
                    <h2 className="font-display font-semibold text-lg text-brand-primary mb-2 group-hover:text-brand-accent transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                    )}
                    <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-brand-accent text-sm font-medium hover:gap-2 transition-all">
                      Lire la suite <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
