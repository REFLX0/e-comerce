"use client";

import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import { Link } from '@/i18n/routing'
import { ArrowRight, HelpCircle, Phone, Package2 } from 'lucide-react'
import { ProductCard } from '@/components/catalogue/ProductCard'
import { useTranslations } from 'next-intl'

const HELP_CARDS = [
  {
    icon: HelpCircle,
    labelKey: 'notSureTitle',
    descKey: 'notSureDesc',
    cta: "Trouver mon huile →",
    href: "#oil-finder",
    accent: 'border-amber-200 hover:border-amber-400',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
  },
  {
    icon: Phone,
    labelKey: 'expertHelpTitle',
    descKey: 'expertHelpDesc',
    cta: "Nous contacter →",
    href: "/contact",
    accent: 'border-blue-200 hover:border-blue-400',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
  },
  {
    icon: Package2,
    labelKey: 'specialPricesTitle',
    descKey: 'specialPricesDesc',
    cta: "En savoir plus →",
    href: "/contact",
    accent: 'border-green-200 hover:border-green-400',
    iconColor: 'text-green-500',
    iconBg: 'bg-green-50',
  },
]

export function BestSellers() {
  const t = useTranslations('Home')

  const { data: products, isLoading } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: () => productsApi.getBestSellers(6),
  })

  if (isLoading) {
    return (
      <section className="bg-white py-16 md:py-20">
        <div className="section-padding">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) return null

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="section-padding">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-brand-accent">
              {t('bestSellers')}
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tight text-brand-primary md:text-4xl">
              Top Produits
            </h2>
          </div>
          <Link
            href="/catalogue?sort=popular"
            className="hidden items-center gap-1 text-sm font-bold text-brand-primary/60 transition-colors hover:text-brand-primary sm:inline-flex"
          >
            {t('viewAll')} <ArrowRight size={14} />
          </Link>
        </div>

        {/* 4-product grid using existing ProductCard */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile "view all" link */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/catalogue?sort=popular"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-primary"
          >
            {t('viewAll')} <ArrowRight size={14} />
          </Link>
        </div>

        {/* Help cards */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {HELP_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.labelKey}
                href={card.href}
                className={`group flex items-start gap-4 rounded-2xl border-2 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.accent}`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <Icon size={22} className={card.iconColor} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors">
                    {t(card.labelKey)}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{t(card.descKey)}</p>
                  <span className="mt-2 inline-block text-xs font-bold text-brand-primary">
                    {card.cta}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
