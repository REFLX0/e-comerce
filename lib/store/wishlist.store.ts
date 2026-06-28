import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/lib/types'
import { wishlistApi } from '@/lib/api/wishlist'

interface WishlistStore {
  items: Product[]
  isInWishlist: (productId: string) => boolean
  toggle: (product: Product, token?: string) => Promise<void>
  setItems: (items: Product[]) => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isInWishlist: (productId) => get().items.some((p) => p.id === productId),
      toggle: async (product, token) => {
        const inList = get().isInWishlist(product.id)
        if (inList) {
          set((s) => ({ items: s.items.filter((p) => p.id !== product.id) }))
          if (token) await wishlistApi.remove(product.id, token).catch(() => {})
        } else {
          set((s) => ({ items: [...s.items, product] }))
          if (token) await wishlistApi.add(product.id, token).catch(() => {})
        }
      },
      setItems: (items) => set({ items }),
    }),
    { name: 'wishlist-storage' }
  )
)
