import type { Product } from '@/lib/types'
import { ProductCard } from './ProductCard'

interface Props {
  products: Product[]
}

export function ProductGrid({ products }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className="animate-fade-in-up" 
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}
