'use client'

import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/lib/api/blog'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { formatDate } from '@/lib/utils/format'
import { Calendar, Clock, User, ArrowLeft, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { use } from 'react'

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogApi.getBySlug(slug),
  })

  const { data: recentPosts } = useQuery({
    queryKey: ['blog-recent-sidebar'],
    queryFn: () => blogApi.getRecent(3),
  })

  if (isLoading) {
    return (
      <div className="section-padding py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-surface-dark border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Chargement de l'article...</p>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="section-padding py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-primary mb-4">Article introuvable</h1>
        <p className="text-gray-600 mb-8">Désolé, l'article que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link href="/blog" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Retour au blog
        </Link>
      </div>
    )
  }

  return (
    <div className="section-padding py-8">
      <Breadcrumb
        items={[
          { label: 'Blog', href: '/blog' },
          { label: post.title },
        ]}
      />

      <div className="mt-8 flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <article className="flex-1 min-w-0">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary mb-6 transition-colors">
            <ArrowLeft size={16} />
            Retour aux articles
          </Link>

          {post.coverImage && (
            <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-8">
              <Image 
                src={post.coverImage} 
                alt={post.title} 
                fill 
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1.5 bg-brand-surface px-3 py-1.5 rounded-full">
              <Calendar size={14} className="text-brand-primary" />
              {formatDate(post.publishedAt)}
            </div>
            {post.readTime && (
              <div className="flex items-center gap-1.5 bg-brand-surface px-3 py-1.5 rounded-full">
                <Clock size={14} className="text-brand-primary" />
                {post.readTime} min de lecture
              </div>
            )}
            {post.author && (
              <div className="flex items-center gap-1.5 bg-brand-surface px-3 py-1.5 rounded-full">
                <User size={14} className="text-brand-primary" />
                {post.author}
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-display font-bold text-brand-primary mb-8 leading-tight">
            {post.title}
          </h1>

          <div 
            className="prose prose-lg prose-blue max-w-none text-gray-700
              prose-headings:font-display prose-headings:text-brand-primary prose-headings:font-bold
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-brand-accent prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-2xl prose-img:shadow-sm
              prose-blockquote:border-l-4 prose-blockquote:border-brand-primary prose-blockquote:bg-brand-surface prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:font-medium prose-blockquote:text-brand-primary"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-brand-surface-dark">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={18} className="text-brand-primary" />
                <h3 className="font-bold text-brand-primary">Tags associés</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link 
                    key={tag} 
                    href={`/blog?tag=${tag}`}
                    className="px-4 py-2 bg-brand-surface hover:bg-brand-primary hover:text-white text-gray-700 text-sm rounded-full transition-colors font-medium"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] shrink-0">
          <div className="sticky top-24 bg-brand-surface rounded-2xl p-6 border border-brand-surface-dark">
            <h3 className="text-xl font-display font-bold text-brand-primary mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-brand-accent rounded-full"></div>
              Articles Récents
            </h3>
            
            <div className="space-y-6">
              {recentPosts?.map((recentPost) => (
                <Link key={recentPost.id} href={`/blog/${recentPost.slug}`} className="group block">
                  {recentPost.coverImage && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3">
                      <Image 
                        src={recentPost.coverImage} 
                        alt={recentPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <h4 className="font-bold text-brand-primary group-hover:text-brand-accent transition-colors line-clamp-2 text-sm">
                    {recentPost.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <Calendar size={12} />
                    {formatDate(recentPost.publishedAt)}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-brand-surface-dark text-center">
              <div className="bg-white p-6 rounded-xl border border-brand-surface-dark">
                <h4 className="font-bold text-brand-primary mb-2">Newsletter</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Ne manquez aucun de nos conseils et actualités.
                </p>
                <input 
                  type="email" 
                  placeholder="Votre email" 
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none mb-3 text-sm"
                />
                <button className="w-full btn-primary py-2.5 text-sm">
                  S'abonner
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
