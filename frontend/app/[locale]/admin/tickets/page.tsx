"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from '@/lib/api/tickets'
import { useLocale, useTranslations } from 'next-intl'
import { LifeBuoy, CheckCircle2, PackageSearch, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminTicketsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const locale = useLocale()
  const t = useTranslations('Admin')

  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ['admin-tickets', statusFilter, page],
    queryFn: () => ticketsApi.getAllForAdmin(statusFilter === 'ALL' ? undefined : statusFilter, page, limit),
  })

  const raw = (data as any)?.data ?? data ?? {}
  const tickets: any[] = Array.isArray(raw) ? raw : raw.data ?? []
  const total = raw.total ?? tickets.length
  const totalPages = raw.totalPages ?? Math.ceil(total / limit)

  const resolveMutation = useMutation({
    mutationFn: (id: string) => ticketsApi.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
      toast.success(t('ticketResolved'))
    },
    onError: () => toast.error(t('genericError')),
  })

  const sliceId = (id?: string) => id ? `#${id.slice(-8).toUpperCase()}` : 'N/A'

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">{t('supportReturnsTitle')}</h1>
          <p className="text-sm text-gray-500">{t('ticketsFound', { count: total })}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['ALL', 'OPEN', 'RESOLVED'].map(status => (
          <button key={status} onClick={() => { setStatusFilter(status); setPage(1) }} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${statusFilter === status ? 'bg-brand-primary text-white' : 'bg-white text-gray-500 hover:text-brand-primary'}`}>
            {status === 'ALL' ? t('allFilter') : status === 'OPEN' ? t('openFilter') : t('resolvedFilter')}
          </button>
        ))}
      </div>

      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-700">{t('loadError')} <button onClick={() => window.location.reload()} className="font-semibold underline">{t('retry')}</button></div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">{t('loading')}</div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-gray-400">{t('noTickets')}</div>
        ) : (
          tickets.map((ticket: any) => (
            <div key={ticket.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <Link href={`/${locale}/admin/tickets/${ticket.id}`} className="flex gap-4 flex-1 min-w-0">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${ticket.type === 'RETURN' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {ticket.type === 'RETURN' ? <PackageSearch size={24} /> : <LifeBuoy size={24} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-brand-primary">{ticket.user?.name || ticket.user?.email}</span>
                      <span className="text-xs text-gray-400">({ticket.user?.email})</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{ticket.reason}</p>
                    {ticket.message && <p className="mt-1 text-sm text-gray-500 italic">"{ticket.message}"</p>}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span>{sliceId(ticket.id)}</span>
                      <span>•</span>
                      <span>Ouvert le {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString(locale) : '—'}</span>
                      {ticket.orderId && (
                        <><span>•</span><span className="font-semibold text-brand-accent">{t('orderLabel')} {sliceId(ticket.orderId)}</span></>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {ticket.status === 'RESOLVED' ? t('resolvedTag') : t('pendingTag')}
                  </span>
                  <Link href={`/${locale}/admin/tickets/${ticket.id}`} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors" title={t('detailsAction')}>
                    <Eye size={15} />
                  </Link>
                  {ticket.status !== 'RESOLVED' && (
                    <button onClick={() => resolveMutation.mutate(ticket.id)} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                      <CheckCircle2 size={14} className="text-green-500" />
                      {t('markResolved')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span className="text-sm font-medium text-gray-600">{t('pageOf', { current: page, total: totalPages })}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  )
}

