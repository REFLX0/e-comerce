import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Cart, CartItem, Product, ProductVariant } from '@/lib/types'

const TVA_RATE = Number(process.env.NEXT_PUBLIC_TVA_RATE || 0.19)
const DEFAULT_FREE_SHIPPING_THRESHOLD = Number(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 250
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
  promoType: 'PERCENT' | 'FIXED' | 'SHIPPING' | undefined,
  shippingBaseCost: number,
  freeShippingThreshold: number,
  selectedWilaya?: string,
  eta?: string
): Omit<Cart, 'items' | 'promoCode' | 'promoType'> {
  const subtotalHT = round2(
    items.reduce((acc, item) => acc + item.variant.priceHT * item.quantity, 0)
  )

  // Real TTC value of items in cart
  const itemsTotalTTC = round2(
    items.reduce(
      (acc, item) =>
        acc +
        (typeof item.variant.priceTTC === 'number' && item.variant.priceTTC > 0
          ? item.variant.priceTTC
          : item.variant.priceHT * (1 + TVA_RATE)) *
          item.quantity,
      0
    )
  )

  // Clamp item discount so totals can never go negative
  const promoDiscount = round2(Math.min(Math.max(requestedDiscount, 0), subtotalHT))
  const discountedHT = round2(Math.max(0, subtotalHT - promoDiscount))
  const tva = round2(discountedHT * TVA_RATE)

  // Free shipping check: Promo code OR items total TTC reaches threshold
  const isFreeShipping =
    promoType === 'SHIPPING' ||
    (items.length > 0 && itemsTotalTTC >= freeShippingThreshold)

  const shippingCost = items.length === 0 || isFreeShipping ? 0 : shippingBaseCost

  return {
    subtotalHT: discountedHT,
    itemsTotalTTC,
    tva,
    totalTTC: round2(discountedHT + tva + shippingCost),
    shippingCost,
    promoDiscount,
    selectedWilaya,
    eta,
  }
}

interface CartStore extends Cart {
  itemCount: number
  shippingBaseCost: number
  freeShippingThreshold: number
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => AddItemResult
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  applyPromo: (code: string, discount: number, type?: 'PERCENT' | 'FIXED' | 'SHIPPING') => void
  removePromo: () => void
  setSelectedWilaya: (wilaya: string, cost?: number, eta?: string) => void
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
        promoType: 'PERCENT' | 'FIXED' | 'SHIPPING' | undefined,
        requestedDiscount: number,
        customShippingCost?: number,
        customWilaya?: string,
        customEta?: string
      ) => {
        const state = get()
        const shippingBaseCost =
          typeof customShippingCost === 'number' ? customShippingCost : state.shippingBaseCost
        const selectedWilaya = customWilaya !== undefined ? customWilaya : state.selectedWilaya
        const eta = customEta !== undefined ? customEta : state.eta
        const freeShippingThreshold = state.freeShippingThreshold

        // An empty cart never keeps a promo code
        const code = items.length === 0 ? undefined : promoCode
        const type = items.length === 0 ? undefined : promoType
        const discount = items.length === 0 ? 0 : requestedDiscount

        const calc = calculateCart(
          items,
          discount,
          type,
          shippingBaseCost,
          freeShippingThreshold,
          selectedWilaya,
          eta
        )

        set({
          items,
          promoCode: code,
          promoType: type,
          itemCount: countItems(items),
          shippingBaseCost,
          ...calc,
        })
      }

      return {
        items: [],
        promoCode: undefined,
        promoType: undefined,
        promoDiscount: 0,
        subtotalHT: 0,
        itemsTotalTTC: 0,
        tva: 0,
        totalTTC: 0,
        shippingCost: 0,
        itemCount: 0,
        shippingBaseCost: DEFAULT_SHIPPING_COST,
        freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
        selectedWilaya: undefined,
        eta: undefined,

        addItem: (product, variant, quantity = 1) => {
          const { items, promoCode, promoType, promoDiscount } = get()
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

          commit(newItems, promoCode, promoType, promoDiscount)
          return { ok: true, capped: next < desired }
        },

        removeItem: (variantId) => {
          const { items, promoCode, promoType, promoDiscount } = get()
          commit(
            items.filter((i) => i.variantId !== variantId),
            promoCode,
            promoType,
            promoDiscount
          )
        },

        updateQuantity: (variantId, quantity) => {
          const { items, promoCode, promoType, promoDiscount } = get()
          const qty = Math.floor(quantity)
          if (qty <= 0) {
            commit(
              items.filter((i) => i.variantId !== variantId),
              promoCode,
              promoType,
              promoDiscount
            )
            return
          }
          const newItems = items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(qty, getVariantStock(i.variant)) }
              : i
          )
          commit(newItems, promoCode, promoType, promoDiscount)
        },

        applyPromo: (code, discount, type = 'PERCENT') => {
          const { items } = get()
          commit(items, code, type, discount)
        },

        removePromo: () => {
          const { items } = get()
          commit(items, undefined, undefined, 0)
        },

        setSelectedWilaya: (wilaya, cost, eta) => {
          const { items, promoCode, promoType, promoDiscount, shippingBaseCost } = get()
          const finalCost = typeof cost === 'number' ? cost : shippingBaseCost
          commit(items, promoCode, promoType, promoDiscount, finalCost, wilaya, eta)
        },

        setShippingConfig: ({ cost, freeThreshold }) => {
          set({
            ...(typeof cost === 'number' && cost >= 0 ? { shippingBaseCost: cost } : {}),
            ...(typeof freeThreshold === 'number' && freeThreshold > 0
              ? { freeShippingThreshold: freeThreshold }
              : {}),
          })
          const { items, promoCode, promoType, promoDiscount } = get()
          commit(items, promoCode, promoType, promoDiscount)
        },

        clearCart: () => commit([], undefined, undefined, 0),
      }
    },
    { name: 'cart-storage' }
  )
)
