'use client'

import { useCartStore } from '@/lib/store/cart.store'
import { buildPartsMessage, buildWhatsAppUrl, isPartsCategory } from '@/lib/whatsapp'
import { useHasMounted } from '@/lib/hooks/useHasMounted'
import { MessageCircle } from 'lucide-react'

interface PartsWhatsAppCheckoutProps {
  className?: string
}

/**
 * Prominent WhatsApp handoff shown inside the shopping cart whenever the
 * basket contains mechanical parts. Clicking it opens WhatsApp with a
 * pre-loaded message listing every part in the basket (Step 1 of the
 * corrected journey) — a human then confirms the chassis match offline.
 */
export function PartsWhatsAppCheckout({ className = '' }: PartsWhatsAppCheckoutProps) {
  const { items } = useCartStore()
  const hasMounted = useHasMounted()

  const parts = hasMounted
    ? items.filter((item) => isPartsCategory(item.product.category?.slug))
    : []
  if (parts.length === 0) return null

  const handleClick = () => {
    window.open(buildWhatsAppUrl(buildPartsMessage(parts)), '_blank', 'noopener')
  }

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        className="group flex w-full flex-col items-center justify-center gap-1 rounded-xl bg-[#25D366] px-4 py-3 text-white shadow-md transition-all hover:bg-[#20b858] hover:shadow-lg"
      >
        <span className="flex items-center gap-2">
          <MessageCircle size={18} className="transition-transform group-hover:scale-110" />
          <span className="text-sm font-bold">Vérifier ma commande via WhatsApp</span>
        </span>
        <span className="text-[11px] font-medium text-white/85">
          {parts.length} pièce{parts.length > 1 ? 's' : ''} — vérification du châssis avant finalisation
        </span>
      </button>
    </div>
  )
}