"use client";

import { useAuthStore } from '@/lib/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api/orders'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import {
  Package, Heart, MapPin, Star, ArrowRight, ShoppingBag, Clock,
  CheckCircle2, Truck, XCircle, Car, ArrowUpRight, CalendarDays,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

const STATUS_CONFIG = {
  PENDING: { labelKey: 'pending', icon: Clock, cls: 'bg-amber-50 text-amber-700' },
  CONFIRMED: { labelKey: 'confirmed', icon: CheckCircle2, cls: 'bg-blue-50 text-blue-700' },
  SHIPPED: { labelKey: 'shipped', icon: Truck, cls: 'bg-violet-50 text-violet-700' },
  DELIVERED: { labelKey: 'delivered', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { labelKey: 'cancelled', icon: XCircle, cls: 'bg-rose-50 text-rose-700' },
}

const QUICK_LINKS = [
  { href: '/compte/commandes', icon: Package, labelKey: 'myOrders', descKey: 'myOrdersDesc' },
  { href: '/compte/wishlist', icon: Heart, labelKey: 'myWishlist', descKey: 'myWishlistDesc' },
  { href: '/compte/voitures', icon: Car, labelKey: 'myCars', descKey: 'myCarsDesc' },
  { href: '/compte/adresses', icon: MapPin, labelKey: 'myAddresses', descKey: 'myAddressesDesc' },
  { href: '/compte/profil', icon: Star, labelKey: 'myProfile', descKey: 'myProfileDesc' },
]

export default function CompteDashboardPage() {
  const t = useTranslations('Account')
  const locale = useLocale()
  const user = useAuthStore((state) => state.user)
  const { data, isLoading } = useQuery<any>({
    queryKey: ['my-orders-preview'],
    queryFn: () => ordersApi.getAll(),
    enabled: true,
  })
  const orders = (Array.isArray(data) ? data : data?.data ?? []).slice(0, 3)

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(115deg,#16254c_0%,#1f356b_72%,#2d477f_100%)] px-6 py-7 text-white shadow-[0_18px_45px_rgba(22,37,76,0.2)] sm:px-8">
        <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full border-[28px] border-brand-accent/20" />
        <div className="absolute bottom-0 right-20 h-20 w-20 translate-y-10 rounded-full bg-brand-accent/15" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-accent-light">{t('mySpace')}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {t('hello', { name: user?.firstName ?? t('dearCustomer') })}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">{t('welcome')}</p>
          </div>
          <Link href="/compte/profil" className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-primary transition-transform hover:-translate-y-0.5 hover:shadow-lg sm:self-auto">
            {t('myProfile')} <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <section>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-accent">{t('shortcuts')}</p>
        <h2 className="mt-1 text-xl font-bold text-brand-primary">{t('manageAccount')}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="group relative min-h-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-[0_14px_26px_rgba(22,37,76,0.1)]">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-brand-primary/[0.035] transition-colors group-hover:bg-brand-accent/20" />
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/5 text-brand-primary transition-all group-hover:bg-brand-primary group-hover:text-white">
                <link.icon size={18} />
              </div>
              <p className="mt-5 text-sm font-bold text-brand-primary">{t(link.labelKey)}</p>
              <p className="mt-1 text-xs leading-5 text-gray-500">{t(link.descKey)}</p>
              <ArrowRight size={15} className="absolute bottom-4 right-4 text-brand-primary/40 transition-all group-hover:translate-x-1 group-hover:text-brand-primary" />
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-accent">{t('tracking')}</p>
            <h2 className="mt-1 text-xl font-bold text-brand-primary">{t('recentOrders')}</h2>
          </div>
          <Link href="/compte/commandes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary/70 transition-colors hover:text-brand-primary">
            {t('viewAll')} <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {[1, 2, 3].map((index) => <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="m-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-12 text-center sm:m-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/5 text-brand-primary"><ShoppingBag size={22} /></div>
            <p className="mt-4 text-sm font-bold text-brand-primary">{t('noOrders')}</p>
            <Link href="/catalogue" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary-light">
              {t('discoverCatalog')}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order: { id: string; createdAt: string; status: string; totalAmount: number; items: { product?: { images?: { url: string }[] } }[] }) => {
              const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
              const orderDate = new Date(order.createdAt)
              const imageUrl = order.items?.[0]?.product?.images?.[0]?.url
              return (
                <div key={order.id} className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:px-6">
                  {imageUrl ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white">
                      <Image src={imageUrl} alt="" fill sizes="56px" className="object-contain p-1" />
                    </div>
                  ) : (
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${status.cls}`}><status.icon size={18} /></div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-mono text-xs font-semibold tracking-wide text-brand-primary/60">#{order.id.slice(-8).toUpperCase()}</p>
                      {!Number.isNaN(orderDate.getTime()) && <span className="inline-flex items-center gap-1 text-xs text-gray-400"><CalendarDays size={12} />{orderDate.toLocaleDateString(locale === 'fr' ? 'fr-TN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    </div>
                    <p className="mt-1 text-sm font-bold text-brand-primary">{order.items?.length ?? 0} {t('items')} · {(order.totalAmount ?? 0).toLocaleString(locale === 'fr' ? 'fr-TN' : 'en-US', { minimumFractionDigits: 2 })} TND</p>
                  </div>
                  <span className={`self-start rounded-full px-3 py-1.5 text-xs font-bold sm:self-auto ${status.cls}`}>{t(status.labelKey)}</span>
                  <Link href={`/compte/commandes/${order.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-gray-400 transition-colors hover:text-brand-primary sm:ml-1">
                    {t('details')} <ArrowRight size={12} />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
