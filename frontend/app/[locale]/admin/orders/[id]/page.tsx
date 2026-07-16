"use client";

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle, AlertTriangle, MapPin } from 'lucide-react'
import Link from 'next/link'

const STATUS = {
  PENDING: { label: 'En attente', icon: Clock, cls: 'text-yellow-600 bg-yellow-50' },
  CONFIRMED: { label: 'Confirmée', icon: CheckCircle2, cls: 'text-blue-600 bg-blue-50' },
  SHIPPED: { label: 'Expédiée', icon: Truck, cls: 'text-purple-600 bg-purple-50' },
  DELIVERED: { label: 'Livrée', icon: Truck, cls: 'text-green-600 bg-green-50' },
  CANCELLED: { label: 'Annulée', icon: XCircle, cls: 'text-red-600 bg-red-50' },
}

export default function OrderDetailPage() {
  const params = useParams()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const router = useRouter()

  const { data: order, isLoading } = useQuery<any>({
    queryKey: ['admin-order', params.id],
    queryFn: () => adminApi.getOrders({ page: 1 }).then((r: any) => {
      const orders = Array.isArray(r.data) ? r.data : r?.data?.data ?? []
      return orders.find((o: any) => o.id === params.id)
    }),
  })

  if (isLoading) return <div className="p-6 text-gray-400">Chargement...</div>
  if (!order) return <div className="p-6 text-gray-400">Commande introuvable</div>

  const s = STATUS[order.status as keyof typeof STATUS] || STATUS.PENDING
  const Icon = s.icon

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/admin/orders`} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Commande #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('fr-TN')}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-brand-primary mb-4">Articles</h2>
            <div className="space-y-3">
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.productName || `Produit #${item.productId?.slice(-6)}`}</p>
                    <p className="text-xs text-gray-400">{item.quantity} x {item.unitPrice?.toFixed(2)} TND</p>
                  </div>
                  <span className="text-sm font-bold text-brand-primary">{(item.quantity * item.unitPrice).toFixed(2)} TND</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Sous-total</span><span>{(order.totalAmount - (order.shippingCost || 0)).toFixed(2)} TND</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Livraison</span><span>{order.shippingCost?.toFixed(2) || '0.00'} TND</span></div>
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-brand-primary">{order.totalAmount?.toFixed(2)} TND</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-brand-primary mb-4">Statut</h2>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${s.cls}`}>
              <Icon size={16} /> {s.label}
            </span>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-brand-primary mb-4">Livraison</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-800">{order.shipFullName || 'Non renseigné'}</p>
              <p className="text-gray-500">{order.shipPhone}</p>
              <p className="flex items-center gap-1 text-gray-500"><MapPin size={14} /> {[order.shipCity, order.shipWilaya].filter(Boolean).join(', ') || 'Adresse non définie'}</p>
              {order.promoCode && <p className="text-xs text-gray-400">Code promo: {order.promoCode}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
