"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { useParams, usePathname } from 'next/navigation'
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle, MapPin } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const STATUS = {
  PENDING: { label: 'En attente', icon: Clock, cls: 'text-yellow-600 bg-yellow-50' },
  CONFIRMED: { label: 'Confirmée', icon: CheckCircle2, cls: 'text-blue-600 bg-blue-50' },
  SHIPPED: { label: 'Expédiée', icon: Truck, cls: 'text-purple-600 bg-purple-50' },
  DELIVERED: { label: 'Livrée', icon: Truck, cls: 'text-green-600 bg-green-50' },
  CANCELLED: { label: 'Annulée', icon: XCircle, cls: 'text-red-600 bg-red-50' },
}

const NEXT_STATUS: Record<string, { label: string; status: string; cls: string }[]> = {
  PENDING: [{ label: 'Confirmer', status: 'CONFIRMED', cls: 'bg-blue-500 hover:bg-blue-600' }],
  CONFIRMED: [{ label: 'Expédier', status: 'SHIPPED', cls: 'bg-purple-500 hover:bg-purple-600' }],
  SHIPPED: [{ label: 'Livrer', status: 'DELIVERED', cls: 'bg-green-500 hover:bg-green-600' }],
}

export default function OrderDetailPage() {
  const params = useParams()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const queryClient = useQueryClient()

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
      toast.success('Statut mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  if (isLoading) return <div className="p-6 text-gray-400">Chargement...</div>
  if (isError || !order) return <div className="p-6 text-center text-gray-400">Commande introuvable</div>

  const s = STATUS[order.status as keyof typeof STATUS] || STATUS.PENDING
  const Icon = s.icon
  const nextActions = NEXT_STATUS[order.status as keyof typeof NEXT_STATUS] || []

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/admin/orders`} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Commande #{order.id?.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-TN') : '—'}</p>
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
                    <p className="text-sm font-medium text-gray-800">{item.product?.nameFr || item.productName || `Produit #${item.productId?.slice(-6) || '?'}`}</p>
                    <p className="text-xs text-gray-400">{item.quantity} x {item.unitPrice?.toFixed(2) || '0.00'} TND{item.variant?.volume ? ` (${item.variant.volume})` : ''}</p>
                  </div>
                  <span className="text-sm font-bold text-brand-primary">{(item.quantity * (item.unitPrice || 0)).toFixed(2)} TND</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Sous-total</span><span>{((order.totalAmount || 0) - (order.shippingCost || 0)).toFixed(2)} TND</span></div>
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
            {nextActions.length > 0 && (
              <div className="mt-4 space-y-2">
                {nextActions.map(action => (
                  <button
                    key={action.status}
                    onClick={() => updateMutation.mutate({ id: order.id, status: action.status })}
                    disabled={updateMutation.isPending}
                    className={`w-full rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${action.cls}`}
                  >
                    {updateMutation.isPending ? '...' : action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-brand-primary mb-4">Client</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-800">{order.user?.name || order.shipFullName || '—'}</p>
              <p className="text-gray-500">{order.user?.email}</p>
            </div>
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
