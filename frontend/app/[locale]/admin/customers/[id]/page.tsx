"use client";

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { useParams } from 'next/navigation'
import { ArrowLeft, Mail, Phone, ShoppingBag, Calendar, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export default function CustomerDetailPage() {
  const t = useTranslations('Admin')
  const locale = useLocale()
  const params = useParams()
  const id = params.id as string
  const localizedHref = (href: string) => `/${locale}${href}`

  const { data: user, isLoading } = useQuery<any>({
    queryKey: ['admin-user', id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-5">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 sm:p-6 text-center py-16">
        <h2 className="text-xl font-bold text-brand-primary mb-2">{t('customerNotFound')}</h2>
        <Link href={localizedHref('/admin/customers')} className="text-sm text-brand-accent hover:underline">{t('backToList')}</Link>
      </div>
    )
  }

  const S = { PENDING: 'statusPending', CONFIRMED: 'statusConfirmed', SHIPPED: 'statusShipped', DELIVERED: 'statusDelivered', CANCELLED: 'statusCancelled', RETURNED: 'statusReturned' } as any

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href={localizedHref('/admin/customers')} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-brand-primary">{user.name ?? t('userFallback')}</h1>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-3">
          <Mail size={18} className="text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">{t('emailLabel')}</p>
            <p className="text-sm font-semibold text-brand-primary">{user.email}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-3">
          <Phone size={18} className="text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">{t('phoneLabel')}</p>
            <p className="text-sm font-semibold text-brand-primary">{user.phone ?? '—'}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-3">
          <ShoppingBag size={18} className="text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">{t('ordersLabel')}</p>
            <p className="text-sm font-semibold text-brand-primary">{user.ordersCount ?? 0}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-3">
          <Calendar size={18} className="text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">{t('registeredOnColumn')}</p>
            <p className="text-sm font-semibold text-brand-primary">{user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale) : '—'}</p>
          </div>
        </div>
      </div>

      {/* LTV + Role */}
      <div className="flex flex-wrap gap-4">
        <div className="rounded-xl bg-brand-accent/10 px-4 py-2 text-sm">
          <span className="text-gray-500">{t('totalSpentColon')}</span>
          <span className="font-bold text-brand-primary">{(user.ltv ?? 0).toLocaleString(locale, { minimumFractionDigits: 2 })} TND</span>
        </div>
        <div className="rounded-xl bg-gray-100 px-4 py-2 text-sm flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-gray-400" />
          <span className="font-semibold text-gray-700">{user.role}</span>
        </div>
      </div>

      {/* Order history */}
      <div>
        <h2 className="text-lg font-bold text-brand-primary mb-4">{t('orderHistory')}</h2>
        {(user.orders ?? []).length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
            {t('noOrders')}
          </div>
        ) : (
          <div className="space-y-3">
            {user.orders.map((order: any) => (
              <div key={order.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-xs text-gray-400">{order.id ? `#${order.id.slice(-8).toUpperCase()}` : 'N/A'}</p>
                    <p className="text-sm font-semibold text-brand-primary">
                      {(order.totalAmount ?? 0).toLocaleString(locale, { minimumFractionDigits: 2 })} TND
                    </p>
                    <p className="text-xs text-gray-400">
                      {t('articleCount', { count: order.items?.length ?? 0 })} · {order.createdAt ? new Date(order.createdAt).toLocaleDateString(locale) : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700'
                      : order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700'
                      : order.status === 'CANCELLED' ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {S[order.status] ? t(S[order.status]) : order.status}
                    </span>
                    <Link href={localizedHref(`/admin/orders`)} className="text-xs text-brand-accent hover:underline">
                      {t('viewLabel')}
                    </Link>
                  </div>
                </div>
                {order.items?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-50 pt-3">
                    {order.items.map((item: any) => (
                      <span key={item.id} className="rounded-lg bg-gray-50 px-2 py-1 text-xs text-gray-500">
                        {item.product?.nameFr ?? t('productFallback')} × {item.quantity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery addresses from orders */}
      {(user.orders ?? []).some((o: any) => o.shipFullName) && (
        <div>
          <h2 className="text-lg font-bold text-brand-primary mb-4">{t('deliveryAddresses')}</h2>
          <div className="space-y-3">
            {(Array.from(new Set((user.orders ?? []).filter((o: any) => o.shipFullName).map((o: any) => `${o.shipFullName}|${o.shipPhone}|${o.shipWilaya}|${o.shipCity}`))) as string[]).map((key: string) => {
              const [name, phone, wilaya, city] = key.split('|')
              return (
                <div key={key} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-brand-primary">{name}</p>
                  <p className="text-xs text-gray-400">{city}, {wilaya}</p>
                  <p className="text-xs text-gray-400">{phone}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
