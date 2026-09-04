"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import Link from 'next/link'
import { gooeyToast as toast } from 'goey-toast'
import { useLocale, useTranslations } from 'next-intl'
import {
  Search, Download, Clock, CheckCircle2, Truck,
  XCircle, Filter, Package, Eye, AlertTriangle, Printer, PackageX
} from 'lucide-react'
import { downloadOrderPdf } from '@/lib/api/admin'

export default function AdminOrdersPage() {
  const t = useTranslations('Admin')
  const locale = useLocale()
  const queryClient = useQueryClient()

  const STATUS_CONFIG = {
    PENDING:   { labelKey: 'statusPending', icon: Clock,        cls: 'text-yellow-600 bg-yellow-50',     border: 'border-yellow-100' },
    CONFIRMED: { labelKey: 'statusConfirmed', icon: CheckCircle2, cls: 'text-blue-600 bg-blue-50',         border: 'border-blue-100' },
    SHIPPED:   { labelKey: 'statusShipped', icon: Truck,        cls: 'text-brand-primary bg-brand-primary/10', border: 'border-brand-primary/20' },
    DELIVERED: { labelKey: 'statusDelivered', icon: CheckCircle2, cls: 'text-green-600 bg-green-50',       border: 'border-green-100' },
    CANCELLED: { labelKey: 'statusCancelled', icon: XCircle,      cls: 'text-red-600 bg-red-50',           border: 'border-red-100' },
    RETURNED:  { labelKey: 'statusReturned', icon: PackageX,     cls: 'text-orange-600 bg-orange-50',     border: 'border-orange-100' }
  }

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selected, setSelected] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => adminApi.getOrders({ status: statusFilter === 'ALL' ? undefined : statusFilter }),
    enabled: true,
  })

  // Backend returns { data: [...], total, page, totalPages }
  const orders: any[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.data)
      ? (data as any).data
      : []

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success(t('statusUpdated'))
      setSelected([])
    },
    onError: () => toast.error(t('updateError')),
  })

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-red-400" />
          <p className="text-sm font-semibold text-red-700">{t('ordersLoadError')}</p>
          <button onClick={() => refetch()} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">{t('retry')}</button>
        </div>
      </div>
    )
  }

  const filtered = orders.filter((o: any) => {
    const q = search.toLowerCase()
    if (q && !(o.id || '').toLowerCase().includes(q) && !(o.shipFullName || '').toLowerCase().includes(q) && !(o.user?.email || '').toLowerCase().includes(q)) return false
    if (dateFrom && o.createdAt && new Date(o.createdAt) < new Date(dateFrom)) return false
    if (dateTo && o.createdAt && new Date(o.createdAt) > new Date(dateTo + 'T23:59:59')) return false
    if (amountMin && (o.totalAmount || 0) < parseFloat(amountMin)) return false
    if (amountMax && (o.totalAmount || 0) > parseFloat(amountMax)) return false
    return true
  })

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const bulkUpdateStatus = (status: string) => {
    selected.forEach((id) => updateMutation.mutate({ id, status }))
  }

  const exportCsv = async () => {
    try {
      const res = await adminApi.exportOrders(statusFilter === 'ALL' ? undefined : statusFilter); const csv = (res as any).csv
      const blob = new Blob([csv as any], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
      a.click(); URL.revokeObjectURL(url)
      toast.success(t('csvDownloaded'))
    } catch { toast.error(t('exportError')) }
  }

  const statusLabel = (key: string) => t(STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]?.labelKey ?? 'statusPending')

  return (
    <div className="p-3 sm:p-6 space-y-4">
      {/* Page header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-primary">{t('orders')}</h1>
          <p className="text-sm text-gray-500">{t('ordersFound', { count: orders.length })}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
          <Link
            href={`/${locale}/admin/payments`}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-3 py-2.5 text-sm font-bold text-black hover:bg-brand-accent-hover transition-colors shadow-sm"
          >
            <Package size={15} />
            <span className="truncate">⚡ Vente Caisse</span>
          </Link>
          <button
            onClick={exportCsv}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download size={15} />
            <span className="truncate">{t('exportCsv')}</span>
          </button>
        </div>
      </div>

      {/* Status filter tabs — horizontally scrollable */}
      <div className="-mx-3 sm:mx-0">
        <div className="hide-scrollbar flex gap-1 overflow-x-auto px-3 sm:px-0 pb-0.5 sm:rounded-xl sm:border sm:border-gray-200 sm:bg-white sm:p-1">
          {['ALL', ...Object.keys(STATUS_CONFIG)].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 bg-white sm:bg-transparent border border-gray-200 sm:border-0'
              }`}
            >
              {s === 'ALL' ? t('allOrders') : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-brand-primary p-3 text-sm text-white">
          <span className="font-semibold">{t('selectedCount', { count: selected.length })}</span>
          <div className="flex flex-wrap gap-2 ml-auto">
            <button onClick={() => bulkUpdateStatus('CONFIRMED')} className="rounded-lg bg-blue-500/20 px-3 py-1.5 font-medium hover:bg-blue-500/40 text-blue-200">{t('confirmAction')}</button>
            <button onClick={() => bulkUpdateStatus('SHIPPED')} className="rounded-lg bg-purple-500/20 px-3 py-1.5 font-medium hover:bg-purple-500/40 text-purple-200">{t('shipAction')}</button>
            <button onClick={() => bulkUpdateStatus('DELIVERED')} className="rounded-lg bg-green-500/20 px-3 py-1.5 font-medium hover:bg-green-500/40 text-green-200">{t('deliverAction')}</button>
            <button onClick={() => setSelected([])} className="rounded-lg bg-white/10 px-3 py-1.5 font-medium hover:bg-white/20">{t('cancelAction')}</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchByNumber')}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-brand-accent transition-all" />
        </div>
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={15} /> {t('advancedFilters')}
        </button>
      </div>

      {showAdvanced && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">{t('advancedFilters')}</p>
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1"><label className="text-xs text-gray-400">{t('fromDate')}</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-40" /></div>
            <div className="space-y-1"><label className="text-xs text-gray-400">{t('toDate')}</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-40" /></div>
            <div className="space-y-1"><label className="text-xs text-gray-400">{t('minAmount')}</label><input type="number" value={amountMin} onChange={e => setAmountMin(e.target.value)} placeholder="0" className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-32" /></div>
            <div className="space-y-1"><label className="text-xs text-gray-400">{t('maxAmount')}</label><input type="number" value={amountMax} onChange={e => setAmountMax(e.target.value)} placeholder="0" className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-32" /></div>
            {(dateFrom || dateTo || amountMin || amountMax) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); setAmountMin(''); setAmountMax('') }} className="self-end rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100">{t('resetFilters')}</button>
            )}
          </div>
        </div>
      )}

      <div className="hidden md:block rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="py-3 pl-4 pr-2">
                  <input type="checkbox" className="rounded border-gray-300"
                    onChange={(e) => setSelected(e.target.checked ? filtered.map((o: any) => o.id) : [])}
                    checked={selected.length === filtered.length && filtered.length > 0} />
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('orderColumn')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('dateColumn')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('customerColumn')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('totalColumn')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('statusColumn')}</th>
                <th className="py-3 pl-2 pr-4 text-xs font-semibold text-gray-500">{t('actionsColumn')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">{t('loading')}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Package size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-400">{t('noOrders')}</p>
                </td></tr>
              ) : filtered.map((order: any) => {
                const s = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
                return (
                  <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pl-4 pr-2">
                      <input type="checkbox" className="rounded border-gray-300"
                        checked={selected.includes(order.id)} onChange={() => toggleSelect(order.id)} />
                    </td>
                    <td className="px-2 py-3">
                      <p className="font-mono text-sm font-semibold text-brand-primary">#{(order.id ?? '').slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400">{order.items?.length ?? 0} {t('itemsCount')}</p>
                    </td>
                    <td className="px-2 py-3 text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString(locale) : '—'}
                    </td>
                    <td className="px-2 py-3">
                      <p className="text-sm font-medium text-gray-800">{order.user?.firstName ? `${order.user.firstName} ${order.user.lastName}` : order.shipFullName}</p>
                    </td>
                    <td className="px-2 py-3 font-semibold text-brand-primary whitespace-nowrap">
                      {order.totalAmount?.toLocaleString(locale, { minimumFractionDigits: 2 })} TND
                    </td>
                    <td className="px-2 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>
                        <s.icon size={12} /> {t(s.labelKey)}
                      </span>
                    </td>
                    <td className="py-3 pl-2 pr-4">
                      <div className="flex gap-1">
                        {order.status === 'PENDING' && (
                          <button onClick={() => updateMutation.mutate({ id: order.id, status: 'CONFIRMED' })}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600" title={t('confirmAction')}>
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button onClick={() => updateMutation.mutate({ id: order.id, status: 'SHIPPED' })}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-purple-50 hover:text-purple-600" title={t('shipAction')}>
                            <Truck size={15} />
                          </button>
                        )}
                        <Link href={`/${locale}/admin/orders/${order.id}`}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors" title={t('detailsAction')}>
                          <Eye size={15} />
                        </Link>
                        <button
                          onClick={() => downloadOrderPdf(order.id, 'delivery_slip')}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                          title="Bon de livraison"
                        >
                          <Truck size={15} />
                        </button>
                        <button
                          onClick={() => downloadOrderPdf(order.id, 'invoice')}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                          title={t('downloadInvoiceTitle')}
                        >
                          <Printer size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-gray-400">{t('loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center shadow-sm">
            <Package size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">{t('noOrders')}</p>
          </div>
        ) : (
          filtered.map((order: any) => {
            const s = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
            return (
              <div key={order.id} className={`rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 ${selected.includes(order.id) ? 'ring-2 ring-brand-primary border-transparent' : 'border-gray-100'}`}>
                <div className="mb-3 flex items-start justify-between border-b border-gray-50 pb-3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                      checked={selected.includes(order.id)} onChange={() => toggleSelect(order.id)} />
                    <div>
                      <p className="font-mono text-sm font-bold text-brand-primary">#{(order.id ?? '').slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400">{order.items?.length ?? 0} {t('itemsCount')}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>
                    <s.icon size={12} /> {t(s.labelKey)}
                  </span>
                </div>
                
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('dateColumn')}</p>
                    <p className="text-sm font-medium text-gray-800">{order.createdAt ? new Date(order.createdAt).toLocaleDateString(locale) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('totalColumn')}</p>
                    <p className="text-sm font-bold text-brand-primary">{order.totalAmount?.toLocaleString(locale, { minimumFractionDigits: 2 })} TND</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('customerColumn')}</p>
                    <p className="text-sm font-medium text-gray-800">{order.user?.firstName ? `${order.user.firstName} ${order.user.lastName}` : order.shipFullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link href={`/${locale}/admin/orders/${order.id}`}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-brand-primary transition-colors">
                    <Eye size={16} /> {t('detailsAction')}
                  </Link>
                  <button
                    onClick={() => downloadOrderPdf(order.id, 'delivery_slip')}
                    className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary transition-colors"
                    title="Bon de livraison"
                  >
                    <Truck size={16} />
                  </button>
                  <button
                    onClick={() => downloadOrderPdf(order.id, 'invoice')}
                    className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary transition-colors"
                    title={t('downloadInvoiceTitle')}
                  >
                    <Printer size={16} />
                  </button>
                  {order.status === 'PENDING' && (
                    <button onClick={() => updateMutation.mutate({ id: order.id, status: 'CONFIRMED' })}
                      className="flex items-center justify-center rounded-xl bg-blue-50 p-2.5 text-blue-600 hover:bg-blue-100 transition-colors" title={t('confirmAction')}>
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button onClick={() => updateMutation.mutate({ id: order.id, status: 'SHIPPED' })}
                      className="flex items-center justify-center rounded-xl bg-purple-50 p-2.5 text-purple-600 hover:bg-purple-100 transition-colors" title={t('shipAction')}>
                      <Truck size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}