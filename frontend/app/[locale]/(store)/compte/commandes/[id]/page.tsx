'use client'

import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api/orders'
import { useAuthStore } from '@/lib/store/auth.store'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { ArrowLeft, Package, Truck, CheckCircle, CreditCard, MapPin } from 'lucide-react'
import { Link, useRouter } from '@/i18n/routing'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

function OrderItemThumbnail({
  src,
  alt,
}: {
  src?: string | null
  alt: string
}) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
        <Package size={28} className="text-gray-300" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="80px"
      className="object-contain p-1.5 transition-transform duration-200 hover:scale-105"
      onError={() => setError(true)}
    />
  )
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('Account')
  const id = params.id as string
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isHydrated, router])

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery<any>({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id),
    enabled: true,
  })

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="border-brand-surface-dark border-t-brand-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4"></div>
        <p className="font-medium text-gray-500">{t('loadingOrderDetails')}</p>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="border-brand-surface-dark rounded-2xl border bg-white py-12 text-center">
        <h2 className="text-brand-primary mb-2 text-2xl font-bold">{t('orderNotFound')}</h2>
        <p className="mb-6 text-gray-500">
          {t('orderLoadError')}
        </p>
        <Link href="/compte/commandes" className="btn-primary inline-flex">
          {t('backToOrders')}
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/compte/commandes"
          className="hover:text-brand-primary hover:bg-brand-surface -ml-2 rounded-full p-2 text-gray-400 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-brand-primary text-2xl font-bold">{t('order')} #{order.id.slice(-8).toUpperCase()}</h1>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-sm font-bold ${
            order.status === 'DELIVERED'
              ? 'bg-green-100 text-green-700'
              : order.status === 'SHIPPED'
                ? 'bg-blue-100 text-blue-700'
                : order.status === 'CANCELLED'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {order.status === 'PENDING' && t('pending')}
          {order.status === 'PROCESSING' && t('processing')}
          {order.status === 'CONFIRMED' && t('confirmed')}
          {order.status === 'SHIPPED' && t('shipped')}
          {order.status === 'DELIVERED' && t('delivered')}
          {order.status === 'CANCELLED' && t('cancelled')}
        </span>
      </div>

      <p className="mb-8 text-gray-500">{t('placedOn', { date: formatDate(order.createdAt) })}</p>

      {order.timeline && order.timeline.length > 0 && (
        <div className="border-brand-surface-dark mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-brand-primary mb-6 font-bold">{t('orderTracking')}</h3>
          <div className="relative">
            <div className="absolute top-4 bottom-4 left-6 w-0.5 bg-gray-100"></div>
            <div className="space-y-8">
              {order.timeline.map((event: any, index: number) => (
                <div key={index} className="relative flex items-start gap-4">
                  <div
                    className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      event.done
                        ? 'bg-green-100 text-green-600'
                        : event.current
                          ? 'bg-brand-primary ring-brand-primary/20 text-white ring-4'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {event.status === 'delivered' ? (
                      <CheckCircle size={20} />
                    ) : event.status === 'shipped' ? (
                      <Truck size={20} />
                    ) : (
                      <Package size={20} />
                    )}
                  </div>
                  <div className="pt-3">
                    <h4
                      className={`font-semibold ${event.done || event.current ? 'text-brand-primary' : 'text-gray-400'}`}
                    >
                      {event.label}
                    </h4>
                    {event.date && (
                      <p className="mt-1 text-sm text-gray-500">{formatDate(event.date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="border-brand-surface-dark rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-brand-primary mb-6 border-b border-gray-100 pb-4 font-bold">
              {t('orderedItems')}
            </h3>
            <div className="space-y-6">
              {order.items.map((item: any) => {
                const rawImg = item.variant?.imageUrl || item.product?.images?.[0]
                const imgSrc = typeof rawImg === 'string' ? rawImg : rawImg?.url || null

                return (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="bg-brand-surface relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 shadow-2xs">
                      <OrderItemThumbnail src={imgSrc} alt={item.product?.nameFr ?? t('article')} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {item.product?.slug ? (
                        <Link href={`/produit/${item.product.slug}`} className="hover:underline">
                          <h4 className="text-brand-primary line-clamp-1 font-bold">
                            {item.product?.nameFr ?? t('article')}
                          </h4>
                        </Link>
                      ) : (
                        <h4 className="text-brand-primary line-clamp-1 font-bold">
                          {item.product?.nameFr ?? t('article')}
                        </h4>
                      )}
                      <p className="mt-1 text-sm text-gray-500">{t('volume')}: {item.variant?.volume ?? '-'}</p>
                      <p className="mt-1 text-sm text-gray-500">{t('quantityLabel')}: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-brand-primary font-bold">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-brand-surface border-brand-surface-dark rounded-2xl border p-6 shadow-sm">
            <h3 className="text-brand-primary border-brand-surface-dark mb-4 border-b pb-4 font-bold">
              {t('financialSummary')}
            </h3>
            <div className="mb-6 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('total')}</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="border-brand-surface-dark rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start gap-3">
              <MapPin className="mt-1 text-gray-400" size={20} />
              <div>
                <h3 className="text-brand-primary mb-1 font-bold">{t('deliveryAddress')}</h3>
                <p className="text-sm text-gray-600">{order.shipFullName}</p>
                <p className="text-sm text-gray-600">
                  {order.shipCity}, {order.shipWilaya}
                </p>
                <p className="mt-2 text-sm text-gray-600">{order.shipPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-gray-100 pt-6">
              <CreditCard className="mt-1 text-gray-400" size={20} />
              <div>
                <h3 className="text-brand-primary mb-1 font-bold">{t('paymentMethod')}</h3>
                <p className="text-sm text-gray-600">{t('cod')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
