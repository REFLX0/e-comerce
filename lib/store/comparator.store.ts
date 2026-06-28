import { create } from 'zustand'
import type { Product } from '@/lib/types'

const MAX_COMPARE = 4

interface ComparatorStore {
  items: Product[]
  isInComparator: (productId: string) => boolean
  toggle: (product: Product) => void
  remove: (productId: string) => void
  clear: () => void
}

export const useComparatorStore = create<ComparatorStore>((set, get) => ({
  items: [],
  isInComparator: (productId) => get().items.some((p) => p.id === productId),
  toggle: (product) => {
    const inList = get().isInComparator(product.id)
    if (inList) {
      set((s) => ({ items: s.items.filter((p) => p.id !== product.id) }))
    } else if (get().items.length < MAX_COMPARE) {
      set((s) => ({ items: [...s.items, product] }))
    }
  },
  remove: (productId) =>
    set((s) => ({ items: s.items.filter((p) => p.id !== productId) })),
  clear: () => set({ items: [] }),
}))
