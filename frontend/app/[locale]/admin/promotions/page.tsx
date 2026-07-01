"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponsApi } from '@/lib/api/coupons'
import { useAuthStore } from '@/lib/store/auth.store'
import { Plus, Percent, Banknote, Gift, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPromotionsPage() {
    const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-coupons'],
    queryFn: () => couponsApi.getAll(),
    enabled: true,
  })

  const coupons = (data as any)?.data ?? []

  const toggleMutation = useMutation({
    mutationFn: (id: string) => couponsApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon supprimé')
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Promotions & Coupons</h1>
          <p className="text-sm text-gray-500">{coupons.filter((c: any) => c.isActive).length} coupons actifs</p>
        </div>
        <button className="flex items-center gap-2 self-start rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors">
          <Plus size={16} /> Nouveau coupon
        </button>
      </div>

      {/* Coupon list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-gray-400">Chargement...</div>
        ) : coupons.length === 0 ? (
          <div className="py-12 text-center text-gray-400">Aucun coupon trouvé</div>
        ) : (
          coupons.map((c: any) => (
            <div key={c.id} className={`rounded-2xl border bg-white p-4 shadow-sm transition-opacity ${!c.isActive ? 'opacity-60' : ''}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent/10">
                    {c.type === 'PERCENT' ? <Percent size={18} className="text-brand-accent" />
                    : c.type === 'FIXED' ? <Banknote size={18} className="text-brand-accent" />
                    : <Gift size={18} className="text-brand-accent" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-base font-bold text-brand-primary">{c.code}</p>
                    <p className="text-xs text-gray-400">
                      {c.type === 'PERCENT' ? `${c.value}% de réduction`
                      : c.type === 'FIXED' ? `${c.value} TND de réduction`
                      : 'Livraison gratuite'}
                      {c.expiryDate && ` · Expire le ${new Date(c.expiryDate).toLocaleDateString('fr-TN')}`}
                    </p>
                  </div>
                </div>

                {/* Usage */}
                <div className="flex items-center gap-4">
                  {c.maxUses && (
                    <div className="text-center">
                      <p className="text-sm font-bold text-brand-primary">{c.currentUses} / {c.maxUses}</p>
                      <p className="text-xs text-gray-400">Utilisations</p>
                      <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-brand-accent"
                          style={{ width: `${Math.min((c.currentUses / c.maxUses) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleMutation.mutate(c.id)}
                      className={`rounded-xl p-2 transition-colors ${c.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={c.isActive ? 'Désactiver' : 'Activer'}
                    >
                      {c.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(c.id)}
                      className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

