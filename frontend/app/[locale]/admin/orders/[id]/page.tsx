"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, downloadOrderPdf } from '@/lib/api/admin'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, Package, Truck, CheckCircle2, Clock,
  XCircle, MapPin, Printer, Loader2, Car, RotateCcw
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { gooeyToast as toast } from 'goey-toast'
import { useLocale, useTranslations } from 'next-intl'

export default function OrderDetailPage() {
  const t = useTranslations('Admin')
  const locale = useLocale()
  const params = useParams()
  const queryClient = useQueryClient()
  const [isDownloading, setIsDownloading] = useState(false)

  const STATUS = {
    PENDING:   { labelKey: 'statusPending',   icon: Clock,        cls: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    CONFIRMED: { labelKey: 'statusConfirmed', icon: CheckCircle2, cls: 'text-blue-700 bg-blue-50 border-blue-200' },
    SHIPPED:   { labelKey: 'statusShipped',   icon: Truck,        cls: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' },
    DELIVERED: { labelKey: 'statusDelivered', icon: CheckCircle2, cls: 'text-green-700 bg-green-50 border-green-200' },
    CANCELLED: { labelKey: 'statusCancelled', icon: XCircle,      cls: 'text-red-700 bg-red-50 border-red-200' },
    RETURNED:  { labelKey: 'statusReturned',  icon: RotateCcw,    cls: 'text-orange-700 bg-orange-50 border-orange-200' },
  }

  const NEXT_STATUS: Record<string, { labelKey: string; status: string; cls: string }[]> = {
    PENDING:   [{ labelKey: 'confirmAction',     status: 'CONFIRMED', cls: 'bg-blue-600 hover:bg-blue-700' }],
    CONFIRMED: [{ labelKey: 'shipAction',        status: 'SHIPPED',   cls: 'bg-brand-primary hover:bg-brand-primary/90' }],
    SHIPPED: [
      { labelKey: 'deliverAction',      status: 'DELIVERED', cls: 'bg-green-600 hover:bg-green-700' },
      { labelKey: 'markReturnedAction', status: 'RETURNED',  cls: 'bg-orange-500 hover:bg-orange-600' },
    ],
    DELIVERED: [
      { labelKey: 'markReturnedAction', status: 'RETURNED', cls: 'bg-orange-500 hover:bg-orange-600' },
    ],
  }

  const handleDownloadPdf = async (orderId: string, docType: 'invoice' | 'delivery_slip' = 'invoice') => {
    try {
      setIsDownloading(true)
      await downloadOrderPdf(orderId, docType)
      toast.success(t('invoiceDownloaded'))
    } catch {
      toast.error(t('invoiceDownloadError'))
    } finally {
      setIsDownloading(false)
    }
  }

  const { data: order, isLoading, isError } = useQuery<any>({
    queryKey: ['admin-order', params.id],
    queryFn: () => adminApi.getOrder(params.id as string),
    enabled: !!params.id,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', params.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success(t('statusUpdated'))
    },
    onError: () => toast.error(t('updateError')),
  })

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center p-6">
      <Loader2 size={28} className="animate-spin text-brand-primary" />
    </div>
  )
  if (isError || !order) return (
    <div className="p-6 text-center text-gray-400">{t('orderNotFound')}</div>
  )

  const s = STATUS[order.status as keyof typeof STATUS] || STATUS.PENDING
  const Icon = s.icon
  const nextActions = NEXT_STATUS[order.status as keyof typeof NEXT_STATUS] || []

  return (
    <div className="p-3 sm:p-6 space-y-4 max-w-5xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3">
        {/* Back + Title row */}
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/orders`}
            className="flex-shrink-0 rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-brand-primary leading-tight">
              {t('orderLabel')}{' '}
              <span className="font-mono">#{(order.id ?? '').slice(-8).toUpperCase() || 'N/A'}</span>
            </h1>
            <p className="text-xs text-gray-400">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString(locale) : '—'}
            </p>
          </div>
        </div>

        {/* Action buttons — full width on mobile, auto width on desktop */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
          <button
            onClick={() => handleDownloadPdf(order.id, 'delivery_slip')}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary transition-all disabled:opacity-50"
          >
            {isDownloading ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
            <span className="truncate">Bon de livraison</span>
          </button>
          <button
            onClick={() => handleDownloadPdf(order.id, 'invoice')}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary transition-all disabled:opacity-50"
          >
            {isDownloading ? <Loader2 size={15} className="animate-spin" /> : <Printer size={15} />}
            <span className="truncate">{t('invoicePdf')}</span>
          </button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* ── LEFT: Articles ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="font-bold text-brand-primary text-sm">{t('orderItems')}</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 sm:p-4">
                  {/* Thumbnail */}
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    {item.product?.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product?.nameFr || ''}
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package size={18} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">
                      {item.product?.nameFr || item.productName || `${t('productColumn')} #${item.productId?.slice(-6) || '?'}`}
                    </p>
                    <p className="mt-0.5 text-[11px] font-mono text-gray-400">
                      {[
                        item.variant?.skuVariant || item.product?.sku,
                        item.variant?.volume,
                      ].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.quantity} × {item.unitPrice?.toFixed(2) || '0.00'} TND
                    </p>
                  </div>

                  {/* Line total */}
                  <span className="shrink-0 text-sm font-bold text-brand-primary">
                    {(item.quantity * (item.unitPrice || 0)).toFixed(2)} TND
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('subtotalColumn')}</span>
                <span className="font-medium">
                  {((order.totalAmount || 0) - (order.shippingCost || 0)).toFixed(2)} TND
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('shippingLabel')}</span>
                <span className="font-medium">{order.shippingCost?.toFixed(2) || '0.00'} TND</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                <span>{t('orderTotal')}</span>
                <span className="text-brand-primary">{order.totalAmount?.toFixed(2)} TND</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Status + Customer + Address ── */}
        <div className="space-y-4">

          {/* Status Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-brand-primary text-sm">{t('statusColumn')}</h2>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold ${s.cls}`}>
              <Icon size={14} /> {t(s.labelKey)}
            </span>
            {nextActions.length > 0 && (
              <div className="mt-3 space-y-2">
                {nextActions.map(action => (
                  <button
                    key={action.status}
                    onClick={() => updateMutation.mutate({ id: order.id, status: action.status })}
                    disabled={updateMutation.isPending}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50 ${action.cls}`}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 size={14} className="mx-auto animate-spin" />
                    ) : t(action.labelKey)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-brand-primary text-sm">{t('customerColumn')}</h2>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-gray-800">
                {order.user?.name || order.shipFullName || '—'}
              </p>
              {order.user?.email && (
                <p className="break-all text-xs text-gray-500">{order.user.email}</p>
              )}
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-brand-primary text-sm">{t('deliveryAddress')}</h2>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-800">{order.shipFullName || t('notSpecified')}</p>
              {order.shipPhone && (
                <p className="text-gray-500">{order.shipPhone}</p>
              )}
              <p className="flex items-start gap-1.5 text-gray-500">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>{[order.shipCity, order.shipWilaya].filter(Boolean).join(', ') || t('addressUndefined')}</span>
              </p>
              {order.vehicleVin && (
                <p className="flex items-start gap-1.5 text-gray-500">
                  <Car size={14} className="mt-0.5 shrink-0" />
                  <span className="break-all font-mono text-xs">{order.vehicleVin}</span>
                </p>
              )}
              {order.promoCode && (
                <p className="rounded-lg bg-gray-50 px-2 py-1 text-xs text-gray-400">
                  🏷️ {t('promoCode')}: <span className="font-bold text-gray-600">{order.promoCode}</span>
                </p>
              )}
              {order.notes && (
                <p className="rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-700 border border-amber-100">
                  📝 {order.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}