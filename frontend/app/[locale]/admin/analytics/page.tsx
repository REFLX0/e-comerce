"use client";

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { useLocale, useTranslations } from 'next-intl'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react'

type RecentOrder = {
  id: string
  status: string
  totalAmount?: number
  createdAt: string
  items?: unknown[]
}

type DashboardStats = {
  totalOrders?: number
  totalRevenue?: number
  revenueLivraison?: number
  revenueHanout?: number
  totalUsers?: number
  totalProducts?: number
  recentOrders?: RecentOrder[]
}

function money(value: number, locale: string) {
  return `${value.toLocaleString(locale, { minimumFractionDigits: 2 })} TND`
}

export default function AdminAnalyticsPage() {
  const locale = useLocale()
  const t = useTranslations('Admin')
  const { data, isLoading, isError, refetch, isFetching } = useQuery<DashboardStats>({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getDashboard() as Promise<DashboardStats>,
  })

  const stats = ((data as { data?: DashboardStats } | undefined)?.data ?? data ?? {}) as DashboardStats
  const recentOrders: RecentOrder[] = useMemo(() => stats.recentOrders ?? [], [stats.recentOrders])

  const statusRows = useMemo(() => {
    const counts = recentOrders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1
      return acc
    }, {})
    const total = Math.max(recentOrders.length, 1)
    return Object.entries(counts).map(([status, count]) => ({
      status, count, pct: Math.round((count / total) * 100),
    }))
  }, [recentOrders])

  const dailyRevenue = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      const key = date.toISOString().slice(0, 10)
      return { key, label: date.toLocaleDateString(locale, { weekday: 'short' }), value: 0 }
    })
    recentOrders.forEach((order) => {
      const key = new Date(order.createdAt).toISOString().slice(0, 10)
      const day = days.find((item) => item.key === key)
      if (day) day.value += order.totalAmount ?? 0
    })
    const max = Math.max(...days.map((day) => day.value), 1)
    return days.map((day) => ({ ...day, pct: Math.max(6, Math.round((day.value / max) * 100)) }))
  }, [recentOrders, locale])

  const avgOrderValue = (stats.totalRevenue ?? 0) / Math.max(stats.totalOrders ?? 0, 1)

  const trends = useMemo(() => {
    const orders = recentOrders
    const half = Math.ceil(orders.length / 2)
    const firstHalf = orders.slice(0, half)
    const secondHalf = orders.slice(half)
    const sum1 = firstHalf.reduce((s, o) => s + (o.totalAmount || 0), 0)
    const sum2 = secondHalf.reduce((s, o) => s + (o.totalAmount || 0), 0)
    const revTrend = sum2 > 0 && sum1 > 0 ? ((sum2 / sum1) - 1) * 100 : 0
    const count1 = firstHalf.length
    const count2 = secondHalf.length
    const orderTrend = count1 > 0 ? ((count2 - count1) / count1) * 100 : 0
    return { revenue: revTrend, orders: orderTrend }
  }, [recentOrders])

  const trendStr = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
  const isGood = (v: number) => v >= 0

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-700">{t('analyticsLoadError')}</p>
          <button onClick={() => refetch()} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">{t('retry')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">{t('analyticsTitle')}</h1>
          <p className="text-sm text-gray-500">{t('analyticsSubtitle')}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          {t('refresh')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { labelKey: 'globalRevenue', value: money(stats.totalRevenue ?? 0, locale), icon: DollarSign, trend: trendStr(trends.revenue), good: isGood(trends.revenue) },
          { labelKey: 'deliveryRevenue', value: money(stats.revenueLivraison ?? 0, locale), icon: Truck, trend: '-', good: true },
          { labelKey: 'storeRevenue', value: money(stats.revenueHanout ?? 0, locale), icon: Package, trend: '-', good: true },
          { labelKey: 'totalOrders', value: stats.totalOrders ?? 0, icon: ShoppingCart, trend: trendStr(trends.orders), good: isGood(trends.orders) },
          { labelKey: 'customersLabel', value: stats.totalUsers ?? 0, icon: Users, trend: '+0%', good: true },
          { labelKey: 'avgBasket', value: money(avgOrderValue, locale), icon: Activity, trend: '-', good: true },
        ].map((kpi) => (
          <div key={kpi.labelKey} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <kpi.icon size={21} />
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                kpi.good ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {kpi.good ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.trend}
              </span>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-400">{t(kpi.labelKey)}</p>
            <p className="mt-1 text-2xl font-black text-brand-primary">{isLoading ? '...' : kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <BarChart3 size={18} />
            </div>
            <h2 className="font-bold text-brand-primary">{t('revenueLast7Days')}</h2>
          </div>

          <div className="flex h-72 items-end gap-3">
            {dailyRevenue.map((day) => (
              <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-56 w-full items-end rounded-xl bg-gray-50 px-2">
                  <div
                    className="w-full rounded-t-lg bg-blue-500 transition-all"
                    style={{ height: `${day.pct}%` }}
                    title={money(day.value, locale)}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-400">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Activity size={18} />
              </div>
              <h2 className="font-bold text-brand-primary">{t('orderStatuses')}</h2>
            </div>
            <div className="space-y-3">
              {statusRows.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">{t('noRecentOrders')}</p>
              ) : (
                statusRows.map((row) => (
                  <div key={row.status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-600">{row.status}</span>
                      <span className="font-bold text-brand-primary">{row.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-brand-primary" style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-green-700">
            <p className="text-sm font-medium text-green-600">{t('activeProducts')}</p>
            <p className="mt-1 text-3xl font-black">{stats.totalProducts ?? 0}</p>
            <p className="mt-2 text-sm text-green-600">{t('catalogPublishedDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
