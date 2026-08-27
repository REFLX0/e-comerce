"use client";

import { useAuthStore } from '@/lib/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api/orders'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import {
  Package, Heart, MapPin, Star, ArrowRight, ShoppingBag, Clock,
  CheckCircle2, Truck, XCircle, Car, ArrowUpRight, CalendarDays,
  Sparkles, ShieldCheck
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

const STATUS_CONFIG = {
  PENDING: { labelKey: 'pending', icon: Clock, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { labelKey: 'confirmed', icon: CheckCircle2, cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  SHIPPED: { labelKey: 'shipped', icon: Truck, cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  DELIVERED: { labelKey: 'delivered', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { labelKey: 'cancelled', icon: XCircle, cls: 'bg-rose-50 text-rose-700 border-rose-200' },
}

const QUICK_LINKS = [
  { href: '/compte/commandes', icon: Package, labelKey: 'myOrders', descKey: 'myOrdersDesc' },
  { href: '/compte/voitures', icon: Car, labelKey: 'myCars', descKey: 'myCarsDesc' },
  { href: '/compte/wishlist', icon: Heart, labelKey: 'myWishlist', descKey: 'myWishlistDesc' },
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
      {/* Welcome Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16254c] via-[#1f356b] to-[#16254c] px-6 py-8 text-white shadow-xl shadow-slate-900/5 sm:px-8 border border-white/10">
        <div className="absolute -right-8 -top-12 h-44 w-44 rounded-full border-[20px] border-[#D4A76A]/15 pointer-events-none" />
        <div className="absolute bottom-0 right-16 h-24 w-24 rounded-full bg-[#D4A76A]/10 blur-xl pointer-events-none" />
        
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#D4A76A] backdrop-blur-md">
              <Sparkles size={12} />
              <span>{t('mySpace') || 'Espace Client Privilège'}</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t('hello', { name: user?.firstName ?? t('dearCustomer') })}
            </h1>
            <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-white/75 leading-relaxed">
              {t('welcome') || 'Bienvenue dans votre tableau de bord. Suivez vos commandes, vos véhicules et vos préférences en temps réel.'}
            </p>
          </div>
          <Link
            href="/compte/profil"
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-white px-5 py-3 text-xs font-bold text-[#16254c] shadow-lg shadow-black/10 transition-all hover:scale-[1.02] hover:bg-slate-50 active:scale-[0.98] sm:self-auto"
          >
            <span>{t('myProfile')}</span>
            <ArrowUpRight size={14} className="text-[#D4A76A]" />
          </Link>
        </div>
      </section>

      {/* Quick Shortcuts */}
      <section>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4A76A]" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('shortcuts')}</p>
        </div>
        <h2 className="mt-0.5 text-lg sm:text-xl font-black text-[#16254c] tracking-tight">{t('manageAccount')}</h2>
        
        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_15px_30px_-10px_rgba(22,37,76,0.08)]"
            >
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#16254c]/[0.02] transition-colors group-hover:bg-[#D4A76A]/10 pointer-events-none" />
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-[#16254c] transition-all group-hover:bg-[#16254c] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#16254c]/20">
                  <link.icon size={19} strokeWidth={2} />
                </div>
                <p className="mt-4 text-sm font-black text-[#16254c] tracking-tight">{t(link.labelKey)}</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{t(link.descKey)}</p>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#16254c]/10 group-hover:text-[#16254c] transition-colors">
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Orders Section */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 bg-slate-50/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4A76A]" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('tracking')}</p>
            </div>
            <h2 className="mt-0.5 text-lg sm:text-xl font-black text-[#16254c] tracking-tight">{t('recentOrders')}</h2>
          </div>
          <Link
            href="/compte/commandes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16254c] hover:text-[#1f3469] transition-colors"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight size={13} className="text-[#D4A76A]" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="m-5 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 sm:p-12 text-center sm:m-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 shadow-inner">
              <ShoppingBag size={24} />
            </div>
            <p className="mt-4 text-sm font-black text-[#16254c]">{t('noOrders') || 'Aucune commande récente'}</p>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">Découvrez notre vaste catalogue de plus de 46 000 pièces certifiées.</p>
            <Link
              href="/catalogue"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#16254c] px-5 py-3 text-xs font-bold text-white shadow-md shadow-[#16254c]/10 hover:bg-[#1f3469] transition-all"
            >
              <span>{t('discoverCatalog') || 'Explorer le catalogue'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order: any) => {
              const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
              const orderDate = new Date(order.createdAt)
              const imageUrl = order.items?.[0]?.product?.images?.[0]?.url
              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 p-5 sm:p-6 transition-colors hover:bg-slate-50/60 sm:flex-row sm:items-center"
                >
                  {imageUrl ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm">
                      <Image src={imageUrl} alt="" fill sizes="56px" className="object-contain" />
                    </div>
                  ) : (
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${status.cls}`}>
                      <status.icon size={20} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-mono text-xs font-bold tracking-wide text-[#16254c]">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                      {!Number.isNaN(orderDate.getTime()) && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <CalendarDays size={12} />
                          {orderDate.toLocaleDateString(locale === 'fr' ? 'fr-TN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-black text-slate-900">
                      {order.items?.length ?? 0} {t('items')} · {(order.totalAmount ?? 0).toLocaleString(locale === 'fr' ? 'fr-TN' : 'en-US', { minimumFractionDigits: 2 })} TND
                    </p>
                  </div>
                  <span className={`self-start rounded-full border px-3 py-1 text-xs font-bold sm:self-auto ${status.cls}`}>
                    {t(status.labelKey)}
                  </span>
                  <Link
                    href={`/compte/commandes/${order.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#16254c] transition-colors sm:ml-1"
                  >
                    <span>{t('details')}</span>
                    <ArrowRight size={12} />
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
