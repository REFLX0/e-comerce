import type { Product } from '@/lib/types'
import { ProductCard } from './ProductCard'

interface Props {
  products: Product[]
}

export function ProductGrid({ products }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
