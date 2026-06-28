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
  const token = useAuthStore(state => state.token)

  useEffect(() => {
    if (!token) {
      router.push('/auth/login')
    }
  }, [token, router])

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id, token],
    queryFn: () => ordersApi.getById(id, token!),
    enabled: !!token,
  })

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="w-12 h-12 border-4 border-brand-surface-dark border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Chargement des détails de la commande...</p>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="py-12 text-center bg-white rounded-2xl border border-brand-surface-dark">
        <h2 className="text-2xl font-bold text-brand-primary mb-2">Commande introuvable</h2>
        <p className="text-gray-500 mb-6">Nous n'avons pas pu charger les détails de cette commande.</p>
        <Link href="/compte/commandes" className="btn-primary inline-flex">
          Retour à mes commandes
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/compte/commandes" className="text-gray-400 hover:text-brand-primary p-2 -ml-2 rounded-full hover:bg-brand-surface transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-display font-bold text-brand-primary">
          Commande #{order.id}
        </h1>
        <span className={`ml-auto px-3 py-1 text-sm font-bold rounded-full ${
          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {order.status === 'pending' && 'En attente'}
          {order.status === 'processing' && 'En cours'}
          {order.status === 'shipped' && 'Expédiée'}
          {order.status === 'delivered' && 'Livrée'}
          {order.status === 'cancelled' && 'Annulée'}
        </span>
      </div>

      <p className="text-gray-500 mb-8">Passée le {formatDate(order.createdAt)}</p>

      {order.timeline && order.timeline.length > 0 && (
        <div className="bg-white rounded-2xl border border-brand-surface-dark p-6 mb-8 shadow-sm">
          <h3 className="font-bold text-brand-primary mb-6">Suivi de la commande</h3>
          <div className="relative">
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100"></div>
            <div className="space-y-8">
              {order.timeline.map((event, index) => (
                <div key={index} className="relative flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    event.done ? 'bg-green-100 text-green-600' : 
                    event.current ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20' : 
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {event.status === 'delivered' ? <CheckCircle size={20} /> :
                     event.status === 'shipped' ? <Truck size={20} /> :
                     <Package size={20} />}
                  </div>
                  <div className="pt-3">
                    <h4 className={`font-semibold ${event.done || event.current ? 'text-brand-primary' : 'text-gray-400'}`}>
                      {event.label}
                    </h4>
                    {event.date && (
                      <p className="text-sm text-gray-500 mt-1">{formatDate(event.date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-brand-surface-dark p-6 shadow-sm">
            <h3 className="font-bold text-brand-primary mb-6 border-b border-gray-100 pb-4">Articles commandés</h3>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 bg-brand-surface rounded-xl overflow-hidden shrink-0">
                    {item.productImage ? (
                      <Image src={item.productImage} alt={item.productName} fill className="object-cover p-2" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-brand-primary line-clamp-1">{item.productName}</h4>
                    <p className="text-sm text-gray-500 mt-1">Volume: {item.variantVolume}</p>
                    <p className="text-sm text-gray-500 mt-1">Quantité: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-primary">{formatPrice(item.subtotalHT)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-brand-surface rounded-2xl p-6 border border-brand-surface-dark shadow-sm">
            <h3 className="font-bold text-brand-primary mb-4 border-b border-brand-surface-dark pb-4">Résumé financier</h3>
            <div className="space-y-3 mb-6">
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
                <span>{order.shippingCost === 0 ? 'Gratuit' : formatPrice(order.shippingCost)}</span>
              </div>
              {order.promoDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Remise ({order.promoCode})</span>
                  <span>-{formatPrice(order.promoDiscount)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center border-t border-brand-surface-dark pt-4">
              <span className="font-bold text-brand-primary">Total TTC</span>
              <span className="text-2xl font-display font-bold text-brand-accent">{formatPrice(order.totalTTC)}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-surface-dark p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <MapPin className="text-gray-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-brand-primary mb-1">Adresse de livraison</h3>
                <p className="text-sm text-gray-600">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.wilaya} {order.shippingAddress.postalCode}</p>
                <p className="text-sm text-gray-600 mt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-6 border-t border-gray-100">
              <CreditCard className="text-gray-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-brand-primary mb-1">Mode de paiement</h3>
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
