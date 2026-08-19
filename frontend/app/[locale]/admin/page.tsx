"use client";

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { useAuthStore } from '@/lib/store/auth.store'
import {
  TrendingUp, TrendingDown, Users, ShoppingBag, Package,
  AlertTriangle, ArrowRight, DollarSign, RefreshCw,
  ShoppingCart, Star, BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export default function AdminDashboard() {
  const t = useTranslations('Admin')
  const user = useAuthStore((s) => s.user)
  const locale = useLocale()
  const localizedHref = (href: string) => `/${locale}${href}`

  const STATUS_LABELS: Record<string, { labelKey: string; cls: string }> = {
    PENDING:   { labelKey: 'statusPending', cls: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { labelKey: 'statusConfirmed',  cls: 'bg-blue-100 text-blue-800' },
    PROCESSING:{ labelKey: 'statusProcessing',   cls: 'bg-indigo-100 text-indigo-800' },
    SHIPPED:   { labelKey: 'statusShipped',   cls: 'bg-purple-100 text-purple-800' },
    DELIVERED: { labelKey: 'statusDelivered', cls: 'bg-green-100 text-green-800' },
    CANCELLED: { labelKey: 'statusCancelled',    cls: 'bg-red-100 text-red-800' },
  }

  const { data: dashboardData, isLoading, isError, refetch } = useQuery<any>({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
    enabled: true,
  })

  const stats = (dashboardData as any)?.data ?? dashboardData
  const recentOrders = stats?.recentOrders ?? []

  const trends = useMemo(() => {
    const orders = recentOrders
    const half = Math.ceil(orders.length / 2)
    const firstHalf = orders.slice(0, half)
    const secondHalf = orders.slice(half)
    const sum1 = firstHalf.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0)
    const sum2 = secondHalf.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0)
    const revTrend = sum2 > 0 && sum1 > 0 ? ((sum2 / sum1) - 1) * 100 : 0
    const count1 = firstHalf.length
    const count2 = secondHalf.length
    const orderTrend = count1 > 0 ? ((count2 - count1) / count1) * 100 : 0
    return { revenue: revTrend, orders: orderTrend }
  }, [recentOrders])

  const trendStr = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-red-400" />
          <p className="text-sm font-semibold text-red-700">{t('dashboardLoadError')}</p>
          <button onClick={() => refetch()} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">{t('retry')}</button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 animate-pulse">
        <div className="h-8 w-56 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-80 bg-gray-100 rounded-2xl" />
          <div className="h-80 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    )
  }

  const kpis = [
    {
      labelKey: 'revenue',
      value: `${(stats?.totalRevenue ?? 0).toLocaleString(locale, { minimumFractionDigits: 2 })} TND`,
      icon: DollarSign,
      trend: trendStr(trends.revenue),
      isPositive: trends.revenue >= 0,
      bg: 'bg-gradient-to-br from-brand-primary to-blue-900',
      iconBg: 'bg-blue-500/20',
      textColor: 'text-white',
      subColor: 'text-white/60',
    },
    {
      labelKey: 'orders',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      trend: trendStr(trends.orders),
      isPositive: trends.orders >= 0,
      bg: 'bg-gradient-to-br from-violet-600 to-purple-800',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
      subColor: 'text-white/60',
    },
    {
      labelKey: 'customers',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      trend: '+0%',
      isPositive: true,
      bg: 'bg-white',
      iconBg: 'bg-blue-500/10',
      textColor: 'text-brand-primary',
      subColor: 'text-gray-400',
    },
    {
      labelKey: 'activeProducts',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      trend: '0%',
      isPositive: true,
      bg: 'bg-white',
      iconBg: 'bg-green-50',
      textColor: 'text-brand-primary',
      subColor: 'text-gray-400',
    },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">
            {t('greeting', { name: user?.firstName ?? 'Admin' })} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('dashboardSubtitle')}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw size={15} />
          {t('refresh')}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.labelKey} className={`rounded-2xl border border-gray-100 ${kpi.bg} p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                <kpi.icon size={22} className={kpi.textColor} />
              </div>
              <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                kpi.isPositive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {kpi.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {kpi.trend}
              </span>
            </div>
            <p className={`text-sm font-medium ${kpi.subColor}`}>{t(kpi.labelKey)}</p>
            <p className={`mt-1 text-2xl font-black ${kpi.textColor} leading-tight`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10">
                <ShoppingCart size={18} className="text-brand-primary" />
              </div>
              <h2 className="font-bold text-brand-primary">{t('recentOrdersTitle')}</h2>
            </div>
            <Link href={localizedHref('/admin/orders')} className="flex items-center gap-1 text-sm font-semibold text-brand-primary/60 hover:text-brand-primary">
              {t('viewAll')} <ArrowRight size={15} />
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/60 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-medium">{t('orderColumn')}</th>
                  <th className="px-5 py-3 font-medium">{t('dateColumn')}</th>
                  <th className="px-5 py-3 font-medium">{t('amountColumn')}</th>
                  <th className="px-5 py-3 font-medium">{t('statusColumn')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order: any) => {
                  const statusCfg = STATUS_LABELS[order.status] ?? STATUS_LABELS.PENDING
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs font-medium text-brand-primary">
                          #{order.id ? order.id.slice(-8).toUpperCase() : 'N/A'}
                        </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString(locale) : '—'}
                      </td>
                      <td className="px-5 py-4 font-bold text-brand-primary">
                        {order.totalAmount?.toLocaleString(locale, { minimumFractionDigits: 2 })} TND
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusCfg?.cls || ''}`}>
                          {statusCfg ? t(statusCfg.labelKey) : order.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                      {t('noRecentOrders')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Low Stock Alert */}
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100">
                <AlertTriangle size={18} className="text-orange-600" />
              </div>
              <h2 className="font-bold text-orange-800">{t('lowStock')}</h2>
            </div>
              <p className="text-sm text-orange-700 mb-3">
              {t('stockAttention')}
            </p>
            <Link
              href={localizedHref('/admin/catalog/inventory')}
              className="inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-900 transition-colors"
            >
              {t('manageInventoryLink')} <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-brand-primary mb-4">{t('quickActions')}</h2>
            <div className="flex flex-col gap-2">
              {[
                { href: '/admin/catalog/products', icon: Package, labelKey: 'addProduct', color: 'text-blue-600 bg-blue-50' },
                { href: '/admin/promotions', icon: Star, labelKey: 'createPromotion', color: 'text-yellow-600 bg-yellow-50' },
                { href: '/admin/orders', icon: ShoppingBag, labelKey: 'manageOrders', color: 'text-purple-600 bg-purple-50' },
                { href: '/admin/analytics', icon: BarChart3, labelKey: 'viewStats', color: 'text-green-600 bg-green-50' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={localizedHref(action.href)}
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${action.color}`}>
                    <action.icon size={17} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-brand-primary transition-colors">
                    {t(action.labelKey)}
                  </span>
                  <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-gray-600 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}