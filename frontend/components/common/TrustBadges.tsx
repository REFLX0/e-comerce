import { useTranslations } from 'next-intl'
import { Truck, ShieldCheck, RotateCcw, CreditCard } from 'lucide-react'

const BADGES = [
  { icon: ShieldCheck, title: '100% AUTHENTIC', desc: 'Produits originaux certifiés par les marques' },
  { icon: Truck,       title: 'FAST DELIVERY',  desc: 'Livraison 24/48h partout en Tunisie' },
  { icon: RotateCcw,   title: 'EASY RETURNS',   desc: '14 jours pour changer d\'avis' },
  { icon: CreditCard,  title: 'SECURE PAYMENT', desc: 'Paiement sécurisé & à la livraison' },
]

interface TrustBadgesProps {
  variant?: 'grid' | 'inline' | 'compact'
  className?: string
}

export function TrustBadges({ variant = 'grid', className }: TrustBadgesProps) {
  const t = useTranslations('Common')

  // Compact variant: 3 key items in a horizontal row (used under Add to Cart)
  if (variant === 'compact') {
    const compactBadges = BADGES.slice(1)
    return (
      <div className={`${className ?? ''}`}>
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {compactBadges.map((b) => (
            <div key={b.title} className="flex items-center gap-2 text-xs text-gray-500">
              <b.icon size={14} className="shrink-0 text-gray-400" />
              <span className="leading-tight">{b.desc}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className ?? ''}`}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {BADGES.map((b) => (
          <div
            key={b.title}
            className="flex flex-col items-center text-center gap-3 rounded-xl bg-white p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-surface text-brand-primary/60">
              <b.icon size={26} strokeWidth={1.5} />
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                {b.title}
              </span>
              <span className="mt-1 block text-[12px] leading-relaxed text-gray-400">
                {b.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
