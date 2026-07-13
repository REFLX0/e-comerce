import { useTranslations } from 'next-intl'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { ProductStatus } from '@/lib/types'

interface Props {
  status: ProductStatus
  stock?: number
}

export function StockIndicator({ status, stock }: Props) {
  const t = useTranslations('Common')
  if (status === 'in_stock') {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
        <CheckCircle2 size={16} />
        <span>{t('inStock')} {stock !== undefined && `(${stock})`}</span>
      </div>
    )
  }

  if (status === 'low_stock') {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium text-orange-500">
        <Clock size={16} />
        <span>{t('lowStock')} {stock !== undefined && `(${stock})`}</span>
      </div>
    )
  }

  if (status === 'on_order') {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium text-blue-500">
        <Clock size={16} />
        <span>{t('onOrder')}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-red-500">
      <XCircle size={16} />
      <span>{t('outOfStock')}</span>
    </div>
  )
}
