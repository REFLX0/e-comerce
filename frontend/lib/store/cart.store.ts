import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Cart, CartItem, Product, ProductVariant } from '@/lib/types'

const TVA = Number(process.env.NEXT_PUBLIC_TVA_RATE || 0.19)
const FREE_SHIPPING = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 100)
const SHIPPING_COST = 7

function calculateCart(
  items: CartItem[],
  promoDiscount: number
): Omit<Cart, 'items' | 'promoCode'> {
  const subtotalHT = items.reduce((acc, item) => acc + item.variant.priceHT * item.quantity, 0)
  const discounted = subtotalHT - promoDiscount
  const tva = discounted * TVA
  const shippingCost = discounted >= FREE_SHIPPING ? 0 : SHIPPING_COST
  return {
    subtotalHT: discounted,
    tva,
    totalTTC: discounted + tva + shippingCost,
    shippingCost,
    promoDiscount,
  }
}

interface CartStore extends Cart {
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  applyPromo: (code: string, discount: number) => void
  clearCart: () => void
  itemCount: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: undefined,
      promoDiscount: 0,
      subtotalHT: 0,
      tva: 0,
      totalTTC: 0,
      shippingCost: 0,
      itemCount: 0,

      addItem: (product, variant, quantity = 1) => {
        const items = get().items
        const existing = items.find((i: any) => i.variantId === variant.id)
        const newItems = existing
          ? items.map((i: any) =>
              i.variantId === variant.id ? { ...i, quantity: i.quantity + quantity } : i
            )
          : [
              ...items,
              {
                productId: product.id,
                variantId: variant.id,
                product,
                variant,
                quantity,
              },
            ]
        const calc = calculateCart(newItems, get().promoDiscount)
        set({
          items: newItems,
          itemCount: newItems.reduce((a: any, i: any) => a + i.quantity, 0),
          ...calc,
        })
      },

      removeItem: (variantId) => {
        const newItems = get().items.filter((i: any) => i.variantId !== variantId)
        const calc = calculateCart(newItems, get().promoDiscount)
        set({
          items: newItems,
          itemCount: newItems.reduce((a: any, i: any) => a + i.quantity, 0),
          ...calc,
        })
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity < 1) return
        const newItems = get().items.map((i: any) =>
          i.variantId === variantId ? { ...i, quantity } : i
        )
        const calc = calculateCart(newItems, get().promoDiscount)
        set({
          items: newItems,
          itemCount: newItems.reduce((a: any, i: any) => a + i.quantity, 0),
          ...calc,
        })
      },

      applyPromo: (code, discount) => {
        const calc = calculateCart(get().items, discount)
        set({ promoCode: code, ...calc })
      },

      clearCart: () =>
        set({
          items: [],
          promoCode: undefined,
          promoDiscount: 0,
          subtotalHT: 0,
          tva: 0,
          totalTTC: 0,
          shippingCost: 0,
          itemCount: 0,
        }),
    }),
    { name: 'cart-storage' }
  )
)
