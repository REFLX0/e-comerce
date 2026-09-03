"use client"

import { useTranslations } from 'next-intl'
import { Truck, ShieldCheck, CreditCard } from 'lucide-react'

const BADGES = [
  { icon: ShieldCheck, titleKey: 'authentic', descKey: 'authenticDesc', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Truck, titleKey: 'fastDelivery', descKey: 'fastDeliveryDesc', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: CreditCard, titleKey: 'securePayment', descKey: 'securePaymentDesc', color: 'text-amber-600', bg: 'bg-amber-50' },
]

interface TrustBadgesProps {
  variant?: 'grid' | 'inline' | 'compact'
  className?: string
}

export function TrustBadges({ variant = 'grid', className }: TrustBadgesProps) {
  const t = useTranslations('Common')

  // Compact variant: 3 key items horizontal (under Add to Cart on product page)
  if (variant === 'compact') {
    return (
      <div className={`${className ?? ''}`}>
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {BADGES.map((b) => (
            <div key={b.titleKey} className="flex items-center gap-2 text-xs text-gray-500">
              <b.icon size={14} className="shrink-0 text-gray-400" />
              <span className="leading-tight">{t(b.descKey)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Inline variant (used on product page)
  if (variant === 'inline') {
    return (
      <div className={`${className ?? ''}`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BADGES.map((b) => (
            <div key={b.titleKey} className="flex items-center gap-3 text-sm text-gray-600">
              <b.icon size={16} className={`shrink-0 ${b.color}`} />
              <span className="font-medium">{t(b.titleKey)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Default grid variant — homepage reassurance bar
  return (
    <div className={`${className ?? ''}`}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {BADGES.map((b) => (
          <div
            key={b.titleKey}
            className="flex flex-col items-center text-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${b.bg}`}>
              <b.icon size={24} strokeWidth={1.75} className={b.color} />
            </div>
            <div>
              <span className="block text-sm font-bold text-gray-900">{t(b.titleKey)}</span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-400">{t(b.descKey)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}