"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { CreditCard, Banknote, Clock, CheckCircle2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING:   { label: 'En attente (COD)', className: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Encaissé',         className: 'bg-green-100 text-green-700'  },
  FAILED:    { label: 'Échoué',           className: 'bg-red-100 text-red-700'      },
  REFUNDED:  { label: 'Remboursé',        className: 'bg-blue-100 text-blue-700'    },
}

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ['admin-payments', page],
    queryFn: () => adminApi.getPayments({ page, limit }),
  })

  const raw = (data as any)?.data ?? data ?? {}
  const allPayments: any[] = Array.isArray(raw) ? raw : raw.data ?? []
  const total = raw.total ?? allPayments.length
  const totalPages = raw.totalPages ?? Math.ceil(total / limit)

  const payments = allPayments

  const filtered = payments.filter(p => {
    const q = search.toLowerCase()
    return (
      (p.id || '').toLowerCase().includes(q) ||
      (p.order?.user?.name || '').toLowerCase().includes(q) ||
      (p.order?.user?.email || '').toLowerCase().includes(q) ||
      (p.order?.items?.[0]?.product?.nameFr || '').toLowerCase().includes(q)
    )
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updatePaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      toast.success('Statut mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  const totalPending   = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + (p.amount || 0), 0)
  const totalCompleted = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + (p.amount || 0), 0)
  const totalVolume    = payments.reduce((s, p) => s + (p.amount || 0), 0)

  const fmt = (n: number) => n.toLocaleString('fr-TN', { minimumFractionDigits: 2 }) + ' TND'
  const sliceId = (id?: string) => id ? `#${id.slice(-8).toUpperCase()}` : 'N/A'

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Paiements & Transactions</h1>
        <p className="text-sm text-gray-500">Transactions réelles enregistrées en base de données.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 mb-4">
            <Clock size={20} />
          </div>
          <p className="text-sm font-medium text-gray-500">En attente (COD)</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{isLoading ? '...' : fmt(totalPending)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 mb-4">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-sm font-medium text-gray-500">Paiements encaissés</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{isLoading ? '...' : fmt(totalCompleted)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-4">
            <CreditCard size={20} />
          </div>
          <p className="text-sm font-medium text-gray-500">Volume total</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{isLoading ? '...' : fmt(totalVolume)}</p>
        </div>
      </div>

      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-700">Erreur de chargement. <button onClick={() => window.location.reload()} className="font-semibold underline">Réessayer</button></div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 p-4 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-brand-primary">Historique des transactions</h2>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-accent transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">Transaction ID</th>
                <th className="px-6 py-3 font-semibold">Client</th>
                <th className="px-6 py-3 font-semibold">Produit (1er)</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Méthode</th>
                <th className="px-6 py-3 font-semibold text-right">Montant</th>
                <th className="px-6 py-3 font-semibold text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Aucune transaction trouvée</td></tr>
              ) : (
                filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-medium text-brand-primary">{sliceId(tx.id)}</div>
                      <div className="text-xs text-gray-400">Cmd {sliceId(tx.orderId)}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="font-medium">{tx.order?.user?.name || tx.order?.shipFullName || '—'}</div>
                      <div className="text-xs text-gray-400">{tx.order?.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs max-w-[160px] truncate">
                      {tx.order?.items?.[0]?.product?.nameFr ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('fr-TN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Banknote size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-700">{tx.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-brand-primary">
                      {fmt(tx.amount || 0)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_LABELS[tx.status]?.className ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[tx.status]?.label ?? tx.status}
                        </span>
                        {tx.status === 'PENDING' && (
                          <button onClick={() => updateStatusMutation.mutate({ id: tx.id, status: 'COMPLETED' })} disabled={updateStatusMutation.isPending} className="ml-1 rounded-lg p-1 text-green-600 hover:bg-green-50 transition-colors" title="Marquer comme encaissé">
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span className="text-sm font-medium text-gray-600">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  )
}
