"use client"

import { formatPrice } from '@/lib/utils/format'
import { Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface FreeShippingProgressProps {
  subtotal: number
  threshold?: number
  className?: string
}

export function FreeShippingProgress({
  subtotal,
  threshold = 100,
  className,
}: FreeShippingProgressProps) {
  const t = useTranslations('Cart')
  const percentage = Math.min((subtotal / threshold) * 100, 100)
  const remaining = threshold - subtotal
  const isFree = subtotal >= threshold

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
              isFree ? 'bg-green-100 text-green-600' : 'bg-brand-surface text-brand-primary'
            )}
          >
            <Truck size={14} />
          </div>
          <span className={cn('font-medium', isFree ? 'text-green-600' : 'text-brand-primary')}>
            {isFree ? (
              t('freeShipping')
            ) : (
              <>
                {t.rich('freeShippingProgress', {
                  amount: () => <span className="font-bold text-brand-accent">{formatPrice(remaining)}</span>
                })}
              </>
            )}
          </span>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-surface">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            isFree ? 'bg-green-500' : 'bg-brand-accent'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
