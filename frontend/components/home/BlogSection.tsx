import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import Image from 'next/image'

const ARTICLES = [
  {
    slug: 'choisir-huile-moteur',
    title: 'Comment choisir la bonne huile moteur ?',
    excerpt: 'Synthétique, semi-synthétique ou minérale : guide complet pour faire le bon choix selon votre voiture.',
    image: 'https://images.unsplash.com/photo-1600712242805-5f78671f7c4b?q=80&w=600',
    category: 'Conseils',
  },
  {
    slug: 'quand-changer-huile',
    title: 'Quand faut-il changer l\'huile de sa voiture ?',
    excerpt: 'Fréquence, signes d\'alerte, intervalles recommandés par les constructeurs — tout ce qu\'il faut savoir.',
    image: 'https://images.unsplash.com/photo-1626201850129-5a4e9a3e1b80?q=80&w=600',
    category: 'Entretien',
  },
  {
    slug: 'prolonger-vie-moteur',
    title: '5 astuces pour prolonger la vie de votre moteur',
    excerpt: 'Des gestes simples et réguliers qui peuvent doubler la durée de vie de votre moteur.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600',
    category: 'Astuces',
  },
]

export function BlogSection() {
  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="section-padding">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-brand-accent">
              Depuis notre blog
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tight text-brand-primary md:text-4xl">
              Conseils & Astuces
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden items-center gap-1 text-sm font-bold text-brand-primary/60 transition-colors hover:text-brand-primary sm:inline-flex"
          >
            Voir tous les articles <ArrowRight size={14} />
          </Link>
        </div>

        {/* 3-card grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute top-3 left-3 rounded-md bg-brand-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-primary-dark">
                  {article.category}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-sm font-bold leading-snug text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-400 line-clamp-2">
                  {article.excerpt}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-brand-accent">
                  Lire la suite <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
