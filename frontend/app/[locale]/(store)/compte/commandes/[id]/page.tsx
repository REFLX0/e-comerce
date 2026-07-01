'use client'

import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api/orders'
import { useAuthStore } from '@/lib/store/auth.store'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { ArrowLeft, Package, Truck, CheckCircle, CreditCard, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useEffect } from 'react'

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { isAuthenticated, isHydrated } = useAuthStore()
  
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
        <p className="font-medium text-gray-500">Chargement des détails de la commande...</p>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="border-brand-surface-dark rounded-2xl border bg-white py-12 text-center">
        <h2 className="text-brand-primary mb-2 text-2xl font-bold">Commande introuvable</h2>
        <p className="mb-6 text-gray-500">
          Nous n'avons pas pu charger les détails de cette commande.
        </p>
        <Link href="/compte/commandes" className="btn-primary inline-flex">
          Retour à mes commandes
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
        <h1 className="font-display text-brand-primary text-2xl font-bold">Commande #{order.id}</h1>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-sm font-bold ${
            order.status === 'delivered'
              ? 'bg-green-100 text-green-700'
              : order.status === 'processing'
                ? 'bg-blue-100 text-blue-700'
                : order.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {order.status === 'pending' && 'En attente'}
          {order.status === 'processing' && 'En cours'}
          {order.status === 'shipped' && 'Expédiée'}
          {order.status === 'delivered' && 'Livrée'}
          {order.status === 'cancelled' && 'Annulée'}
        </span>
      </div>

      <p className="mb-8 text-gray-500">Passée le {formatDate(order.createdAt)}</p>

      {order.timeline && order.timeline.length > 0 && (
        <div className="border-brand-surface-dark mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-brand-primary mb-6 font-bold">Suivi de la commande</h3>
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
              Articles commandés
            </h3>
            <div className="space-y-6">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="bg-brand-surface relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover p-2"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-brand-primary line-clamp-1 font-bold">
                      {item.productName}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">Volume: {item.variantVolume}</p>
                    <p className="mt-1 text-sm text-gray-500">Quantité: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-brand-primary font-bold">
                      {formatPrice(item.subtotalHT)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-brand-surface border-brand-surface-dark rounded-2xl border p-6 shadow-sm">
            <h3 className="text-brand-primary border-brand-surface-dark mb-4 border-b pb-4 font-bold">
              Résumé financier
            </h3>
            <div className="mb-6 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total HT</span>
                <span>{formatPrice(order.subtotalHT)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>TVA</span>
                <span>{formatPrice(order.tva)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Frais de livraison</span>
                <span>
                  {order.shippingCost === 0 ? 'Gratuit' : formatPrice(order.shippingCost)}
                </span>
              </div>
              {order.promoDiscount > 0 && (
                <div className="flex justify-between text-sm font-medium text-green-600">
                  <span>Remise ({order.promoCode})</span>
                  <span>-{formatPrice(order.promoDiscount)}</span>
                </div>
              )}
            </div>
            <div className="border-brand-surface-dark flex items-center justify-between border-t pt-4">
              <span className="text-brand-primary font-bold">Total TTC</span>
              <span className="font-display text-brand-accent text-2xl font-bold">
                {formatPrice(order.totalTTC)}
              </span>
            </div>
          </div>

          <div className="border-brand-surface-dark rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start gap-3">
              <MapPin className="mt-1 text-gray-400" size={20} />
              <div>
                <h3 className="text-brand-primary mb-1 font-bold">Adresse de livraison</h3>
                <p className="text-sm text-gray-600">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.wilaya}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="mt-2 text-sm text-gray-600">{order.shippingAddress.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-gray-100 pt-6">
              <CreditCard className="mt-1 text-gray-400" size={20} />
              <div>
                <h3 className="text-brand-primary mb-1 font-bold">Mode de paiement</h3>
                <p className="text-sm text-gray-600">
                  {order.paymentMethod === 'cod' ? 'Paiement à la livraison' : order.paymentMethod}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
