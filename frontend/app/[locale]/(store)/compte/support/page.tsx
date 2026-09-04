"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from '@/lib/api/tickets'
import { ordersApi } from '@/lib/api/orders'
import { useSearchParams } from 'next/navigation'
import { LifeBuoy, PackageSearch, Plus } from 'lucide-react'
import { gooeyToast as toast } from 'goey-toast'
import { useTranslations } from 'next-intl'

export default function SupportPage() {
  const t = useTranslations('Support')
  const RETURN_REASONS = t.raw('reasons') as string[]
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const preselectedOrder = searchParams.get('orderId') ?? ''
  const [tab, setTab] = useState<'tickets' | 'new-return'>(preselectedOrder ? 'new-return' : 'tickets')
  const [selectedOrder, setSelectedOrder] = useState(preselectedOrder)
  const [selectedReason, setSelectedReason] = useState('')
  const [message, setMessage] = useState('')

  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery<any>({
    queryKey: ['my-tickets'],
    queryFn: () => ticketsApi.getMyTickets(),
    enabled: true,
  })

  const { data: ordersData } = useQuery<any>({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getAll(),
    enabled: true,
  })

  const tickets = Array.isArray(ticketsData) ? ticketsData : (ticketsData as any)?.data ?? []
  const orders = Array.isArray(ordersData) ? ordersData : (ordersData as any)?.data ?? []

  const createMutation = useMutation({
    mutationFn: () => ticketsApi.create({
      type: tab === 'new-return' ? 'RETURN' : 'SUPPORT',
      reason: selectedReason,
      message,
      orderId: selectedOrder || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] })
      toast.success(t('success'))
      setTab('tickets')
      setSelectedOrder('')
      setSelectedReason('')
      setMessage('')
    },
    onError: () => toast.error(t('error')),
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">{t('title')}</h1>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        {[
          { key: 'tickets', label: t('myTickets') },
          { key: 'new-return', label: t('newReturn') },
        ].map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key as typeof tab)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              tab === tabItem.key ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'tickets' ? (
        <div className="space-y-3">
          {isLoadingTickets ? (
            <div className="py-12 text-center text-gray-400">{t('loading')}</div>
          ) : tickets.length === 0 ? (
            <div className="py-12 text-center">
              <LifeBuoy size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm text-gray-400">{t('noTickets')}</p>
            </div>
          ) : (
            tickets.map((ticket: any) => (
              <div key={ticket.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-400">#{ticket.id.slice(-8).toUpperCase()}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{ticket.type}</span>
                    </div>
                    <p className="text-sm font-medium text-brand-primary">{ticket.reason}</p>
                    {ticket.order && (
                      <p className="text-xs text-gray-400">
                        {t('order')} #{ticket.order.id.slice(-8).toUpperCase()}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">{t('openedOn')} {new Date(ticket.createdAt).toLocaleDateString('fr-TN')}</p>
                  </div>
                  <span className={`self-start rounded-full px-3 py-1 text-xs font-bold sm:self-auto ${
                    ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {ticket.status === 'RESOLVED' ? `✓ ${t('resolved')}` : `⏳ ${t('inProgress')}`}
                  </span>
                </div>
              </div>
            ))
          )}
          <button
            onClick={() => setTab('new-return')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 text-sm font-medium text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all"
          >
            <Plus size={16} /> {t('openTicket')}
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-lg">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-semibold">{t('returnPolicy')}</p>
            <p className="mt-1 text-xs text-blue-600">{t('returnPolicyDesc')}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('concernedOrder')}</label>
            <select
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:border-brand-primary focus:bg-white transition-all"
            >
              <option value="">{t('selectOrder')}</option>
              {orders.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.id.slice(-8).toUpperCase()} — {new Date(o.createdAt).toLocaleDateString('fr-TN')} · {o.totalAmount} TND
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('returnReason')}</label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:border-brand-primary focus:bg-white transition-all"
            >
              <option value="">{t('selectReason')}</option>
              {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('description')}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={t('descriptionPlaceholder')}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:border-brand-primary focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={() => createMutation.mutate()}
            disabled={!selectedOrder || !selectedReason || createMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 text-sm font-semibold text-white hover:bg-brand-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PackageSearch size={16} />
            {createMutation.isPending ? t('sending') : t('submitReturn')}
          </button>
        </div>
      )}
    </div>
  )
}

