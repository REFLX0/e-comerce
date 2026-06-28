'use client'

import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api/orders'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { Package, ExternalLink } from 'lucide-react'

export default function AccountOrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersApi.getMyOrders,
  })

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-brand-primary mb-6 border-b border-gray-100 pb-4">
        Mes Commandes
      </h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-brand-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-brand-surface-dark rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-brand-surface p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-surface-dark">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Commande effectuée le</div>
                  <div className="font-semibold text-brand-primary">{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</div>
                  <div className="font-semibold text-brand-primary">{formatPrice(order.totalAmount)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">N° Commande</div>
                  <div className="font-mono text-sm text-brand-primary">{order.id}</div>
                </div>
                <div className="sm:ml-auto">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
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
              </div>
              
              <div className="p-4 bg-white flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-brand-primary">{order.items.length}</span> article(s) dans cette commande
                </div>
                <button className="text-brand-accent hover:underline text-sm font-medium flex items-center gap-1">
                  Voir les détails
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Package size={32} />
          </div>
          <h3 className="text-lg font-bold text-brand-primary mb-2">Aucune commande</h3>
          <p className="text-gray-500">Vous n'avez pas encore passé de commande.</p>
        </div>
      )}
    </div>
  )
}
