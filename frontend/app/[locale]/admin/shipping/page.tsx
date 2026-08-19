"use client";

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, downloadOrderPdf } from '@/lib/api/admin'
import { toast } from 'sonner'
import {
  AlertTriangle, CheckCircle2, Clock, Download, FileText, MapPin,
  PackageCheck, Search, Settings2, Truck, Plus, X, Save, Trash2,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

type ShippingOrder = {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  totalAmount?: number
  shipFullName?: string
  shipPhone?: string
  shipWilaya?: string
  shipCity?: string
  items?: unknown[]
  createdAt: string
}

type Zone = { id: string; name: string; price: number; eta: string; sortOrder: number; isActive: boolean }

const STATUS: Record<string, { labelKey: string; className: string; icon: any }> = {
  CONFIRMED: { labelKey: 'toPrepare', className: 'bg-blue-100 text-blue-700', icon: PackageCheck },
  SHIPPED: { labelKey: 'inDelivery', className: 'bg-purple-100 text-purple-700', icon: Truck },
  DELIVERED: { labelKey: 'deliveredX', className: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  PENDING: { labelKey: 'statusPending', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CANCELLED: { labelKey: 'statusCancelled', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
}

export default function AdminShippingPage() {
  const t = useTranslations('Admin')
  const locale = useLocale()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | ShippingOrder['status']>('ALL')
  const [showTarifs, setShowTarifs] = useState(false)
  const [zoneForm, setZoneForm] = useState<{ name: string; price: string; eta: string }>({ name: '', price: '', eta: '' })
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null)

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: ['admin-shipping-orders'],
    queryFn: () => adminApi.getOrders({ page: 1 }),
  })
  const { data: zones } = useQuery<any>({
    queryKey: ['shipping-zones'],
    queryFn: () => adminApi.getShippingZones(),
    enabled: true,
  })

  const zoneList: Zone[] = Array.isArray(zones) ? zones : []
  const r = (data as any)?.data ?? data ?? {}
  const orders: ShippingOrder[] = useMemo(() => Array.isArray(r) ? r : r.data ?? [], [r])
  const shippingOrders = useMemo(() => orders.filter((o) => ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(o.status)), [orders])
  const filtered = shippingOrders.filter((order) => {
    const text = `${order.id} ${order.shipFullName ?? ''} ${order.shipWilaya ?? ''} ${order.shipCity ?? ''}`.toLowerCase()
    return (!search || text.includes(search.toLowerCase())) && (status === 'ALL' || order.status === status)
  })

  const summary = {
    ready: shippingOrders.filter((o) => o.status === 'CONFIRMED').length,
    shipped: shippingOrders.filter((o) => o.status === 'SHIPPED').length,
    delivered: shippingOrders.filter((o) => o.status === 'DELIVERED').length,
  }

  const createZone = useMutation({
    mutationFn: (d: { name: string; price: number; eta: string }) => adminApi.createShippingZone(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipping-zones'] }); setZoneForm({ name: '', price: '', eta: '' }); toast.success(t('zoneAdded')) },
    onError: () => toast.error(t('genericError')),
  })
  const updateZone = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateShippingZone(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipping-zones'] }); setEditingZone(null); toast.success(t('zoneUpdated')) },
    onError: () => toast.error(t('genericError')),
  })
  const deleteZone = useMutation({
    mutationFn: (id: string) => adminApi.deleteShippingZone(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipping-zones'] }); toast.success(t('zoneDeleted')) },
  })

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-red-400" />
          <p className="text-sm font-semibold text-red-700">{t('stockLoadError')}</p>
          <button onClick={() => refetch()} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">{t('retry')}</button>
        </div>
      </div>
    )
  }

  const exportCsv = async () => {
    try {
      const res = await adminApi.exportOrders(); const csv = (res as any).csv
      const blob = new Blob([csv as any], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `expeditions-${new Date().toISOString().split('T')[0]}.csv`
      a.click(); URL.revokeObjectURL(url)
      toast.success(t('shipmentExportDone'))
    } catch { toast.error(t('exportError')) }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">{t('shipping')}</h1>
          <p className="text-sm text-gray-500">{t('shippingSubtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={15} /> {t('exportLabel')}
          </button>
          <button onClick={() => setShowTarifs(true)} className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors">
            <Settings2 size={16} /> {t('tariffs')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { labelKey: 'toPrepare', value: summary.ready, icon: PackageCheck, className: 'bg-blue-50 text-blue-700' },
          { labelKey: 'inDelivery', value: summary.shipped, icon: Truck, className: 'bg-purple-50 text-purple-700' },
          { labelKey: 'deliveredX', value: summary.delivered, icon: CheckCircle2, className: 'bg-green-50 text-green-700' },
        ].map((card) => (
          <div key={card.labelKey} className={`rounded-2xl p-5 ${card.className}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{t(card.labelKey)}</p>
                <p className="mt-1 text-3xl font-black">{card.value}</p>
              </div>
              <card.icon size={26} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t('shippingSearchPlaceholder')}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-brand-accent transition-all" />
            </div>
            <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
              {(['ALL', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const).map((v) => (
                <button key={v} onClick={() => setStatus(v)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${status === v ? 'bg-brand-primary text-white' : 'text-gray-500 hover:text-gray-800'}`}>
                  {v === 'ALL' ? t('allStatuses') : t(STATUS[v].labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">{t('orderColumn')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">{t('destinationHeader')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">{t('itemsHeader')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">{t('statusColumn')}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-50"><td colSpan={4} className="px-4 py-3"><div className="h-5 animate-pulse rounded bg-gray-100" /></td></tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="py-14 text-center text-sm text-gray-400">{t('noExpeditions')}</td></tr>
                ) : filtered.map((order) => {
                  const s = STATUS[order.status]; const Icon = s.icon
                  return (
                    <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm font-semibold text-brand-primary">#{(order.id ?? '').slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString(locale) : '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{order.shipFullName ?? t('userFallback')}</p>
                        <p className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin size={12} /> {[order.shipCity, order.shipWilaya].filter(Boolean).join(', ') || t('addressUndefined')}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{order.items?.length ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${s.className}`}>
                          <Icon size={12} /> {t(s.labelKey)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => downloadOrderPdf(order.id)} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-primary/5 transition-colors" title={t('deliveryNotePdf')}>
                          <FileText size={14} /> PDF
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-brand-primary">{t('activeZones')}</h2>
            <div className="mt-4 space-y-3">
              {zoneList.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">{t('noZones')}</p>
              ) : zoneList.filter((z) => z.isActive).map((zone) => (
                <div key={zone.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-primary">{zone.name}</p>
                    <p className="text-xs text-gray-400">{zone.eta}</p>
                  </div>
                  <span className="text-sm font-bold text-brand-primary">{zone.price.toFixed(2)} TND</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-blue-700">
            <div className="flex items-center gap-3">
              <Truck size={20} />
              <h2 className="font-bold">{t('freeShipping')}</h2>
            </div>
            <p className="mt-2 text-sm text-blue-600">{t('freeShippingThreshold')}</p>
          </div>
        </div>
      </div>

      {/* Tarifs Modal */}
      {showTarifs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowTarifs(false); setEditingZone(null) }}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-brand-primary">{t('zonesTariffsTitle')}</h2>
              <button onClick={() => { setShowTarifs(false); setEditingZone(null) }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {zoneList.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  {editingZone?.id === zone.id ? (
                    <div className="flex-1 flex gap-2 items-center">
                      <input value={editingZone.name} onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })} className="w-28 rounded-lg border px-2 py-1 text-sm" />
                      <input value={(editingZone.price ?? 0).toString()} onChange={(e) => setEditingZone({ ...editingZone, price: parseFloat(e.target.value) || 0 })} className="w-20 rounded-lg border px-2 py-1 text-sm" type="number" step="0.01" />
                      <input value={editingZone.eta} onChange={(e) => setEditingZone({ ...editingZone, eta: e.target.value })} className="w-20 rounded-lg border px-2 py-1 text-sm" />
                      <button onClick={() => updateZone.mutate({ id: zone.id, data: { name: editingZone.name, price: editingZone.price, eta: editingZone.eta } })} className="rounded-lg bg-green-50 p-1.5 text-green-600 hover:bg-green-100"><Save size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-semibold text-brand-primary">{zone.name}</p>
                        <p className="text-xs text-gray-400">{zone.eta}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-brand-primary">{zone.price.toFixed(2)} TND</span>
                        <button onClick={() => setEditingZone(zone)} className="rounded-lg p-1 text-gray-400 hover:text-blue-600"><Settings2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(zone)} className="rounded-lg p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('addZone')}</h3>
              <div className="flex gap-2">
                <input value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} placeholder={t('zoneNamePlaceholder')} className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-accent" />
                <input value={zoneForm.price} onChange={(e) => setZoneForm({ ...zoneForm, price: e.target.value })} placeholder={t('pricePlaceholder')} type="number" step="0.01" className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-accent" />
                <input value={zoneForm.eta} onChange={(e) => setZoneForm({ ...zoneForm, eta: e.target.value })} placeholder={t('delayPlaceholder')} className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-accent" />
                <button onClick={() => { if (zoneForm.name && zoneForm.price) createZone.mutate({ name: zoneForm.name, price: parseFloat(zoneForm.price), eta: zoneForm.eta || '24-48h' }) }}
                  className="rounded-xl bg-brand-accent px-3 py-2 text-sm font-semibold text-black hover:bg-brand-accent-hover"><Plus size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">{t('deleteZoneTitle')}</h3>
            <p className="mt-2 text-sm text-gray-500">{t('deleteZoneDesc', { name: deleteTarget.name })}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">{t('cancel')}</button>
              <button onClick={() => { deleteZone.mutate(deleteTarget.id); setDeleteTarget(null) }} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">{t('deleteAction')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
