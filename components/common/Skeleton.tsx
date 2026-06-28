export function ProductCardSkeleton() {
  return (
    <div className="product-card p-4 animate-pulse">
      <div className="bg-brand-surface-dark rounded-xl aspect-square mb-4" />
      <div className="h-3 bg-brand-surface-dark rounded w-1/3 mb-2" />
      <div className="h-4 bg-brand-surface-dark rounded w-3/4 mb-1" />
      <div className="h-4 bg-brand-surface-dark rounded w-1/2 mb-3" />
      <div className="h-5 bg-brand-surface-dark rounded w-1/3 mb-1" />
      <div className="h-3 bg-brand-surface-dark rounded w-1/4 mb-4" />
      <div className="h-10 bg-brand-surface-dark rounded-full" />
    </div>
  )
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProductPageSkeleton() {
  return (
    <div className="animate-pulse section-padding py-8">
      <div className="h-4 bg-brand-surface-dark rounded w-1/3 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-surface-dark rounded-2xl aspect-square" />
        <div className="space-y-4">
          <div className="h-3 bg-brand-surface-dark rounded w-1/4" />
          <div className="h-8 bg-brand-surface-dark rounded w-3/4" />
          <div className="h-4 bg-brand-surface-dark rounded w-full" />
          <div className="h-4 bg-brand-surface-dark rounded w-2/3" />
          <div className="h-6 bg-brand-surface-dark rounded w-1/4 mt-4" />
          <div className="flex gap-3 mt-4">
            <div className="h-12 bg-brand-surface-dark rounded-lg w-24" />
            <div className="h-12 bg-brand-surface-dark rounded-lg w-24" />
            <div className="h-12 bg-brand-surface-dark rounded-lg w-24" />
          </div>
          <div className="h-14 bg-brand-surface-dark rounded-full mt-6" />
        </div>
      </div>
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="border border-brand-surface-dark rounded-2xl p-6 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 bg-brand-surface-dark rounded w-1/3" />
        <div className="h-6 bg-brand-surface-dark rounded-full w-20" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-brand-surface-dark rounded w-1/2" />
        <div className="h-4 bg-brand-surface-dark rounded w-1/3" />
      </div>
    </div>
  )
}

export function BlogCardSkeleton() {
  return (
    <div className="product-card overflow-hidden animate-pulse">
      <div className="bg-brand-surface-dark aspect-video" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-brand-surface-dark rounded w-1/4" />
        <div className="h-5 bg-brand-surface-dark rounded w-3/4" />
        <div className="h-4 bg-brand-surface-dark rounded w-full" />
        <div className="h-4 bg-brand-surface-dark rounded w-2/3" />
      </div>
    </div>
  )
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="product-card p-6 animate-pulse text-center">
          <div className="bg-brand-surface-dark rounded-full w-16 h-16 mx-auto mb-3" />
          <div className="h-4 bg-brand-surface-dark rounded w-2/3 mx-auto" />
        </div>
      ))}
    </div>
  )
}

export function FilterSidebarSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-5 bg-brand-surface-dark rounded w-1/2" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="h-4 bg-brand-surface-dark rounded w-3/4" />
          ))}
        </div>
      ))}
    </div>
  )
}
