"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  Search, Download, Clock, CheckCircle2, Truck,
  XCircle, Filter, ChevronDown, Package, Edit2, Eye, AlertTriangle
} from 'lucide-react'

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente', icon: Clock,        cls: 'text-yellow-600 bg-yellow-50',     border: 'border-yellow-100' },
  CONFIRMED: { label: 'Confirmée',  icon: CheckCircle2, cls: 'text-blue-600 bg-blue-50',         border: 'border-blue-100' },
  SHIPPED:   { label: 'Expédiée',   icon: Truck,        cls: 'text-purple-600 bg-purple-50',     border: 'border-purple-100' },
  DELIVERED: { label: 'Livrée',     icon: CheckCircle2, cls: 'text-green-600 bg-green-50',       border: 'border-green-100' },
  CANCELLED: { label: 'Annulée',    icon: XCircle,      cls: 'text-red-600 bg-red-50',           border: 'border-red-100' },
}

export default function AdminOrdersPage() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const queryClient = useQueryClient()
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

  const r = (data as any)?.data ?? data ?? {}
  const orders = Array.isArray(r) ? r : r.data ?? []

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success('Statut mis à jour')
      setSelected([])
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-red-400" />
          <p className="text-sm font-semibold text-red-700">Erreur de chargement des commandes</p>
          <button onClick={() => refetch()} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Réessayer</button>
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
      const a = document.createElement('a'); a.href = url; a.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`
      a.click(); URL.revokeObjectURL(url)
      toast.success('Export CSV téléchargé')
    } catch { toast.error("Erreur lors de l'export") }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Commandes</h1>
          <p className="text-sm text-gray-500">{orders.length} commandes trouvées</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Exporter CSV
          </button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1">
        {['ALL', ...Object.keys(STATUS_CONFIG)].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${statusFilter === s ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
            {s === 'ALL' ? 'Toutes les commandes' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-brand-primary p-3 text-sm text-white">
          <span className="font-semibold">{selected.length} sélectionnée(s)</span>
          <div className="flex flex-wrap gap-2 ml-auto">
            <button onClick={() => bulkUpdateStatus('CONFIRMED')} className="rounded-lg bg-blue-500/20 px-3 py-1.5 font-medium hover:bg-blue-500/40 text-blue-200">Confirmer</button>
            <button onClick={() => bulkUpdateStatus('SHIPPED')} className="rounded-lg bg-purple-500/20 px-3 py-1.5 font-medium hover:bg-purple-500/40 text-purple-200">Expédier</button>
            <button onClick={() => bulkUpdateStatus('DELIVERED')} className="rounded-lg bg-green-500/20 px-3 py-1.5 font-medium hover:bg-green-500/40 text-green-200">Livrer</button>
            <button onClick={() => setSelected([])} className="rounded-lg bg-white/10 px-3 py-1.5 font-medium hover:bg-white/20">Annuler</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro, client..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-brand-accent transition-all" />
        </div>
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={15} /> Filtres avancés
        </button>
      </div>

      {showAdvanced && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">Filtres avancés</p>
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1"><label className="text-xs text-gray-400">Du</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-40" /></div>
            <div className="space-y-1"><label className="text-xs text-gray-400">Au</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-40" /></div>
            <div className="space-y-1"><label className="text-xs text-gray-400">Montant min</label><input type="number" value={amountMin} onChange={e => setAmountMin(e.target.value)} placeholder="0" className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-32" /></div>
            <div className="space-y-1"><label className="text-xs text-gray-400">Montant max</label><input type="number" value={amountMax} onChange={e => setAmountMax(e.target.value)} placeholder="0" className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-32" /></div>
            {(dateFrom || dateTo || amountMin || amountMax) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); setAmountMin(''); setAmountMax('') }} className="self-end rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100">Réinitialiser</button>
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
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Commande</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Date</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Client</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Total</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Statut</th>
                <th className="py-3 pl-2 pr-4 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Package size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-400">Aucune commande trouvée</p>
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
                      <p className="text-xs text-gray-400">{order.items?.length ?? 0} articles</p>
                    </td>
                    <td className="px-2 py-3 text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-TN') : '—'}
                    </td>
                    <td className="px-2 py-3">
                      <p className="text-sm font-medium text-gray-800">{order.user?.firstName ? `${order.user.firstName} ${order.user.lastName}` : order.shipFullName}</p>
                    </td>
                    <td className="px-2 py-3 font-semibold text-brand-primary whitespace-nowrap">
                      {order.totalAmount?.toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND
                    </td>
                    <td className="px-2 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>
                        <s.icon size={12} /> {s.label}
                      </span>
                    </td>
                    <td className="py-3 pl-2 pr-4">
                      <div className="flex gap-1">
                        {order.status === 'PENDING' && (
                          <button onClick={() => updateMutation.mutate({ id: order.id, status: 'CONFIRMED' })}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600" title="Confirmer">
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button onClick={() => updateMutation.mutate({ id: order.id, status: 'SHIPPED' })}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-purple-50 hover:text-purple-600" title="Expédier">
                            <Truck size={15} />
                          </button>
                        )}
                        <Link href={`/${locale}/admin/orders/${order.id}`}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Détails">
                          <Eye size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
