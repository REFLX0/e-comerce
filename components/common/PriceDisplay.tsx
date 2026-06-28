import { formatPrice } from '@/lib/utils/format'

interface Props {
  priceHT: number
  priceTTC: number
  isPromo?: boolean
  promoPercent?: number
  oldPriceHT?: number
  className?: string
}

export function PriceDisplay({ priceHT, priceTTC, isPromo, promoPercent, oldPriceHT, className = '' }: Props) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2">
        <span className="price-ht text-xl">{formatPrice(priceHT)} <span className="text-sm">HT</span></span>
        {isPromo && oldPriceHT && (
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(oldPriceHT)}
          </span>
        )}
        {isPromo && promoPercent && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{promoPercent}%
          </span>
        )}
      </div>
      <span className="price-ttc">{formatPrice(priceTTC)} TTC</span>
    </div>
  )
}
