import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Cart, CartItem, Product, ProductVariant } from '@/lib/types'

const TVA_RATE = Number(process.env.NEXT_PUBLIC_TVA_RATE || 0.19)
const DEFAULT_FREE_SHIPPING_THRESHOLD = Number(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 100
)
const DEFAULT_SHIPPING_COST = Number(process.env.NEXT_PUBLIC_SHIPPING_COST || 7)

export type AddItemResult =
  | { ok: true; capped: boolean }
  | { ok: false; reason: 'OUT_OF_STOCK' }

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/** Stock may be absent on some payloads — treat unknown stock as unlimited. */
function getVariantStock(variant: ProductVariant): number {
  const stock = (variant as ProductVariant & { stock?: number | null }).stock
  return typeof stock === 'number' && stock >= 0 ? stock : Number.POSITIVE_INFINITY
}

function countItems(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0)
}

function calculateCart(
  items: CartItem[],
  requestedDiscount: number,
  shippingBaseCost: number,
  freeShippingThreshold: number
): Omit<Cart, 'items' | 'promoCode'> {
  const subtotalHT = round2(
    items.reduce((acc, item) => acc + item.variant.priceHT * item.quantity, 0)
  )
  // Clamp the discount so totals can never go negative
  const promoDiscount = round2(Math.min(Math.max(requestedDiscount, 0), subtotalHT))
  const discounted = round2(subtotalHT - promoDiscount)
  const tva = round2(discounted * TVA_RATE)
  const shippingCost =
    items.length === 0 || discounted >= freeShippingThreshold ? 0 : shippingBaseCost
  return {
    subtotalHT: discounted,
    tva,
    totalTTC: round2(discounted + tva + shippingCost),
    shippingCost,
    promoDiscount,
  }
}

interface CartStore extends Cart {
  itemCount: number
  shippingBaseCost: number
  freeShippingThreshold: number
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => AddItemResult
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  applyPromo: (code: string, discount: number) => void
  removePromo: () => void
  setShippingConfig: (config: { cost?: number; freeThreshold?: number }) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => {
      /** Single point of truth: every mutation recomputes and re-clamps totals. */
      const commit = (
        items: CartItem[],
        promoCode: string | undefined,
        requestedDiscount: number
      ) => {
        const { shippingBaseCost, freeShippingThreshold } = get()
        // An empty cart never keeps a promo code
        const code = items.length === 0 ? undefined : promoCode
        const discount = items.length === 0 ? 0 : requestedDiscount
        const calc = calculateCart(items, discount, shippingBaseCost, freeShippingThreshold)
        set({ items, promoCode: code, itemCount: countItems(items), ...calc })
      }

      return {
        items: [],
        promoCode: undefined,
        promoDiscount: 0,
        subtotalHT: 0,
        tva: 0,
        totalTTC: 0,
        shippingCost: 0,
        itemCount: 0,
        shippingBaseCost: DEFAULT_SHIPPING_COST,
        freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,

        addItem: (product, variant, quantity = 1) => {
          const { items, promoCode, promoDiscount } = get()
          const stock = getVariantStock(variant)
          if (stock <= 0) return { ok: false, reason: 'OUT_OF_STOCK' }

          const existing = items.find((i) => i.variantId === variant.id)
          const current = existing?.quantity ?? 0
          const desired = current + Math.max(1, Math.floor(quantity))
          const next = Math.min(desired, stock)
          if (next === current) return { ok: false, reason: 'OUT_OF_STOCK' }

          const newItems: CartItem[] = existing
            ? items.map((i) => (i.variantId === variant.id ? { ...i, quantity: next } : i))
            : [
                ...items,
                {
                  productId: product.id,
                  variantId: variant.id,
                  product,
                  variant,
                  quantity: next,
                },
              ]

          commit(newItems, promoCode, promoDiscount)
          return { ok: true, capped: next < desired }
        },

        removeItem: (variantId) => {
          const { items, promoCode, promoDiscount } = get()
          commit(
            items.filter((i) => i.variantId !== variantId),
            promoCode,
            promoDiscount
          )
        },

        updateQuantity: (variantId, quantity) => {
          const { items, promoCode, promoDiscount } = get()
          const qty = Math.floor(quantity)
          if (qty <= 0) {
            // Setting quantity to zero removes the line instead of being ignored
            commit(
              items.filter((i) => i.variantId !== variantId),
              promoCode,
              promoDiscount
            )
            return
          }
          const newItems = items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(qty, getVariantStock(i.variant)) }
              : i
          )
          commit(newItems, promoCode, promoDiscount)
        },

        applyPromo: (code, discount) => {
          commit(get().items, code, discount)
        },

        removePromo: () => {
          commit(get().items, undefined, 0)
        },

        setShippingConfig: ({ cost, freeThreshold }) => {
          set({
            ...(typeof cost === 'number' && cost >= 0 ? { shippingBaseCost: cost } : {}),
            ...(typeof freeThreshold === 'number' && freeThreshold > 0
              ? { freeShippingThreshold: freeThreshold }
              : {}),
          })
          const { items, promoCode, promoDiscount } = get()
          commit(items, promoCode, promoDiscount)
        },

        clearCart: () => commit([], undefined, 0),
      }
    },
    { name: 'cart-storage' }
  )
)
