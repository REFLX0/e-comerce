"use client";

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  PackageCheck,
  Search,
  Settings2,
  Truck,
} from 'lucide-react'

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

const STATUS = {
  CONFIRMED: { label: 'A preparer', className: 'bg-blue-100 text-blue-700', icon: PackageCheck },
  SHIPPED: { label: 'En livraison', className: 'bg-purple-100 text-purple-700', icon: Truck },
  DELIVERED: { label: 'Livree', className: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CANCELLED: { label: 'Annulee', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
}

export default function AdminShippingPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | ShippingOrder['status']>('ALL')

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-shipping-orders'],
    queryFn: () => adminApi.getOrders({ page: 1 }),
  })

  const r = (data as any)?.data ?? data ?? {}
  const orders: ShippingOrder[] = useMemo(() => Array.isArray(r) ? r : r.data ?? [], [r])

  const shippingOrders = useMemo(
    () => orders.filter((order) => ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status)),
    [orders]
  )

  const filtered = shippingOrders.filter((order) => {
    const text = `${order.id} ${order.shipFullName ?? ''} ${order.shipWilaya ?? ''} ${order.shipCity ?? ''}`.toLowerCase()
    const matchesSearch = !search || text.includes(search.toLowerCase())
    const matchesStatus = status === 'ALL' || order.status === status
    return matchesSearch && matchesStatus
  })

  const summary = {
    ready: shippingOrders.filter((order) => order.status === 'CONFIRMED').length,
    shipped: shippingOrders.filter((order) => order.status === 'SHIPPED').length,
    delivered: shippingOrders.filter((order) => order.status === 'DELIVERED').length,
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Livraison</h1>
          <p className="text-sm text-gray-500">Suivi des expeditions, zones et tarifs de livraison.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Exporter
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors">
            <Settings2 size={16} /> Tarifs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'A preparer', value: summary.ready, icon: PackageCheck, className: 'bg-blue-50 text-blue-700' },
          { label: 'En livraison', value: summary.shipped, icon: Truck, className: 'bg-purple-50 text-purple-700' },
          { label: 'Livrees', value: summary.delivered, icon: CheckCircle2, className: 'bg-green-50 text-green-700' },
        ].map((card) => (
          <div key={card.label} className={`rounded-2xl p-5 ${card.className}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{card.label}</p>
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
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Commande, client, ville..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-brand-accent transition-all"
              />
            </div>
            <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
              {(['ALL', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    status === value ? 'bg-brand-primary text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {value === 'ALL' ? 'Toutes' : STATUS[value].label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">Commande</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">Destination</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">Articles</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className="border-t border-gray-50">
                      <td colSpan={4} className="px-4 py-3">
                        <div className="h-5 animate-pulse rounded bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-14 text-center text-sm text-gray-400">
                      Aucune expedition trouvee
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => {
                    const current = STATUS[order.status]
                    const Icon = current.icon
                    return (
                      <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-mono text-sm font-semibold text-brand-primary">#{order.id.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-TN')}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800">{order.shipFullName ?? 'Client'}</p>
                          <p className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin size={12} /> {[order.shipCity, order.shipWilaya].filter(Boolean).join(', ') || 'Adresse non definie'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{order.items?.length ?? 0}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${current.className}`}>
                            <Icon size={12} />
                            {current.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-brand-primary">Zones actives</h2>
            <div className="mt-4 space-y-3">
              {[
                { zone: 'Grand Tunis', price: '7.00 TND', eta: '24-48h' },
                { zone: 'Nord et Sahel', price: '8.00 TND', eta: '48h' },
                { zone: 'Sud', price: '10.00 TND', eta: '48-72h' },
              ].map((zone) => (
                <div key={zone.zone} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-primary">{zone.zone}</p>
                    <p className="text-xs text-gray-400">{zone.eta}</p>
                  </div>
                  <span className="text-sm font-bold text-brand-primary">{zone.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-blue-700">
            <div className="flex items-center gap-3">
              <Truck size={20} />
              <h2 className="font-bold">Livraison gratuite</h2>
            </div>
            <p className="mt-2 text-sm text-blue-600">Seuil configure: 150.00 TND pour les commandes eligibles.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
