"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { Star, CheckCircle2, XCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function AdminReviewsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const limit = 20

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ['admin-reviews', page],
    queryFn: () => adminApi.getReviews({ page, limit }),
  })

  const raw = (data as any)?.data ?? data ?? {}
  const reviews: any[] = Array.isArray(raw) ? raw : raw.data ?? []
  const total = raw.total ?? reviews.length
  const totalPages = raw.totalPages ?? Math.ceil(total / limit)

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      adminApi.updateReviewStatus(id, isApproved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Statut mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Avis supprimé')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Avis Clients</h1>
          <p className="text-sm text-gray-500">{total} avis reçus</p>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-primary mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-6">Voulez-vous vraiment supprimer cet avis définitivement ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
              <button onClick={() => deleteMutation.mutate(deleteTarget)} disabled={deleteMutation.isPending} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-700">Erreur de chargement. <button onClick={() => window.location.reload()} className="font-semibold underline">Réessayer</button></div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">Chargement...</div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Aucun avis trouvé</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {review.product && (
                  <div className="flex shrink-0 items-center gap-3 w-48 border-r border-gray-100 pr-4">
                    {review.product.images?.[0]?.url ? (
                      <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-gray-100">
                        <Image src={review.product.images[0].url} alt={review.product.nameFr} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-50 border border-gray-100" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-gray-700" title={review.product.nameFr}>{review.product.nameFr}</p>
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-brand-primary ml-2">{review.authorName}</span>
                    <span className="text-xs text-gray-400">• {review.createdAt ? new Date(review.createdAt).toLocaleDateString('fr-TN') : '—'}</span>
                    {review.user?.email && <span className="text-xs text-gray-400">• {review.user.email}</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">"{review.comment}"</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {review.isApproved ? 'Approuvé' : 'En attente'}
                  </span>
                  <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                    <button onClick={() => updateStatusMutation.mutate({ id: review.id, isApproved: !review.isApproved })} disabled={updateStatusMutation.isPending} className={`rounded-lg p-2 transition-colors ${review.isApproved ? 'text-yellow-500 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`} title={review.isApproved ? 'Masquer' : 'Approuver'}>
                      {review.isApproved ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    </button>
                    <button onClick={() => setDeleteTarget(review.id)} disabled={deleteMutation.isPending} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Supprimer">
                      <Trash2 size={18} />
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
