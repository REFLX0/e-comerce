"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api/orders'
import { useCartStore } from '@/lib/store/cart.store'
import { useRouter } from '@/i18n/routing'
import { Link } from '@/i18n/routing'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Package, Clock, CheckCircle2, Truck, XCircle,
  ArrowRight, RefreshCw, Printer, ChevronDown, ChevronUp, ShoppingBag, Eye, Loader2
} from 'lucide-react'
import { gooeyToast as toast } from 'goey-toast'

const STATUS_CONFIG = {
  PENDING:   { labelKey: 'pending',    icon: Clock,        cls: 'bg-yellow-100 text-yellow-700', step: 1 },
  CONFIRMED: { labelKey: 'confirmed',  icon: CheckCircle2, cls: 'bg-blue-100 text-blue-700',     step: 2 },
  SHIPPED:   { labelKey: 'shipped',    icon: Truck,        cls: 'bg-purple-100 text-purple-700', step: 3 },
  DELIVERED: { labelKey: 'delivered',  icon: CheckCircle2, cls: 'bg-green-100 text-green-700',   step: 4 },
  CANCELLED: { labelKey: 'cancelled',  icon: XCircle,      cls: 'bg-red-100 text-red-700',       step: 0 },
}

const STATUS_KEYS: Record<string, string> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

const TIMELINE_STEPS = [
  { key: 'placed',    labelKey: 'timelinePlaced',     icon: Package },
  { key: 'confirmed', labelKey: 'timelineConfirmed',   icon: CheckCircle2 },
  { key: 'shipped',   labelKey: 'timelineShipped',     icon: Truck },
  { key: 'delivered', labelKey: 'timelineDelivered',   icon: CheckCircle2 },
]

function OrderTimeline({ step }: { step: number }) {
  const t = useTranslations('Account')
  return (
    <div className="mt-4 flex items-start gap-0">
      {TIMELINE_STEPS.map((s, i) => {
        const done = step > i
        const current = step === i + 1
        return (
          <div key={s.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className={`h-0.5 flex-1 transition-colors ${done || current ? 'bg-brand-primary' : 'bg-gray-200'}`} />
              )}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done ? 'border-brand-primary bg-brand-primary text-white'
                  : current ? 'border-brand-primary bg-white text-brand-primary'
                  : 'border-gray-200 bg-white text-gray-300'
                }`}
              >
                <s.icon size={14} />
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 transition-colors ${done ? 'bg-brand-primary' : 'bg-gray-200'}`} />
              )}
            </div>
            <p className={`mt-1.5 text-center text-[10px] font-medium leading-tight ${done || current ? 'text-brand-primary' : 'text-gray-400'}`}>
              {t(s.labelKey)}
            </p>
          </div>
        )
      })}
    </div>
  )
}

interface OrderItemShape {
  id: string
  quantity?: number
  unitPrice?: number
  variantId?: string
  product?: { id?: string; slug?: string; nameFr?: string; images?: Array<{ url: string }> }
  variant?: {
    id?: string
    productId?: string
    volume?: string
    price?: number
    stockQty?: number
    skuVariant?: string
    imageUrl?: string | null
  }
}

interface OrderShape {
  id: string
  createdAt: string
  status: string
  totalAmount?: number
  items?: OrderItemShape[]
}

function OrderCard({ order }: { order: OrderShape }) {
  const [expanded, setExpanded] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const t = useTranslations('Account')
  const s = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING

  const downloadPdf = async () => {
    if (!order.id) return
    setDownloading(true)
    try {
      const blob = await ordersApi.getInvoicePdf(order.id)
      const pdfBlob = new Blob([blob], { type: 'application/pdf' })
      const url = URL.createObjectURL(pdfBlob)
      const fileName = `facture-${order.id.slice(-8).toUpperCase()}.pdf`
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.setAttribute('download', fileName)
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a)
        }
        URL.revokeObjectURL(url)
      }, 60000)
    } catch {
      toast.error(t('invoiceDownloadError'))
    } finally {
      setDownloading(false)
    }
  }

  const cancelOrder = async () => {
    if (!order.id) return
    if (!window.confirm(t('cancelConfirm'))) return
    setCancelling(true)
    try {
      await ordersApi.cancel(order.id)
      toast.success(t('orderCancelled'))
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
    } catch (err: any) {
      toast.error(err?.message ?? t('cancelError'))
    } finally {
      setCancelling(false)
    }
  }

  const reorder = async () => {
    if (!order.id || !order.items?.length) return
    setReordering(true)
    try {
      let added = 0
      let skipped = 0
      for (const item of order.items) {
        const v = item.variant
        const p = item.product
        if (!v?.id || !p?.slug) {
          skipped++
          continue
        }
        const product = {
          id: p.id ?? '',
          slug: p.slug,
          name: p.nameFr ?? t('article'),
          images: p.images?.map((img) => img.url) ?? [],
        } as any
        const variant = {
          id: v.id,
          productId: v.productId ?? p.id ?? '',
          label: undefined,
          volume: v.volume ?? t('part'),
          imageUrl: v.imageUrl ?? null,
          priceHT: v.price ?? item.unitPrice ?? 0,
          priceTTC: +((v.price ?? item.unitPrice ?? 0) * 1.19).toFixed(2),
          stock: v.stockQty ?? Number.POSITIVE_INFINITY,
          sku: v.skuVariant ?? '',
          status: 'in_stock',
          isDefault: false,
        } as any
        const result = addItem(product, variant, item.quantity ?? 1)
        if (result.ok) added++
        else skipped++
      }
      if (added > 0) {
        toast.success(t('articlesAdded', { count: added }))
        router.push('/panier')
      } else {
        toast.warning(skipped > 0 ? t('reorderFailed') : t('reorderError'))
      }
    } finally {
      setReordering(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-gray-50 bg-gray-50 p-4 sm:flex-row sm:items-center">
        <div className="flex-1 min-w-0">
          <Link href={`/compte/commandes/${order.id}`} className="font-mono text-xs text-gray-400 hover:text-brand-primary transition-colors">#{order.id.slice(-8).toUpperCase()}</Link>
          <p className="text-sm font-semibold text-brand-primary">
            {order.items?.length ?? 0} {t('items')} · {((order.totalAmount ?? 0)).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND
          </p>
          <p className="text-xs text-gray-400">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>{t(s.labelKey)}</span>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-white transition-colors"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="px-4 py-3 border-b border-gray-50">
          <OrderTimeline step={s.step} />
        </div>
      )}

      {/* Expanded items */}
      {expanded && order.items && order.items.length > 0 && (
        <div className="divide-y divide-gray-50 px-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <Package size={18} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-brand-primary">{item.product?.nameFr ?? t('article')}</p>
                <p className="text-xs text-gray-400">{t('quantity')} {item.quantity ?? 1}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 p-4 border-t border-gray-50">
        <Link href={`/compte/commandes/${order.id}`} className="flex items-center gap-1.5 rounded-xl border border-brand-primary/30 px-3 py-2 text-xs font-medium text-brand-primary hover:bg-brand-primary/5 transition-colors">
          <Eye size={13} /> {t('details')}
        </Link>
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          {downloading ? <Loader2 size={13} className="animate-spin" /> : <Printer size={13} />} {t('invoice')}
        </button>
        <button
          onClick={reorder}
          disabled={reordering}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          {reordering ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} {t('reorder')}
        </button>
        {order.status === 'PENDING' && (
          <button
            onClick={cancelOrder}
            disabled={cancelling}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            {cancelling ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />} {t('cancel')}
          </button>
        )}
        {order.status === 'DELIVERED' && (
          <Link
            href={`/compte/support?orderId=${order.id}`}
            className="flex items-center gap-1.5 rounded-xl border border-brand-primary/30 px-3 py-2 text-xs font-medium text-brand-primary hover:bg-brand-primary/5 transition-colors"
          >
            <ArrowRight size={13} /> {t('returnRefund')}
          </Link>
        )}
      </div>
    </div>
  )
}

export default function MesCommandesPage() {
    const { data, isLoading } = useQuery<any>({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getAll(),
    enabled: true,
  })
  const t = useTranslations('Account')

  const orders = Array.isArray(data) ? data : (data as any)?.data ?? []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">{t('myOrders')}</h1>
        <p className="text-sm text-gray-500">{t('ordersCount', { count: orders.length })}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-200" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          <ShoppingBag size={48} className="mx-auto mb-4 text-gray-200" />
          <h3 className="font-semibold text-gray-400">{t('noOrdersTitle')}</h3>
          <p className="mt-1 text-sm text-gray-300">{t('noOrdersYet')}</p>
          <Link href="/catalogue" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-light transition-colors">
            {t('exploreCatalog')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: OrderShape) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}