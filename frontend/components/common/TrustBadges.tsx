import { useTranslations } from 'next-intl'
import { Truck, ShieldCheck, RotateCcw, CreditCard } from 'lucide-react'

interface TrustBadgesProps {
  variant?: 'grid' | 'inline'
  className?: string
}

export function TrustBadges({ variant = 'grid', className }: TrustBadgesProps) {
  const t = useTranslations('Common')

  const badges = [
    { icon: ShieldCheck, label: t('authentic') },
    { icon: Truck,       label: t('fastDelivery') },
    { icon: RotateCcw,   label: t('easyReturns') },
    { icon: CreditCard,  label: t('securePayment') },
  ]
  return (
    <div className={`grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4 ${className ?? ''}`}>
      {badges.map((b) => (
        <div
          key={b.label}
          className="flex items-center justify-center gap-3 bg-white px-4 py-6"
        >
          <b.icon size={22} strokeWidth={1.6} className="shrink-0 text-[#111]" />
          <span className="text-sm font-bold uppercase tracking-wide text-[#111]">
            {b.label}
          </span>
        </div>
      ))}
    </div>
  )
}
