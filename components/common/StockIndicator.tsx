import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { ProductStatus } from '@/lib/types'

interface Props {
  status: ProductStatus
  stock?: number
}

export function StockIndicator({ status, stock }: Props) {
  if (status === 'in_stock') {
    return (
      <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
        <CheckCircle2 size={16} />
        <span>En stock {stock !== undefined && `(${stock})`}</span>
      </div>
    )
  }

  if (status === 'low_stock') {
    return (
      <div className="flex items-center gap-1.5 text-orange-500 text-sm font-medium">
        <Clock size={16} />
        <span>Stock faible {stock !== undefined && `(${stock})`}</span>
      </div>
    )
  }

  if (status === 'on_order') {
    return (
      <div className="flex items-center gap-1.5 text-blue-500 text-sm font-medium">
        <Clock size={16} />
        <span>Sur commande</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium">
      <XCircle size={16} />
      <span>Rupture de stock</span>
    </div>
  )
}
