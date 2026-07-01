"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { useAuthStore } from '@/lib/store/auth.store'
import {
  Search, Download, Clock, CheckCircle2, Truck,
  XCircle, Filter, ChevronDown, Package, Edit2
} from 'lucide-react'
import { toast } from 'sonner'

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente', icon: Clock,        cls: 'text-yellow-600 bg-yellow-50',     border: 'border-yellow-100' },
  CONFIRMED: { label: 'Confirmée',  icon: CheckCircle2, cls: 'text-blue-600 bg-blue-50',         border: 'border-blue-100' },
  SHIPPED:   { label: 'Expédiée',   icon: Truck,        cls: 'text-purple-600 bg-purple-50',     border: 'border-purple-100' },
  DELIVERED: { label: 'Livrée',     icon: CheckCircle2, cls: 'text-green-600 bg-green-50',       border: 'border-green-100' },
  CANCELLED: { label: 'Annulée',    icon: XCircle,      cls: 'text-red-600 bg-red-50',           border: 'border-red-100' },
}

export default function AdminOrdersPage() {
    const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selected, setSelected] = useState<string[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => adminApi.getOrders({ status: statusFilter === 'ALL' ? undefined : statusFilter }),
    enabled: true,
  })

  const orders = data?.data?.data ?? []

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

  const filtered = orders.filter((o: any) =>
    !search ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const bulkUpdateStatus = (status: string) => {
    selected.forEach((id) => updateMutation.mutate({ id, status }))
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Commandes</h1>
          <p className="text-sm text-gray-500">{data?.data?.total ?? 0} commandes trouvées</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Exporter CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1">
        {['ALL', ...Object.keys(STATUS_CONFIG)].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
              statusFilter === s ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {s === 'ALL' ? 'Toutes les commandes' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
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

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro, client..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-brand-accent transition-all"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={15} /> Filtres avancés
        </button>
      </div>

      {/* Main Table - Desktop */}
      <div className="hidden md:block rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="py-3 pl-4 pr-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    onChange={(e) => setSelected(e.target.checked ? filtered.map((o: any) => o.id) : [])}
                    checked={selected.length === filtered.length && filtered.length > 0}
                  />
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
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Package size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-sm text-gray-400">Aucune commande trouvée</p>
                  </td>
                </tr>
              ) : (
                filtered.map((order: any) => {
                  const s = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
                  return (
                    <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selected.includes(order.id)}
                          onChange={() => toggleSelect(order.id)}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <p className="font-mono text-sm font-semibold text-brand-primary">#{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{order.items?.length ?? 0} articles</p>
                      </td>
                      <td className="px-2 py-3 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('fr-TN')}
                      </td>
                      <td className="px-2 py-3">
                        <p className="text-sm font-medium text-gray-800">{order.user?.name ?? order.shipFullName}</p>
                      </td>
                      <td className="px-2 py-3 font-semibold text-brand-primary whitespace-nowrap">
                        {order.totalAmount.toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND
                      </td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>
                          <s.icon size={12} />
                          {s.label}
                        </span>
                      </td>
                      <td className="py-3 pl-2 pr-4">
                        <div className="flex gap-1">
                          {order.status === 'PENDING' && (
                            <button onClick={() => updateMutation.mutate({ id: order.id, status: 'CONFIRMED' })} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600" title="Confirmer">
                              <CheckCircle2 size={15} />
                            </button>
                          )}
                          {order.status === 'CONFIRMED' && (
                            <button onClick={() => updateMutation.mutate({ id: order.id, status: 'SHIPPED' })} className="rounded-lg p-1.5 text-gray-400 hover:bg-purple-50 hover:text-purple-600" title="Expédier">
                              <Truck size={15} />
                            </button>
                          )}
                          <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Détails">
                            <Edit2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

