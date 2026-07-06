"use client";

import { useAuthStore } from '@/lib/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api/orders'
import Link from 'next/link'
import {
  Package, Heart, MapPin, Star, ArrowRight, ShoppingBag,
  Clock, CheckCircle2, Truck, XCircle
} from 'lucide-react'

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente', icon: Clock,         cls: 'text-yellow-600 bg-yellow-50' },
  CONFIRMED: { label: 'Confirmée',  icon: CheckCircle2,  cls: 'text-blue-600 bg-blue-50' },
  SHIPPED:   { label: 'Expédiée',   icon: Truck,         cls: 'text-purple-600 bg-purple-50' },
  DELIVERED: { label: 'Livrée',     icon: CheckCircle2,  cls: 'text-green-600 bg-green-50' },
  CANCELLED: { label: 'Annulée',    icon: XCircle,       cls: 'text-red-600 bg-red-50' },
}

const QUICK_LINKS = [
  { href: '/compte/commandes', icon: Package,  label: 'Mes Commandes',    desc: 'Suivre et gérer vos achats' },
  { href: '/compte/wishlist',  icon: Heart,    label: 'Liste de souhaits', desc: 'Produits sauvegardés' },
  { href: '/compte/adresses',  icon: MapPin,   label: 'Mes Adresses',     desc: 'Gérer vos adresses' },
  { href: '/compte/avis',      icon: Star,     label: 'Mes Avis',         desc: 'Vos avis publiés' },
]

export default function CompteDashboardPage() {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery<any>({
    queryKey: ['my-orders-preview'],
    queryFn: () => ordersApi.getAll(),
    enabled: true,
  })

  const orders = (Array.isArray(data) ? data : (data as any)?.data ?? []).slice(0, 3)

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">
            Bonjour, {user?.firstName ?? 'cher client'} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">Bienvenue dans votre espace personnel KiosqueTN</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex flex-col gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center transition-all hover:border-brand-accent/30 hover:bg-brand-accent/5 hover:shadow-sm"
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm group-hover:bg-brand-accent group-hover:text-black transition-all">
              <link.icon size={18} className="text-brand-primary group-hover:text-black transition-colors" />
            </div>
            <p className="text-xs font-semibold text-brand-primary">{link.label}</p>
            <p className="hidden text-xs text-gray-400 sm:block">{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-brand-primary">Commandes récentes</h2>
          <Link href="/compte/commandes" className="flex items-center gap-1 text-xs font-medium text-brand-accent hover:underline">
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center">
            <ShoppingBag size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-semibold text-gray-400">Aucune commande pour l'instant</p>
            <Link href="/catalogue" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors">
              Découvrir le catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: { id: string; createdAt: string; status: string; totalAmount: number; items: unknown[] }) => {
              const s = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
              return (
                <div key={order.id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:items-center">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.cls}`}>
                    <s.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-gray-400">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm font-semibold text-brand-primary">
                      {order.items?.length ?? 0} article(s) · {(order.totalAmount ?? 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND
                    </p>
                  </div>
                  <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto ${s.cls}`}>
                    {s.label}
                  </span>
                  <Link href="/compte/commandes" className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-primary transition-colors sm:ml-2">
                    Détails <ArrowRight size={12} />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
