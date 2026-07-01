"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { useAuthStore } from '@/lib/store/auth.store'
import { Search, Mail, Phone, ShoppingBag, UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminCustomersPage() {
    const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
    enabled: true,
  })

  const users = (data as any)?.data?.data ?? []

  // Reusing the Role update mutation for blocking (setting role to BLOCKED if we had it, but for now we just toggle PRO/CUSTOMER as an example or we can skip if the schema doesn't support blocking yet)
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Rôle mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  const filtered = users.filter((c: any) =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Clients</h1>
          <p className="text-sm text-gray-500">{(data as any)?.data?.total ?? 0} clients enregistrés</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, email..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-brand-accent transition-all"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="py-3 pl-4 pr-2 text-xs font-semibold text-gray-500">Client</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Rôle</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Commandes livrées</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Total dépensé (LTV)</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Inscrit le</th>
                <th className="py-3 pl-2 pr-4 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Aucun client trouvé</td></tr>
              ) : (
                filtered.map((c: any) => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pl-4 pr-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary font-bold text-sm text-white">
                          {c.name ? c.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-primary">{c.name ?? 'Utilisateur'}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        c.role === 'ADMIN' ? 'bg-purple-100 text-purple-700'
                        : c.role === 'PRO' ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary">
                        <ShoppingBag size={14} className="text-brand-accent" />
                        {c.ordersCount ?? 0}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-sm font-semibold text-brand-primary whitespace-nowrap">
                      {(c.ltv ?? 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND
                    </td>
                    <td className="px-2 py-3 text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString('fr-TN')}
                    </td>
                    <td className="py-3 pl-2 pr-4">
                      <div className="flex gap-1">
                        <a href={`mailto:${c.email}`} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors" title="Envoyer un email">
                          <Mail size={15} />
                        </a>
                        {c.phone && (
                          <a href={`tel:${c.phone}`} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors" title="Appeler">
                            <Phone size={15} />
                          </a>
                        )}
                        <button
                          onClick={() => roleMutation.mutate({ id: c.id, role: c.role === 'PRO' ? 'CUSTOMER' : 'PRO' })}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title={c.role === 'PRO' ? 'Rétrograder en Client' : 'Promouvoir en PRO'}
                        >
                          <UserCheck size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

