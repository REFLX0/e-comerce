"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponsApi } from '@/lib/api/coupons'
import { useAuthStore } from '@/lib/store/auth.store'
import { Plus, Percent, Banknote, Gift, Trash2, ToggleLeft, ToggleRight, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPromotionsPage() {
    const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newType, setNewType] = useState<'PERCENT' | 'FIXED' | 'SHIPPING'>('PERCENT')
  const [newValue, setNewValue] = useState('')
  const [newMinAmount, setNewMinAmount] = useState('')
  const [newMaxUses, setNewMaxUses] = useState('')
  const [newExpiryDate, setNewExpiryDate] = useState('')

  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [editCode, setEditCode] = useState('')
  const [editType, setEditType] = useState<'PERCENT' | 'FIXED' | 'SHIPPING'>('PERCENT')
  const [editValue, setEditValue] = useState('')
  const [editMinAmount, setEditMinAmount] = useState('')
  const [editMaxUses, setEditMaxUses] = useState('')
  const [editExpiryDate, setEditExpiryDate] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED'>('ALL')
  const limit = 20

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ['admin-coupons', page],
    queryFn: () => couponsApi.getAll({ page, limit }),
  })

  const raw = (data as any)?.data ?? data ?? []
  const allCoupons: any[] = Array.isArray(raw) ? raw : raw.data ?? []
  const total = raw.total ?? allCoupons.length
  const totalPages = raw.totalPages ?? Math.ceil(total / limit)

  const coupons = allCoupons.filter((c: any) => {
    if (statusFilter === 'ACTIVE') return c.isActive && (!c.expiryDate || new Date(c.expiryDate) > new Date())
    if (statusFilter === 'INACTIVE') return !c.isActive
    if (statusFilter === 'EXPIRED') return c.expiryDate && new Date(c.expiryDate) <= new Date()
    return true
  })

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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => couponsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon mis à jour')
      setEditingCoupon(null)
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
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

      {/* Status filter */}
      <div className="flex gap-2">
        {(['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED'] as const).map(status => (
          <button key={status} onClick={() => { setStatusFilter(status); setPage(1) }} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${statusFilter === status ? 'bg-brand-primary text-white' : 'bg-white text-gray-500 hover:text-brand-primary border border-gray-200'}`}>
            {status === 'ALL' ? 'Tous' : status === 'ACTIVE' ? 'Actifs' : status === 'INACTIVE' ? 'Inactifs' : 'Expirés'}
          </button>
        ))}
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
                  <option value="SHIPPING">Livraison gratuite</option>
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

      {/* Edit modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editingCoupon.id, data: { code: editCode.toUpperCase(), type: editType, value: parseFloat(editValue), minAmount: editMinAmount ? parseFloat(editMinAmount) : undefined, maxUses: editMaxUses ? parseInt(editMaxUses, 10) : undefined, expiryDate: editExpiryDate || undefined } }) }} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-bold text-brand-primary">Modifier le coupon</h3>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Code</label>
              <input type="text" value={editCode} onChange={e => setEditCode(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all font-mono uppercase" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Type</label>
                <select value={editType} onChange={e => setEditType(e.target.value as any)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all">
                  <option value="PERCENT">Pourcentage</option>
                  <option value="FIXED">Montant fixe</option>
                  <option value="SHIPPING">Livraison gratuite</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Valeur</label>
                <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} min={0} step={editType === 'PERCENT' ? '1' : '0.01'} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Montant min.</label>
                <input type="number" value={editMinAmount} onChange={e => setEditMinAmount(e.target.value)} min={0} step="0.01" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Utilisations max.</label>
                <input type="number" value={editMaxUses} onChange={e => setEditMaxUses(e.target.value)} min={1} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Date d'expiration</label>
              <input type="date" value={editExpiryDate} onChange={e => setEditExpiryDate(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditingCoupon(null)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
              <button type="submit" disabled={updateMutation.isPending} className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors disabled:opacity-50">
                {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-brand-primary mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-6">Voulez-vous vraiment supprimer ce coupon ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
              <button onClick={() => { deleteMutation.mutate(deleteConfirm); setDeleteConfirm(null) }} disabled={deleteMutation.isPending} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon list */}
      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-700">Erreur de chargement. Essayez de rafraîchir la page.</div>
      )}

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
                      onClick={() => {
                        setEditingCoupon(c)
                        setEditCode(c.code)
                        setEditType(c.type)
                        setEditValue(String(c.value))
                        setEditMinAmount(c.minAmount ? String(c.minAmount) : '')
                        setEditMaxUses(c.maxUses ? String(c.maxUses) : '')
                        setEditExpiryDate(c.expiryDate ? c.expiryDate.split('T')[0] : '')
                      }}
                      className="rounded-xl p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleMutation.mutate(c.id)}
                      className={`rounded-xl p-2 transition-colors ${c.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={c.isActive ? 'Désactiver' : 'Activer'}
                    >
                      {c.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(c.id)}
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

