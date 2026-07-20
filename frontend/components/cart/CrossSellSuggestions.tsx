"use client";

import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import { useCartStore } from '@/lib/store/cart.store'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Plus } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

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
      <div className="border-brand-surface-dark rounded-2xl border bg-white p-5 shadow-sm">
        <h4 className="font-display text-brand-primary mb-4 text-sm font-bold uppercase tracking-wider">
          Souvent acheté avec...
        </h4>
        <div className="space-y-3">
          {suggestions.map((product) => {
            const v = product.variants?.[0]
            return (
              <div key={product.id} className="flex items-center gap-3">
                <Link
                  href={`/produit/${product.slug}`}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-surface"
                >
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gray-200" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produit/${product.slug}`}
                    className="text-brand-primary line-clamp-2 text-xs font-medium hover:underline leading-tight"
                  >
                    {product.name}
                  </Link>
                  {v && (
                    <p className="mt-0.5 text-xs font-semibold text-brand-primary">
                      {formatPrice(v.priceTTC)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleQuickAdd(product)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white transition-colors hover:bg-brand-primary-light active:scale-95"
                  aria-label="Ajouter au panier"
                >
                  <Plus size={18} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-brand-border pt-6 mt-6">
      <h4 className="font-display text-brand-primary mb-4 text-sm font-bold uppercase tracking-wider">
        Souvent acheté avec...
      </h4>
      <div className="grid grid-cols-1 gap-3">
        {suggestions.map((product) => {
          const v = product.variants?.[0]
          return (
            <div key={product.id} className="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-surface p-3">
              <Link
                href={`/produit/${product.slug}`}
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white"
              >
                {product.images?.[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-200" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/produit/${product.slug}`}
                  className="text-brand-primary line-clamp-2 text-sm font-medium hover:underline"
                >
                  {product.name}
                </Link>
                {v && (
                  <p className="mt-0.5 text-sm font-bold text-brand-primary">
                    {formatPrice(v.priceTTC)}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleQuickAdd(product)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white transition-colors hover:bg-brand-primary-light active:scale-95"
                aria-label="Ajouter au panier"
              >
                <Plus size={18} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
