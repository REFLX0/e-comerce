"use client";

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import {
  Mail, CheckCheck, Trash2, ChevronLeft, ChevronRight, Briefcase,
  Search, Phone, MessageSquare, Inbox, ArrowUpDown, Clock,
} from 'lucide-react'
import { toast } from 'sonner'

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'unread', label: 'Non lus' },
  { key: 'withPhone', label: 'Avec téléphone' },
] as const

const SORTS = [
  { key: 'recent', label: 'Plus récent' },
  { key: 'oldest', label: 'Plus ancien' },
  { key: 'unread', label: 'Non lus d\'abord' },
] as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminContactMessagesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [sort, setSort] = useState<'recent' | 'oldest' | 'unread'>('recent')
  const [filter, setFilter] = useState<'all' | 'unread' | 'withPhone'>('all')
  const [search, setSearch] = useState('')
  const limit = 20

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ['admin-contact-messages', page, sort, filter],
    queryFn: () => adminApi.getContactMessages({ page, limit, sort, filter }),
  })

  const raw = data?.data ?? data ?? {}
  const messages: any[] = Array.isArray(raw) ? raw : raw.data ?? []
  const total = raw.total ?? messages.length
  const totalPages = raw.totalPages ?? Math.ceil(total / limit)
  const unreadCount = data?.unreadCount ?? 0

  const filtered = useMemo(() => {
    if (!search.trim()) return messages
    const q = search.toLowerCase()
    return messages.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.message?.toLowerCase().includes(q),
    )
  }, [messages, search])

  const readMutation = useMutation({
    mutationFn: (id: string) => adminApi.markContactMessageRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteContactMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] })
      toast.success('Message supprimé', {
        action: { label: 'Annuler', onClick: () => {} },
        duration: 4000,
      })
      setDeleteTarget(null)
      if (selected === deleteTarget) setSelected(null)
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  const handleCardClick = (msg: any) => {
    if (selected === msg.id) {
      setSelected(null)
      return
    }
    setSelected(msg.id)
    if (!msg.isRead) readMutation.mutate(msg.id)
  }

  const showDeleteConfirm = (id: string) => setDeleteTarget(id)

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Messages de contact</h1>
          <p className="text-sm text-gray-500">
            {total} message{total !== 1 ? 's' : ''}
            {unreadCount > 0 && (
              <span className="ml-1.5 font-medium text-brand-accent">· {unreadCount} non lu{unreadCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1) }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f.key
                  ? 'bg-white text-brand-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="relative">
            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as any); setPage(1) }}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-xs font-medium text-gray-600 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email ou message…"
              className="w-56 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-600 outline-none placeholder:text-gray-400 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-primary mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-6">Voulez-vous vraiment supprimer ce message définitivement ? Cette action est irréversible.</p>
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

      {/* Message list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Inbox size={48} className="mb-4 text-gray-300" />
            <p className="text-sm font-medium">Aucun message pour le moment</p>
            <p className="mt-1 text-xs text-gray-400">
              {search ? 'Essayez de modifier vos filtres ou votre recherche.' : 'Les messages envoyés depuis le formulaire de contact apparaîtront ici.'}
            </p>
          </div>
        ) : filtered.map((msg) => {
          const isOpen = selected === msg.id
          const statusPill = msg.isRead
            ? { label: 'Traité', classes: 'bg-green-100 text-green-700' }
            : { label: 'Nouveau', classes: 'bg-brand-accent/15 text-brand-accent' }

          return (
            <div
              key={msg.id}
              className={`relative rounded-2xl border bg-white shadow-sm transition-all ${
                isOpen ? 'shadow-md' : 'hover:shadow-md'
              } ${msg.isRead ? 'border-gray-100' : 'border-l-[3px] border-l-brand-accent border-r border-t border-b border-gray-100'}`}
            >
              {/* Clickable area */}
              <div
                className="cursor-pointer p-5"
                onClick={() => handleCardClick(msg)}
              >
                {/* Top row: name, date, actions */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`text-sm ${msg.isRead ? 'font-medium text-gray-600' : 'font-bold text-brand-primary'}`}>
                        {msg.name}
                      </span>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">{formatDate(msg.createdAt)}</span>
                      {msg.isProfessional && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          <Briefcase size={10} />Pro
                        </span>
                      )}
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusPill.classes}`}>
                        {statusPill.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">{msg.subject}</p>
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
                      onClick={(e) => { e.stopPropagation(); showDeleteConfirm(msg.id) }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Contact info with icons */}
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                  <a href={`mailto:${msg.email}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 hover:text-brand-accent transition-colors">
                    <Mail size={12} />{msg.email}
                  </a>
                  {msg.phone && (
                    <a href={`tel:${msg.phone}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 hover:text-brand-accent transition-colors">
                      <Phone size={12} />{msg.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Expanded message body */}
              {isOpen && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !search && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span className="text-sm font-medium text-gray-600">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  )
}
