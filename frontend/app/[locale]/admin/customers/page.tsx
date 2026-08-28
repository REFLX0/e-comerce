"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, type TopBuyer } from '@/lib/api/admin'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Search, Mail, Phone, ShoppingBag, UserCheck, ChevronLeft, ChevronRight, Ban, ShieldOff, Crown, TrendingUp, Repeat2, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminCustomersPage() {
  const t = useTranslations('Admin')
  const locale = useLocale()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const localizedHref = (slug: string) => `/${locale}${slug}`

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ['admin-users', page],
    queryFn: () => adminApi.getUsers({ page }),
  })

  const { data: topBuyers } = useQuery<TopBuyer[]>({
    queryKey: ['admin-top-buyers'],
    queryFn: () => adminApi.getTopBuyers(10),
    staleTime: 1000 * 60 * 5,
  })

  const raw = (data as any)?.data ?? data ?? {}
  const users: any[] = Array.isArray(raw) ? raw : raw.data ?? []
  const total = raw.total ?? users.length
  const totalPages = raw.totalPages ?? Math.ceil(total / 20)

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(t('roleUpdated'))
    },
    onError: () => toast.error(t('updateError')),
  })

  const blockMutation = useMutation({
    mutationFn: (id: string) => adminApi.blockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(t('userStatusUpdated'))
    },
    onError: () => toast.error(t('updateError')),
  })

  const filtered = users.filter((c: any) =>
    !search ||
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">{t('customers')}</h1>
          <p className="text-sm text-gray-500">{t('registeredCustomers', { count: total })}</p>
        </div>
      </div>

      {/* ── Top Buyers Leaderboard ─────────────────────────────────────────── */}
      {topBuyers && topBuyers.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Crown size={18} />
            </div>
            <div>
              <h2 className="font-bold text-brand-primary">Top 10 Meilleurs Clients</h2>
              <p className="text-xs text-gray-400">Classés par valeur cumulée (LTV + fréquence)</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-2 pl-2 text-xs font-semibold text-gray-400">#</th>
                  <th className="pb-2 px-3 text-xs font-semibold text-gray-400">Client</th>
                  <th className="pb-2 px-3 text-xs font-semibold text-gray-400 text-right">LTV</th>
                  <th className="pb-2 px-3 text-xs font-semibold text-gray-400 text-right hidden sm:table-cell">Commandes</th>
                  <th className="pb-2 px-3 text-xs font-semibold text-gray-400 text-right hidden md:table-cell">Panier moyen</th>
                  <th className="pb-2 pr-2 text-xs font-semibold text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {topBuyers.map((buyer, idx) => (
                  <tr key={buyer.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 pl-2">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                        idx === 0 ? 'bg-amber-400 text-white' :
                        idx === 1 ? 'bg-gray-300 text-white' :
                        idx === 2 ? 'bg-orange-300 text-white' :
                        'bg-gray-100 text-gray-500'
                      }`}>{idx + 1}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <Link href={localizedHref(`/admin/customers/${buyer.id}`)} className="group flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                          {buyer.name && buyer.name.length > 0 ? buyer.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-primary group-hover:underline">{buyer.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">{buyer.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-sm font-bold text-brand-primary whitespace-nowrap">
                        {buyer.totalSpent.toLocaleString(locale, { minimumFractionDigits: 2 })} TND
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600">
                        <ShoppingBag size={12} className="text-brand-accent" />
                        {buyer.orderCount}
                        {buyer.repeatBuyer && <span title="Client récurrent"><Repeat2 size={12} className="text-green-500" /></span>}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right hidden md:table-cell">
                      <span className="text-sm text-gray-500">
                        {buyer.avgOrderValue.toLocaleString(locale, { minimumFractionDigits: 2 })} TND
                      </span>
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center justify-end gap-1">
                        <span className="flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">
                          <TrendingUp size={10} />
                          {buyer.score.toFixed(0)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchNameEmail')} className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-brand-accent transition-all" />
      </div>

      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-700">{t('loadError')} <button onClick={() => window.location.reload()} className="font-semibold underline">{t('retry')}</button></div>
      )}

      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400">{t('loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">{t('noCustomersFound')}</div>
        ) : (
          filtered.map((c: any) => (
            <Link key={c.id} href={localizedHref(`/admin/customers/${c.id}`)} className="block rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary font-bold text-sm text-white">{c.name ? c.name[0].toUpperCase() : 'U'}</div>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-brand-primary truncate">{c.name ?? t('userFallback')}</p><p className="text-xs text-gray-400 truncate">{c.email}</p></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-gray-500"><ShoppingBag size={12} /> {t('ordersCountLabel', { count: c.ordersCount ?? 0 })}</span>
                <span className="font-semibold text-brand-primary">{(c.ltv ?? 0).toLocaleString(locale, { minimumFractionDigits: 2 })} TND</span>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="hidden md:block rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="py-3 pl-4 pr-2 text-xs font-semibold text-gray-500">{t('customerColumn')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('roleColumn')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('deliveredOrdersColumn')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('totalSpentColumn')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('registeredOnColumn')}</th>
                <th className="py-3 pl-2 pr-4 text-xs font-semibold text-gray-500">{t('actionsHeader')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">{t('loading')}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">{t('noCustomersFound')}</td></tr>
              ) : (
                filtered.map((c: any) => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pl-4 pr-2">
                      <Link href={localizedHref(`/admin/customers/${c.id}`)} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary font-bold text-sm text-white">{c.name ? c.name[0].toUpperCase() : 'U'}</div>
                        <div><p className="text-sm font-medium text-brand-primary">{c.name ?? t('userFallback')}</p><p className="text-xs text-gray-400">{c.email}</p></div>
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : c.role === 'PRO' ? 'bg-blue-100 text-blue-700' : c.role === 'BLOCKED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{c.role === 'BLOCKED' ? t('blockedRole') : c.role}</span>
                    </td>
                    <td className="px-2 py-3"><span className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary"><ShoppingBag size={14} className="text-brand-accent" />{c.ordersCount ?? 0}</span></td>
                    <td className="px-2 py-3 text-sm font-semibold text-brand-primary whitespace-nowrap">{(c.ltv ?? 0).toLocaleString(locale, { minimumFractionDigits: 2 })} TND</td>
                    <td className="px-2 py-3 text-xs text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString(locale) : '—'}</td>
                    <td className="py-3 pl-2 pr-4">
                      <div className="flex gap-1">
                        <Link href={localizedHref(`/admin/orders?customer=${c.id}`)} className="rounded-lg p-1.5 text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors" title={`${t('ordersCountLabel', { count: c.ordersCount ?? 0 })}`}><ShoppingCart size={15} /></Link>
                        <a href={`mailto:${c.email}`} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors" title={t('sendEmail')}><Mail size={15} /></a>
                        {c.phone && <a href={`tel:${c.phone}`} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors" title={t('call')}><Phone size={15} /></a>}
                        {c.role !== 'ADMIN' && (
                          <>
                            <button onClick={() => roleMutation.mutate({ id: c.id, role: c.role === 'PRO' ? 'CUSTOMER' : 'PRO' })} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title={c.role === 'PRO' ? t('demoteToCustomer') : t('promoteToPro')}><UserCheck size={15} /></button>
                            <button onClick={() => blockMutation.mutate(c.id)} className={`rounded-lg p-1.5 transition-colors ${c.role === 'BLOCKED' ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'}`} title={c.role === 'BLOCKED' ? t('unblock') : t('block')}>{c.role === 'BLOCKED' ? <ShieldOff size={15} /> : <Ban size={15} />}</button>
                          </>
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
          <span className="text-sm font-medium text-gray-600">{t('pageSimple', { current: page, total: totalPages })}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  )
}
