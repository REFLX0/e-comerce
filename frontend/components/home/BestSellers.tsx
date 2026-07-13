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
      className="group flex w-[260px] shrink-0 flex-col overflow-hidden rounded-lg border border-white/8 bg-white/[0.04] transition-all duration-300 hover:scale-[1.03] hover:border-white/15 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] sm:w-[280px]"
    >
      {/* Image — fills ~80% */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-2xl font-bold text-white/10">
              {product.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Quick add overlay */}
        <button
          onClick={handleAdd}
          className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-[#E10600] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#b80500]"
          aria-label="Quick add to cart"
        >
          <ShoppingBag size={16} />
        </button>
      </div>

      {/* Info — minimal */}
      <div className="flex flex-col gap-1 p-4">
        {product.brand && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E10600]">
            {product.brand.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
          {product.name}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          {v && (
            <span className="text-lg font-bold text-white">
              {v.priceTTC.toFixed(2)} <span className="text-xs font-normal text-white/50">DT</span>
            </span>
          )}
        </div>
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
      <section className="bg-[#0B0B0C] py-20">
        <div className="section-padding">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[380px] w-[280px] shrink-0 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) return null

  return (
    <section className="bg-[#0B0B0C] py-20">
      <div className="section-padding">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
            {t('bestSellers')}
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href="/catalogue?sort=popular"
              className="hidden items-center gap-1 text-sm font-bold text-[#E10600] transition-colors hover:text-[#ff2d1a] sm:inline-flex"
            >
              {t('viewAll')} <ArrowRight size={14} />
            </Link>
            <div className="hidden gap-2 sm:flex">
              <button
                onClick={() => scroll('left')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/30 hover:text-white"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/30 hover:text-white"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scroll */}
        <div
          ref={scrollRef}
          className="hide-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          {products.map((product) => (
            <BestSellerCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
