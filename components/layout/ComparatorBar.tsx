'use client'

import { useComparatorStore } from '@/lib/store/comparator.store'
import { formatPrice } from '@/lib/utils/format'
import { Scale, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function ComparatorBar() {
  const { items, remove, clear } = useComparatorStore()

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-surface-dark shadow-[0_-4px_20px_rgba(26,60,94,0.08)] z-50 transform transition-transform duration-300">
      <div className="section-padding py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 w-full overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-brand-surface rounded-lg p-2 min-w-[200px] max-w-[250px] relative group"
              >
                <div className="relative w-12 h-12 bg-white rounded-md overflow-hidden shrink-0">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-brand-primary truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-brand-accent font-bold mt-0.5">
                    {formatPrice(item.variants[0]?.priceTTC || 0)}
                  </p>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Retirer du comparateur"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            
            {items.length < 4 && (
              <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-2 min-w-[200px] h-[68px] text-gray-400 text-sm">
                Ajouter un produit ({items.length}/4)
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            <button
              onClick={clear}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Tout vider
            </button>
            <Link
              href="/comparateur"
              className="btn-primary py-2.5 px-6 flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <Scale size={18} />
              <span>Comparer ({items.length})</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
