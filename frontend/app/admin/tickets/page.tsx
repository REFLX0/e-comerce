"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from '@/lib/api/tickets'
import { useAuthStore } from '@/lib/store/auth.store'
import { LifeBuoy, Filter, CheckCircle2, PackageSearch } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminTicketsPage() {
    const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', statusFilter],
    queryFn: () => ticketsApi.getAllForAdmin(statusFilter === 'ALL' ? undefined : statusFilter),
    enabled: true,
  })

  const tickets = (data as any)?.data ?? []

  const resolveMutation = useMutation({
    mutationFn: (id: string) => ticketsApi.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
      toast.success('Ticket marqué comme résolu')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Support & Retours</h1>
          <p className="text-sm text-gray-500">{tickets.length} tickets trouvés</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'OPEN', 'RESOLVED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              statusFilter === status ? 'bg-brand-primary text-white' : 'bg-white text-gray-500 hover:text-brand-primary'
            }`}
          >
            {status === 'ALL' ? 'Tous' : status === 'OPEN' ? 'Ouverts' : 'Résolus'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">Chargement...</div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Aucun ticket trouvé</div>
        ) : (
          tickets.map((ticket: any) => (
            <div key={ticket.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    ticket.type === 'RETURN' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {ticket.type === 'RETURN' ? <PackageSearch size={24} /> : <LifeBuoy size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-brand-primary">{ticket.user?.name || ticket.user?.email}</span>
                      <span className="text-xs text-gray-400">({ticket.user?.email})</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{ticket.reason}</p>
                    {ticket.message && <p className="mt-1 text-sm text-gray-500 italic">"{ticket.message}"</p>}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span>#{ticket.id.slice(-8).toUpperCase()}</span>
                      <span>•</span>
                      <span>Ouvert le {new Date(ticket.createdAt).toLocaleDateString('fr-TN')}</span>
                      {ticket.orderId && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-brand-accent">Commande #{ticket.orderId.slice(-8).toUpperCase()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {ticket.status === 'RESOLVED' ? 'Résolu' : 'En attente'}
                  </span>

                  {ticket.status !== 'RESOLVED' && (
                    <button
                      onClick={() => resolveMutation.mutate(ticket.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      <CheckCircle2 size={14} className="text-green-500" />
                      Marquer résolu
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

