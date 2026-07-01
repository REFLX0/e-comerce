"use client";

import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api/orders'
import { useAuthStore } from '@/lib/store/auth.store'
import { useState } from 'react'
import {
  Package, Clock, CheckCircle2, Truck, XCircle,
  ArrowRight, RefreshCw, Printer, ChevronDown, ChevronUp, ShoppingBag
} from 'lucide-react'
import Link from 'next/link'

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente', icon: Clock,        cls: 'bg-yellow-100 text-yellow-700', step: 1 },
  CONFIRMED: { label: 'Confirmée',  icon: CheckCircle2, cls: 'bg-blue-100 text-blue-700',     step: 2 },
  SHIPPED:   { label: 'Expédiée',   icon: Truck,        cls: 'bg-purple-100 text-purple-700', step: 3 },
  DELIVERED: { label: 'Livrée',     icon: CheckCircle2, cls: 'bg-green-100 text-green-700',   step: 4 },
  CANCELLED: { label: 'Annulée',    icon: XCircle,      cls: 'bg-red-100 text-red-700',       step: 0 },
}

const TIMELINE_STEPS = [
  { key: 'placed',    label: 'Commande passée',     icon: Package },
  { key: 'confirmed', label: 'Paiement confirmé',   icon: CheckCircle2 },
  { key: 'shipped',   label: 'Expédiée',             icon: Truck },
  { key: 'delivered', label: 'Livrée',               icon: CheckCircle2 },
]

function OrderTimeline({ step }: { step: number }) {
  return (
    <div className="mt-4 flex items-start gap-0">
      {TIMELINE_STEPS.map((s, i) => {
        const done = step > i
        const current = step === i + 1
        return (
          <div key={s.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className={`h-0.5 flex-1 transition-colors ${done || current ? 'bg-brand-accent' : 'bg-gray-200'}`} />
              )}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done ? 'border-brand-accent bg-brand-accent text-black'
                  : current ? 'border-brand-accent bg-white text-brand-accent'
                  : 'border-gray-200 bg-white text-gray-300'
                }`}
              >
                <s.icon size={14} />
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 transition-colors ${done ? 'bg-brand-accent' : 'bg-gray-200'}`} />
              )}
            </div>
            <p className={`mt-1.5 text-center text-[10px] font-medium leading-tight ${done || current ? 'text-brand-primary' : 'text-gray-400'}`}>
              {s.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function OrderCard({ order }: { order: { id: string; createdAt: string; status: string; totalTTC?: number; items: Array<{ id: string; quantity?: number; productName?: string }> } }) {
  const [expanded, setExpanded] = useState(false)
  const s = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-gray-50 bg-gray-50 p-4 sm:flex-row sm:items-center">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-gray-400">#{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-sm font-semibold text-brand-primary">
            {order.items?.length ?? 0} article(s) · {((order.totalTTC ?? 0)).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND
          </p>
          <p className="text-xs text-gray-400">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-white transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="px-4 py-3 border-b border-gray-50">
          <OrderTimeline step={s.step} />
        </div>
      )}

      {/* Expanded items */}
      {expanded && order.items?.length > 0 && (
        <div className="divide-y divide-gray-50 px-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <Package size={18} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-brand-primary">{item.productName ?? 'Produit'}</p>
                <p className="text-xs text-gray-400">Qté: {item.quantity ?? 1}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 p-4 border-t border-gray-50">
        <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Printer size={13} /> Facture
        </button>
        <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw size={13} /> Commander à nouveau
        </button>
        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
          <button className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
            <XCircle size={13} /> Annuler
          </button>
        )}
        {order.status === 'DELIVERED' && (
          <button className="flex items-center gap-1.5 rounded-xl border border-brand-accent px-3 py-2 text-xs font-medium text-brand-primary hover:bg-brand-accent/10 transition-colors">
            <ArrowRight size={13} /> Retour / Remboursement
          </button>
        )}
      </div>
    </div>
  )
}

export default function MesCommandesPage() {
    const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getAll(),
    enabled: true,
  })

  const orders = (data as any)?.data ?? []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Mes Commandes</h1>
        <p className="text-sm text-gray-500">{orders.length} commande(s)</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          <ShoppingBag size={48} className="mx-auto mb-4 text-gray-200" />
          <h3 className="font-semibold text-gray-400">Aucune commande</h3>
          <p className="mt-1 text-sm text-gray-300">Vous n'avez pas encore passé de commande.</p>
          <Link href="/catalogue" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors">
            Explorer le catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: { id: string; createdAt: string; status: string; totalTTC?: number; items: Array<{ id: string; quantity?: number; productName?: string }> }) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
