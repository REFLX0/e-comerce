import { formatPrice } from '@/lib/utils/format'

interface Props {
  priceHT: number
  priceTTC: number
  isPromo?: boolean
  promoPercent?: number
  oldPriceTTC?: number
  className?: string
}

export function PriceDisplay({
  priceHT,
  priceTTC,
  isPromo,
  promoPercent,
  oldPriceTTC,
  className = '',
}: Props) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2">
        <span className="price-ttc text-xl font-bold">
          {formatPrice(priceTTC)} <span className="text-sm font-normal">TTC</span>
        </span>
        {isPromo && oldPriceTTC && (
          <span className="text-sm text-gray-400 line-through">{formatPrice(oldPriceTTC)}</span>
        )}
        {isPromo && promoPercent && (
          <span className="rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
            -{promoPercent}%
          </span>
        )}
      </div>
    </div>
  )
}
