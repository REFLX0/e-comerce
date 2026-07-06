"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponsApi } from '@/lib/api/coupons'
import { useAuthStore } from '@/lib/store/auth.store'
import { Plus, Percent, Banknote, Gift, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPromotionsPage() {
    const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newType, setNewType] = useState<'PERCENT' | 'FIXED' | 'FREE_SHIPPING'>('PERCENT')
  const [newValue, setNewValue] = useState('')
  const [newMinAmount, setNewMinAmount] = useState('')
  const [newMaxUses, setNewMaxUses] = useState('')
  const [newExpiryDate, setNewExpiryDate] = useState('')

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-coupons'],
    queryFn: () => couponsApi.getAll(),
    enabled: true,
  })

  const coupons = (data as any)?.data ?? []

  const createMutation = useMutation({
    mutationFn: (body: any) => couponsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon créé')
      setShowCreate(false)
      setNewCode(''); setNewValue(''); setNewMinAmount(''); setNewMaxUses(''); setNewExpiryDate('')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCode || !newValue) {
      toast.error('Code et valeur requis')
      return
    }
    createMutation.mutate({
      code: newCode.toUpperCase(),
      type: newType,
      value: parseFloat(newValue),
      minAmount: newMinAmount ? parseFloat(newMinAmount) : undefined,
      maxUses: newMaxUses ? parseInt(newMaxUses, 10) : undefined,
      expiryDate: newExpiryDate || undefined,
    })
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Promotions & Coupons</h1>
          <p className="text-sm text-gray-500">{coupons.filter((c: any) => c.isActive).length} coupons actifs</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 self-start rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors">
          <Plus size={16} /> Nouveau coupon
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-bold text-brand-primary">Nouveau coupon</h3>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Code *</label>
              <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all font-mono uppercase" placeholder="PROMO20" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Type</label>
                <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all">
                  <option value="PERCENT">Pourcentage</option>
                  <option value="FIXED">Montant fixe</option>
                  <option value="FREE_SHIPPING">Livraison gratuite</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Valeur *</label>
                <input type="number" value={newValue} onChange={e => setNewValue(e.target.value)} min={0} step={newType === 'PERCENT' ? '1' : '0.01'} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" placeholder={newType === 'PERCENT' ? '20' : '10.00'} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Montant min.</label>
                <input type="number" value={newMinAmount} onChange={e => setNewMinAmount(e.target.value)} min={0} step="0.01" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" placeholder="50.00" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Utilisations max.</label>
                <input type="number" value={newMaxUses} onChange={e => setNewMaxUses(e.target.value)} min={1} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" placeholder="100" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Date d'expiration</label>
              <input type="date" value={newExpiryDate} onChange={e => setNewExpiryDate(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
              <button type="submit" disabled={createMutation.isPending} className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors disabled:opacity-50">
                {createMutation.isPending ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

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

