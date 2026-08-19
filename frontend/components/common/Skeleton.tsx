/**
 * Skeleton components use a soft shimmer for perceived speed.
 */
"use client"

import { useTranslations } from 'next-intl'

function SkeletonBlock({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return <div className={`shimmer rounded ${className}`} style={style} aria-hidden="true" />
}

export function ProductCardSkeleton() {
  const t = useTranslations('Common')
  return (
    <div className="product-card p-4" aria-busy="true" aria-label={t('loadingProduct')}>
      {/* Image placeholder: aspect-square = height matched to width */}
      <SkeletonBlock className="mb-4 aspect-square w-full rounded-xl" />
      {/* Brand tag */}
      <SkeletonBlock className="mb-2" style={{ height: 12, width: '33%' }} />
      {/* Product name lines */}
      <SkeletonBlock className="mb-1" style={{ height: 16, width: '75%' }} />
      <SkeletonBlock className="mb-3" style={{ height: 16, width: '55%' }} />
      {/* Price */}
      <SkeletonBlock className="mb-1" style={{ height: 20, width: '35%' }} />
      <SkeletonBlock className="mb-4" style={{ height: 12, width: '25%' }} />
      {/* CTA button */}
      <SkeletonBlock style={{ height: 44, borderRadius: 8 }} />
    </div>
  )
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      role="status"
      aria-label={`Chargement de ${count} produits...`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProductPageSkeleton() {
  return (
    <div className="section-padding py-8" role="status" aria-label="Chargement du produit...">
      {/* Breadcrumb */}
      <SkeletonBlock className="mb-8" style={{ height: 16, width: '33%' }} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <SkeletonBlock className="aspect-square w-full rounded-2xl" />
        {/* Info panel */}
        <div className="space-y-4">
          <SkeletonBlock style={{ height: 12, width: '25%' }} />    {/* brand */}
          <SkeletonBlock style={{ height: 32, width: '75%' }} />    {/* name */}
          <SkeletonBlock style={{ height: 16, width: '100%' }} />   {/* desc */}
          <SkeletonBlock style={{ height: 16, width: '66%' }} />
          <SkeletonBlock className="mt-4" style={{ height: 24, width: '28%' }} /> {/* price */}
          {/* Qty selectors */}
          <div className="mt-4 flex gap-3">
            <SkeletonBlock style={{ height: 48, width: 96, borderRadius: 8 }} />
            <SkeletonBlock style={{ height: 48, width: 96, borderRadius: 8 }} />
            <SkeletonBlock style={{ height: 48, width: 96, borderRadius: 8 }} />
          </div>
          {/* Add to cart */}
          <SkeletonBlock className="mt-6" style={{ height: 56, borderRadius: 9999 }} />
        </div>
      </div>
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="border-brand-surface-dark rounded-2xl border p-6" aria-busy="true">
      <div className="mb-4 flex items-center justify-between">
        <SkeletonBlock style={{ height: 20, width: '33%' }} />
          <SkeletonBlock style={{ height: 24, width: 80, borderRadius: 8 }} />
      </div>
      <div className="space-y-3">
        <SkeletonBlock style={{ height: 16, width: '50%' }} />
        <SkeletonBlock style={{ height: 16, width: '33%' }} />
      </div>
    </div>
  )
}

export function BlogCardSkeleton() {
  return (
    <div className="product-card overflow-hidden" aria-busy="true">
      <SkeletonBlock className="aspect-video w-full" />
      <div className="space-y-3 p-5">
        <SkeletonBlock style={{ height: 12, width: '25%' }} />
        <SkeletonBlock style={{ height: 20, width: '75%' }} />
        <SkeletonBlock style={{ height: 16, width: '100%' }} />
        <SkeletonBlock style={{ height: 16, width: '66%' }} />
      </div>
    </div>
  )
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  const t = useTranslations('Common')
  return (
    <div
      className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
      role="status"
      aria-label={t('loadingCategories')}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="product-card p-6 text-center" aria-busy="true">
          <SkeletonBlock className="mx-auto mb-3" style={{ height: 64, width: 64, borderRadius: 8 }} />
          <SkeletonBlock className="mx-auto" style={{ height: 16, width: '66%' }} />
        </div>
      ))}
    </div>
  )
}

export function FilterSidebarSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Chargement des filtres...">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <SkeletonBlock style={{ height: 20, width: '50%' }} />
          {Array.from({ length: 4 }).map((_, j) => (
            <SkeletonBlock key={j} style={{ height: 16, width: '75%' }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Chargement du tableau...">
      {/* Header */}
      <div className="flex gap-4 border-b border-gray-100 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} style={{ height: 14, flex: 1 }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonBlock key={j} style={{ height: 16, flex: 1, opacity: 1 - i * 0.08 }} />
          ))}
        </div>
      ))}
    </div>
  )
}
