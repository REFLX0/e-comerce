"use client";

import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

function BestSellerCard({ product }: { product: Product }) {
  const t = useTranslations('Home')
  const { addItem } = useCartStore()
  const v = product.variants?.[0]

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (v) {
      addItem(product, v, 1)
      toast.success(t('addedToCart'))
    }
  }

  return (
    <Link
      href={`/produit/${product.slug}`}
      className="group flex w-[280px] shrink-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-200 hover:border-brand-accent/30 hover:shadow-xl sm:w-[300px]"
    >
      {/* Image — fills ~60% of card */}
      <div className="relative aspect-[4/5] overflow-hidden bg-white p-4">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain p-2 transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-2xl font-bold text-gray-200">
              {product.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Quick add overlay — slides in on hover */}
        <button
          onClick={handleAdd}
          className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-4 items-center justify-center rounded-full bg-brand-accent text-brand-primary-dark opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-brand-accent-hover hover:shadow-xl"
          aria-label="Quick add to cart"
        >
          <ShoppingBag size={18} />
        </button>
      </div>

      {/* Info — 40% */}
      <div className="flex flex-col gap-1.5 p-4 pt-0">
        {product.brand && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent">
            {product.brand.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-800">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          {v && (
            <span className="text-lg font-bold text-brand-accent">
              {v.priceTTC.toFixed(2)} <span className="text-xs font-normal text-gray-400">DT</span>
            </span>
          )}
        </div>
        {/* Stock status */}
        <span className={`text-[11px] font-medium ${v?.status !== 'out_of_stock' ? 'text-green-600' : 'text-red-500'}`}>
          {v?.status !== 'out_of_stock' ? '✓ En stock' : 'Rupture'}
        </span>
      </div>
    </Link>
  )
}

export function BestSellers() {
  const t = useTranslations('Home')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: products, isLoading } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: () => productsApi.getBestSellers(10),
  })

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 300
    scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <section className="bg-white py-20">
        <div className="section-padding">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[380px] w-[280px] shrink-0 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) return null

  return (
    <section className="bg-brand-surface py-20">
      <div className="section-padding">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-brand-primary md:text-4xl">
            {t('bestSellers')}
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href="/catalogue?sort=popular"
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-accent transition-colors hover:text-brand-accent-hover"
            >
              {t('viewAll')} <ArrowRight size={14} />
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:border-brand-accent/40 hover:text-brand-accent hover:shadow-md"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:border-brand-accent/40 hover:text-brand-accent hover:shadow-md"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scroll — 4 cards visible on desktop */}
        <div
          ref={scrollRef}
          className="hide-scrollbar -mx-5 flex gap-6 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          {products.map((product) => (
            <BestSellerCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
