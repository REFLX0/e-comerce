"use client";

import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import { useCartStore } from '@/lib/store/cart.store'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Plus, Sparkles } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import { gooeyToast as toast } from 'goey-toast'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

interface Props {
  variant?: 'compact' | 'sidebar'
}

export function CrossSellSuggestions({ variant = 'compact' }: Props) {
  const items = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const t = useTranslations('Cart')

  const firstItemId = items[0]?.productId

  const { data: related } = useQuery({
    queryKey: ['cross-sell', firstItemId],
    queryFn: () => productsApi.getRelated(firstItemId!, 5),
    enabled: items.length > 0 && !!firstItemId,
    staleTime: 1000 * 60 * 5,
  })

  const cartProductIds = new Set(items.map((i) => i.productId))
  const suggestions = related?.filter((p) => !cartProductIds.has(p.id)).slice(0, 3)

  if (!suggestions?.length) return null

  const handleQuickAdd = (product: (typeof suggestions)[0]) => {
    const variant = product.variants?.[0]
    if (!variant) return
    const result = addItem(product, variant, 1)
    if (result.ok) {
      toast.success(t('addedToCart'))
    }
  }

  if (variant === 'sidebar') {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-amber-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {t('frequentlyBoughtWith')}
          </h4>
        </div>
        <div className="space-y-2.5">
          {suggestions.map((product) => {
            const v = product.variants?.[0]
            return (
              <div key={product.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-2">
                <Link
                  href={`/produit/${product.slug}`}
                  className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white border border-gray-100"
                >
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-contain p-0.5" />
                  ) : (
                    <div className="h-full w-full bg-gray-100" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produit/${product.slug}`}
                    className="text-brand-primary line-clamp-2 text-xs font-semibold hover:underline leading-snug"
                  >
                    {product.name}
                  </Link>
                  {v && (
                    <p className="mt-0.5 text-xs font-bold text-brand-primary">
                      {formatPrice(v.priceTTC)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleQuickAdd(product)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white transition-all hover:bg-brand-primary-light hover:shadow-md active:scale-90"
                  aria-label={t('addToCart')}
                >
                  <Plus size={14} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50">
          <Sparkles size={13} className="text-amber-400" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {t('frequentlyBoughtWith')}
        </h4>
      </div>

      <div className="space-y-2">
        {suggestions.map((product, i) => {
          const v = product.variants?.[0]
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors p-2.5 group"
            >
              <Link
                href={`/produit/${product.slug}`}
                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm"
              >
                {product.images?.[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-contain p-0.5" />
                ) : (
                  <div className="h-full w-full bg-gray-100" />
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/produit/${product.slug}`}
                  className="text-brand-primary line-clamp-2 text-xs font-semibold leading-snug group-hover:underline"
                >
                  {product.name}
                </Link>
                {v && (
                  <p className="mt-0.5 text-xs font-black text-brand-primary">
                    {formatPrice(v.priceTTC)}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleQuickAdd(product)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm transition-all hover:bg-brand-primary-light hover:shadow-md active:scale-90"
                aria-label={t('addToCart')}
              >
                <Plus size={15} />
              </button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
