"use client";

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { useAuthStore } from '@/lib/store/auth.store'
import {
  TrendingUp, Users, ShoppingBag, Package,
  AlertTriangle, ArrowRight, DollarSign, RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
    enabled: true,
  })

  const stats = dashboardData?.data

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>)}
        </div>
      </div>
    )
  }

  const kpis = [
    { label: "Chiffre d'affaires", value: `${(stats?.totalRevenue ?? 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND`, icon: DollarSign, trend: '+12.5%', isPositive: true },
    { label: 'Commandes totales', value: stats?.totalOrders ?? 0, icon: ShoppingBag, trend: '+5.2%', isPositive: true },
    { label: 'Clients', value: stats?.totalUsers ?? 0, icon: Users, trend: '+18.1%', isPositive: true },
    { label: 'Produits actifs', value: stats?.totalProducts ?? 0, icon: Package, trend: '0%', isPositive: true },
  ]

  const recentOrders = stats?.recentOrders ?? []

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Tableau de bord</h1>
          <p className="text-sm text-gray-500">Bienvenue dans votre espace d'administration.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50 transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/10">
                <kpi.icon size={24} className="text-brand-accent" />
              </div>
              <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                kpi.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {kpi.isPositive ? <TrendingUp size={12} /> : null}
                {kpi.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
              <p className="mt-1 text-2xl font-bold text-brand-primary">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-50 p-5">
            <h2 className="font-semibold text-brand-primary">Commandes récentes</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-medium text-brand-accent hover:underline">
              Voir tout <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Commande</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Montant</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-brand-primary">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString('fr-TN')}</td>
                    <td className="px-5 py-4 font-semibold">{order.totalAmount.toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700'
                        : order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">Aucune commande</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts / Action required */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={20} />
              <h2 className="font-semibold">Rupture de stock</h2>
            </div>
            <p className="mt-2 text-sm text-red-700">12 produits nécessitent votre attention immédiate.</p>
            <Link href="/admin/catalog/inventory" className="mt-3 inline-block text-sm font-semibold text-red-600 hover:underline">
              Gérer l'inventaire →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

