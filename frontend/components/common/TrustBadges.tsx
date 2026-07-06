import { Truck, ShieldCheck, RotateCcw, CreditCard } from 'lucide-react'

const badges = [
  { icon: ShieldCheck, label: '100% Authentic' },
  { icon: Truck,       label: 'Fast Delivery' },
  { icon: RotateCcw,   label: 'Easy Returns' },
  { icon: CreditCard,  label: 'Secure Payment' },
]

interface TrustBadgesProps {
  variant?: 'grid' | 'inline'
  className?: string
}

export function TrustBadges({ variant = 'grid', className }: TrustBadgesProps) {
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
