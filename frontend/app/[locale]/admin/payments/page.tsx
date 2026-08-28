"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, downloadOrderPdf } from '@/lib/api/admin'
import {
  CreditCard, Banknote, Clock, CheckCircle2, Search, ChevronLeft, ChevronRight,
  Plus, ShoppingCart, Trash2, User, Phone, FileText, Printer, Loader2, X,
  Check, ArrowRight, Package, Calculator, Store
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

const STATUS_LABELS: Record<string, { labelKey: string; className: string }> = {
  PENDING:   { labelKey: 'paymentPendingCod', className: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { labelKey: 'paymentCompleted',  className: 'bg-green-100 text-green-700'  },
  FAILED:    { labelKey: 'paymentFailed',     className: 'bg-red-100 text-red-700'      },
  REFUNDED:  { labelKey: 'paymentRefunded',   className: 'bg-blue-100 text-blue-700'    },
}

type CartItem = {
  productId: string
  productName: string
  brandName?: string
  imageUrl?: string
  variantId: string
  volume: string
  unitPrice: number
  quantity: number
  availableStock: number
}

export default function AdminPaymentsPage() {
  const t = useTranslations('Admin')
  const locale = useLocale()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  // ── POS Modal State ──
  const [posOpen, setPosOpen] = useState(false)
  const [posSearch, setPosSearch] = useState('')
  const [posCart, setPosCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'CHECK'>('CASH')
  const [amountGiven, setAmountGiven] = useState<string>('')
  const [posNotes, setPosNotes] = useState('')
  const [lastCreatedOrderId, setLastCreatedOrderId] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: ['admin-payments', page, search],
    queryFn: () => adminApi.getPayments({ page, limit, search: search.trim() || undefined }),
  })

  // POS Product Search Query
  const { data: searchResults = [], isLoading: isSearchingProducts } = useQuery<any[]>({
    queryKey: ['admin-pos-products', posSearch],
    queryFn: () => adminApi.searchPosProducts(posSearch.trim() || undefined),
    enabled: posOpen,
  })

  const raw = (data as any)?.data ?? data ?? {}
  const payments: any[] = Array.isArray(raw) ? raw : raw.data ?? []
  const total = raw.total ?? payments.length
  const totalPages = raw.totalPages ?? Math.ceil(total / limit)
  const stats = raw.stats ?? {}

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updatePaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success(t('statusUpdated'))
    },
    onError: () => toast.error(t('updateError')),
  })

  const posSaleMutation = useMutation({
    mutationFn: (saleData: any) => adminApi.createDirectSale(saleData),
    onSuccess: async (res: any) => {
      const createdOrder = (res as any)?.data?.order ?? (res as any)?.order
      toast.success('Vente comptoir enregistrée et encaissée avec succès !')
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })

      if (createdOrder?.id) {
        setLastCreatedOrderId(createdOrder.id)
        try {
          await downloadOrderPdf(createdOrder.id)
        } catch (e) {
          console.error('PDF auto-download failed', e)
        }
      }

      // Reset POS cart
      setPosCart([])
      setCustomerName('')
      setCustomerPhone('')
      setAmountGiven('')
      setPosNotes('')
      setPosOpen(false)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors de l’encaissement'
      toast.error(msg)
    },
  })

  // Cart calculations
  const cartTotal = useMemo(() => {
    return posCart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  }, [posCart])

  const changeReturn = useMemo(() => {
    const given = parseFloat(amountGiven) || 0
    if (given <= cartTotal) return 0
    return Math.round((given - cartTotal) * 100) / 100
  }, [amountGiven, cartTotal])

  const addToCart = (product: any, variant: any) => {
    if (variant.stockQty <= 0) {
      toast.error(`Rupture de stock pour ce volume (${variant.volume})`)
      return
    }

    setPosCart((prev) => {
      const existing = prev.find((item) => item.variantId === variant.id)
      if (existing) {
        if (existing.quantity >= variant.stockQty) {
          toast.error(`Stock maximal atteint (${variant.stockQty})`)
          return prev
        }
        return prev.map((item) =>
          item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }

      return [
        ...prev,
        {
          productId: product.id,
          productName: product.nameFr,
          brandName: product.brand?.name,
          imageUrl: product.images?.[0]?.url,
          variantId: variant.id,
          volume: variant.volume,
          unitPrice: variant.price,
          quantity: 1,
          availableStock: variant.stockQty,
        },
      ]
    })
  }

  const updateCartQuantity = (variantId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((item) => {
          if (item.variantId === variantId) {
            const nextQty = item.quantity + delta
            if (nextQty > item.availableStock) {
              toast.error(`Stock maximal atteint (${item.availableStock})`)
              return item
            }
            return nextQty > 0 ? { ...item, quantity: nextQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const updateCartPrice = (variantId: string, newPrice: number) => {
    setPosCart((prev) =>
      prev.map((item) => (item.variantId === variantId ? { ...item, unitPrice: Math.max(0, newPrice) } : item))
    )
  }

  const removeFromCart = (variantId: string) => {
    setPosCart((prev) => prev.filter((item) => item.variantId !== variantId))
  }

  const handleExecutePosSale = (e: React.FormEvent) => {
    e.preventDefault()
    if (posCart.length === 0) {
      toast.error('Veuillez ajouter au moins un produit au panier de caisse.')
      return
    }

    posSaleMutation.mutate({
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      paymentMethod,
      notes: posNotes.trim() || undefined,
      items: posCart.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    })
  }

  const fmt = (n: number) =>
    (n ?? 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TND'
  const sliceId = (id?: string) => (id ? `#${id.slice(-8).toUpperCase()}` : 'N/A')

  // Real global aggregate stats
  const totalPending   = stats.totalPending ?? payments.filter((p: any) => p.status === 'PENDING').reduce((s: number, p: any) => s + (p.amount || 0), 0)
  const totalCompleted = stats.totalCompleted ?? payments.filter((p: any) => p.status === 'COMPLETED').reduce((s: number, p: any) => s + (p.amount || 0), 0)
  const totalVolume    = stats.totalVolume ?? (totalPending + totalCompleted)

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">{t('paymentsTitle')}</h1>
          <p className="text-sm text-gray-500">{t('paymentsSubtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPosOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-bold text-black hover:bg-brand-accent-hover transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Store size={18} />
            <span>⚡ Nouvelle Vente / Caisse</span>
          </button>
        </div>
      </div>

      {/* Real Aggregate Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 mb-4">
            <Clock size={20} />
          </div>
          <p className="text-sm font-medium text-gray-500">{t('paymentPendingCod')}</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{isLoading ? '...' : fmt(totalPending)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 mb-4">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-sm font-medium text-gray-500">{t('collectedPayments')}</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{isLoading ? '...' : fmt(totalCompleted)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-4">
            <CreditCard size={20} />
          </div>
          <p className="text-sm font-medium text-gray-500">{t('totalVolume')}</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{isLoading ? '...' : fmt(totalVolume)}</p>
        </div>
      </div>

      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-700">
          {t('loadError')}{' '}
          <button onClick={() => refetch()} className="font-semibold underline">
            {t('retry')}
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 p-4 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-brand-primary">{t('transactionsHistory')}</h2>
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher (Client, Commande, ID)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-accent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">{t('transactionIdHeader')}</th>
                <th className="px-6 py-3 font-semibold">{t('customerColumn')}</th>
                <th className="px-6 py-3 font-semibold">{t('firstProductHeader')}</th>
                <th className="px-6 py-3 font-semibold">{t('dateColumn')}</th>
                <th className="px-6 py-3 font-semibold">{t('methodHeader')}</th>
                <th className="px-6 py-3 font-semibold text-right">{t('amountColumn')}</th>
                <th className="px-6 py-3 font-semibold text-center">{t('statusColumn')}</th>
                <th className="px-6 py-3 font-semibold text-center">Facture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    {t('loading')}
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    {t('noTransactions')}
                  </td>
                </tr>
              ) : (
                payments.map((tx: any) => {
                  const statusConf = STATUS_LABELS[tx.status]
                  const isStorePickup = tx.order?.orderType === 'STORE_PICKUP'
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-medium text-brand-primary">{sliceId(tx.id)}</div>
                        <div className="text-xs text-gray-400">
                          {t('cmdPrefix')}
                          {sliceId(tx.orderId)}
                          {isStorePickup && (
                            <span className="ml-1 rounded bg-blue-50 px-1 text-[10px] font-bold text-blue-700">
                              Magasin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="font-medium">{tx.order?.shipFullName || tx.order?.user?.name || 'Client Comptoir'}</div>
                        <div className="text-xs text-gray-400">{tx.order?.shipPhone || tx.order?.user?.email || '—'}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs max-w-[180px] truncate">
                        {tx.order?.items?.[0]?.product?.nameFr ?? 'Articles divers'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString(locale, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Banknote size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-700">
                            {tx.method === 'CASH'
                              ? 'Espèces'
                              : tx.method === 'CARD'
                              ? 'Carte'
                              : tx.method === 'CHECK'
                              ? 'Chèque'
                              : tx.method}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-brand-primary whitespace-nowrap">
                        {fmt(tx.amount || 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              statusConf?.className ?? 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {statusConf ? t(statusConf.labelKey) : tx.status}
                          </span>
                          {tx.status === 'PENDING' && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: tx.id, status: 'COMPLETED' })}
                              disabled={updateStatusMutation.isPending}
                              className="ml-1 rounded-lg p-1 text-green-600 hover:bg-green-50 transition-colors"
                              title={t('markCollected')}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {tx.orderId && (
                          <button
                            onClick={() => downloadOrderPdf(tx.orderId)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                            title="Imprimer / Télécharger Bon"
                          >
                            <Printer size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-gray-600">
            {t('pageSimple', { current: page, total: totalPages })}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── POINT OF SALE / CAISSE MODAL ────────────────────────────────────── */}
      {posOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
          <div
            className="relative flex flex-col h-[92vh] max-h-[900px] w-full max-w-5xl rounded-3xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* POS Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-brand-primary-dark px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent text-black font-bold">
                  <Store size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Point de Vente & Caisse Magasin</h2>
                  <p className="text-xs text-gray-300">Encaissement immédiat et mise à jour des stocks en temps réel</p>
                </div>
              </div>
              <button
                onClick={() => setPosOpen(false)}
                className="rounded-xl p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* POS Body: 2 Columns */}
            <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-hidden">
              {/* Left Column: Product Search & Picker (7 cols) */}
              <div className="md:col-span-7 flex flex-col border-r border-gray-100 bg-gray-50/50 p-5 overflow-hidden">
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    placeholder="Chercher une pièce, huile (ex: Motul, 5W40, Filtre, SKU)..."
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all shadow-sm"
                    autoFocus
                  />
                  {posSearch && (
                    <button
                      onClick={() => setPosSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Product Results List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {isSearchingProducts ? (
                    <div className="flex h-48 items-center justify-center text-gray-400">
                      <Loader2 size={24} className="animate-spin mr-2" /> Recherche des articles...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                      <Package size={36} className="mb-2 text-gray-300" />
                      <p className="text-sm">Aucun produit trouvé</p>
                    </div>
                  ) : (
                    searchResults.map((product) => {
                      const firstAvailableVariant =
                        (product.variants || []).find((v: any) => v.stockQty > 0) ||
                        product.variants?.[0]
                      const isAnyInStock = (product.variants || []).some((v: any) => v.stockQty > 0)

                      return (
                        <div
                          key={product.id}
                          onClick={() => {
                            if (isAnyInStock && firstAvailableVariant) {
                              addToCart(product, firstAvailableVariant)
                            }
                          }}
                          className={`group relative rounded-2xl border bg-white p-3.5 shadow-sm transition-all select-none ${
                            isAnyInStock
                              ? 'cursor-pointer border-gray-200/80 hover:border-brand-primary hover:bg-brand-primary/[0.02] hover:shadow-md active:scale-[0.99]'
                              : 'border-gray-200/50 opacity-60 cursor-not-allowed bg-gray-50/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {product.images?.[0]?.url ? (
                              <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                <Image
                                  src={product.images[0].url}
                                  alt={product.nameFr}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                            ) : (
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                <Package size={20} />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {product.brand?.name && (
                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                                      {product.brand.name}
                                    </span>
                                  )}
                                  <span className="font-mono text-[10px] text-gray-400">SKU: {product.sku}</span>
                                </div>
                                {isAnyInStock && (
                                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    + Ajouter
                                  </span>
                                )}
                              </div>
                              <h4 className="mt-0.5 truncate text-sm font-bold text-brand-primary group-hover:text-blue-600 transition-colors">
                                {product.nameFr}
                              </h4>

                              {/* Variants List & Add Buttons */}
                              <div className="mt-2.5 flex flex-wrap gap-2">
                                {(product.variants || []).map((variant: any) => {
                                  const inStock = variant.stockQty > 0
                                  return (
                                    <button
                                      key={variant.id}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (inStock) {
                                          addToCart(product, variant)
                                        }
                                      }}
                                      disabled={!inStock}
                                      className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                                        inStock
                                          ? 'bg-brand-primary/5 hover:bg-brand-primary hover:text-white text-brand-primary active:scale-95'
                                          : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                      }`}
                                    >
                                      <span>{variant.volume || 'Standard'}</span>
                                      <span className="font-bold">{variant.price.toFixed(2)} TND</span>
                                      <span
                                        className={`rounded-full px-1.5 py-0.2 text-[9px] ${
                                          inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                                        }`}
                                      >
                                        {inStock ? `Stock: ${variant.stockQty}` : 'Épuisé'}
                                      </span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Register Ticket & Checkout (5 cols) */}
              <form
                onSubmit={handleExecutePosSale}
                className="md:col-span-5 flex flex-col bg-white p-5 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} className="text-brand-accent" />
                    <h3 className="font-bold text-brand-primary">Ticket de Caisse</h3>
                  </div>
                  <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-bold text-brand-primary">
                    {posCart.length} article{posCart.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Cart Items Scroll Area */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
                  {posCart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                      <ShoppingCart size={32} className="mb-2 text-gray-200" />
                      <p className="text-sm">Le panier de caisse est vide</p>
                      <p className="text-xs text-gray-400 mt-1">Sélectionnez un produit à gauche pour l'ajouter</p>
                    </div>
                  ) : (
                    posCart.map((item) => (
                      <div
                        key={item.variantId}
                        className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-brand-primary">{item.productName}</p>
                            <p className="text-[11px] text-gray-500">
                              Volume: <span className="font-semibold text-brand-primary">{item.volume}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.variantId)}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                            title="Retirer l'article"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/50">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5 bg-white rounded-lg border border-gray-200 px-1 py-0.5 shadow-sm">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.variantId, -1)}
                              className="h-6 w-6 rounded text-gray-600 hover:bg-gray-100 font-bold"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.variantId, 1)}
                              className="h-6 w-6 rounded text-gray-600 hover:bg-gray-100 font-bold"
                            >
                              +
                            </button>
                          </div>

                          {/* Unit Price (Editable for discounts) */}
                          <div className="text-right">
                            <p className="text-xs font-bold text-brand-primary">
                              {(item.unitPrice * item.quantity).toFixed(2)} TND
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {item.unitPrice.toFixed(2)} TND / u
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Customer & Payment Section */}
                <div className="border-t border-gray-100 pt-3 mt-3 space-y-3">
                  {/* Customer Quick Input */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500">Client (Optionnel)</label>
                      <div className="relative mt-1">
                        <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Client Comptoir"
                          className="w-full rounded-xl border border-gray-200 py-1.5 pl-8 pr-2 text-xs outline-none focus:border-brand-accent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500">Téléphone</label>
                      <div className="relative mt-1">
                        <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="216..."
                          className="w-full rounded-xl border border-gray-200 py-1.5 pl-8 pr-2 text-xs outline-none focus:border-brand-accent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500">Mode de Règlement</label>
                    <div className="mt-1 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                          paymentMethod === 'CASH'
                            ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Banknote size={14} /> Espèces
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CARD')}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                          paymentMethod === 'CARD'
                            ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <CreditCard size={14} /> Carte TPE
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CHECK')}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                          paymentMethod === 'CHECK'
                            ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FileText size={14} /> Chèque
                      </button>
                    </div>
                  </div>

                  {/* Cash Change Calculator */}
                  {paymentMethod === 'CASH' && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator size={16} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-600">Espèces reçues :</span>
                        <input
                          type="number"
                          step="0.01"
                          value={amountGiven}
                          onChange={(e) => setAmountGiven(e.target.value)}
                          placeholder={cartTotal.toFixed(2)}
                          className="w-24 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-bold text-brand-primary outline-none focus:border-brand-accent"
                        />
                      </div>
                      {changeReturn > 0 && (
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block">Monnaie à rendre :</span>
                          <span className="text-xs font-black text-green-600">{changeReturn.toFixed(2)} TND</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Total & Submit Button */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-gray-500">Total à Encaisser :</span>
                      <span className="text-2xl font-black text-brand-primary">{cartTotal.toFixed(2)} TND</span>
                    </div>

                    <button
                      type="submit"
                      disabled={posSaleMutation.isPending || posCart.length === 0}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-accent py-3.5 text-sm font-black text-black hover:bg-brand-accent-hover active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {posSaleMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Enregistrement en cours...
                        </>
                      ) : (
                        <>
                          <Check size={18} /> Encaisser & Valider la Vente ({cartTotal.toFixed(2)} TND)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
