"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { Mail, CheckCheck, Trash2, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminContactMessagesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const limit = 20

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ['admin-contact-messages', page],
    queryFn: () => adminApi.getContactMessages({ page, limit }),
  })

  const raw = data?.data ?? data ?? {}
  const messages: any[] = Array.isArray(raw) ? raw : raw.data ?? []
  const total = raw.total ?? messages.length
  const totalPages = raw.totalPages ?? Math.ceil(total / limit)
  const unreadCount = data?.unreadCount ?? 0

  const readMutation = useMutation({
    mutationFn: (id: string) => adminApi.markContactMessageRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] })
      toast.success('Marqué comme lu')
    },
    onError: () => toast.error('Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteContactMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] })
      toast.success('Message supprimé')
      setDeleteTarget(null)
      if (selected === deleteTarget) setSelected(null)
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Messages de contact</h1>
          <p className="text-sm text-gray-500">{total} messages · {unreadCount} non lus</p>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-primary mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-6">Voulez-vous vraiment supprimer ce message définitivement ?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
              <button onClick={() => deleteMutation.mutate(deleteTarget!)} disabled={deleteMutation.isPending} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-700">Erreur de chargement. <button onClick={() => window.location.reload()} className="font-semibold underline">Réessayer</button></div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Aucun message</div>
        ) : messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md cursor-pointer ${msg.isRead ? 'border-gray-100' : 'border-brand-accent/30 bg-brand-accent/[0.02]'}`}
            onClick={() => setSelected(selected === msg.id ? null : msg.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {!msg.isRead && <span className="h-2 w-2 rounded-full bg-brand-accent shrink-0" />}
                  <span className="font-semibold text-brand-primary">{msg.name}</span>
                  <span className="text-xs text-gray-400">• {new Date(msg.createdAt).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.isProfessional && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700"><Briefcase size={10} />Pro</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-700">{msg.subject}</p>
                <p className="text-xs text-gray-500 mt-0.5">{msg.email}{msg.phone ? ` · ${msg.phone}` : ''}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!msg.isRead && (
                  <button
                    onClick={(e) => { e.stopPropagation(); readMutation.mutate(msg.id) }}
                    className="rounded-lg p-2 text-gray-400 hover:bg-brand-accent/10 hover:text-brand-accent transition-colors"
                    title="Marquer comme lu"
                  >
                    <CheckCheck size={18} />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(msg.id) }}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {selected === msg.id && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{msg.message}</p>
              </div>
            )}
          </div>
        ))}
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
