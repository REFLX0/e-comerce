"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { ticketsApi } from '@/lib/api/tickets'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, LifeBuoy, PackageSearch, CheckCircle2, Mail, Calendar } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function TicketDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('Admin')
  const queryClient = useQueryClient()
  const id = params.id as string

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-ticket', id],
    queryFn: () => ticketsApi.getAllForAdmin().then((r: any) => {
      const tickets = Array.isArray(r.data) ? r.data : r?.data?.data ?? []
      return tickets.find((t: any) => t.id === id)
    }),
    enabled: !!id,
  })

  const resolveMutation = useMutation({
    mutationFn: () => ticketsApi.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
      toast.success(t('ticketResolved'))
    },
    onError: () => toast.error(t('genericError')),
  })

  if (isLoading) return <div className="p-6 text-center text-gray-400">{t('loading')}</div>
  if (!data) return <div className="p-6 text-center text-gray-400">{t('ticketNotFound')}</div>

  const ticket = data

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/admin/tickets`} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">{t('ticketTitle', { id: ticket.id ? `#${ticket.id.slice(-8).toUpperCase()}` : '' })}</h1>
          <p className="text-sm text-gray-500">{ticket.reason}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${ticket.type === 'RETURN' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                {ticket.type === 'RETURN' ? <PackageSearch size={24} /> : <LifeBuoy size={24} />}
              </div>
              <div>
                <p className="font-bold text-brand-primary">{ticket.type === 'RETURN' ? t('returnProduct') : t('clientSupport')}</p>
                <p className="text-xs text-gray-400">{ticket.type}</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">"{ticket.message || ticket.reason}"</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-brand-primary mb-4">{t('detailsAction')}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Mail size={14} />
                <span>{ticket.user?.email || '—'}</span>
              </div>
              {ticket.createdAt && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={14} />
                  <span>{new Date(ticket.createdAt).toLocaleDateString(locale)}</span>
                </div>
              )}
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {ticket.status === 'RESOLVED' ? t('resolvedTag') : t('pendingTag')}
              </span>
            </div>
          </div>

          {ticket.status !== 'RESOLVED' && (
            <button
              onClick={() => resolveMutation.mutate()}
              disabled={resolveMutation.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              {resolveMutation.isPending ? '...' : t('markAsResolved')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
