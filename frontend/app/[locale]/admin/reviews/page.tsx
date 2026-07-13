"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { Star, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function AdminReviewsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-reviews'],
    queryFn: () => adminApi.getReviews({ page: 1, limit: 50 }),
  })

  const reviews: any[] = (data as any)?.data ?? []

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
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Avis Clients</h1>
          <p className="text-sm text-gray-500">{reviews.length} avis reçus</p>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">Chargement...</div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Aucun avis trouvé</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-start gap-4">

                {/* Product Info */}
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

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-brand-primary ml-2">{review.authorName}</span>
                    <span className="text-xs text-gray-400">• {new Date(review.createdAt).toLocaleDateString('fr-TN')}</span>
                    {review.user?.email && (
                      <span className="text-xs text-gray-400">• {review.user.email}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">"{review.comment}"</p>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {review.isApproved ? 'Approuvé' : 'En attente'}
                  </span>

                  <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: review.id, isApproved: !review.isApproved })}
                      disabled={updateStatusMutation.isPending}
                      className={`rounded-lg p-2 transition-colors ${review.isApproved ? 'text-yellow-500 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                      title={review.isApproved ? 'Masquer' : 'Approuver'}
                    >
                      {review.isApproved ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    </button>
                    <button
                      onClick={() => { if (confirm('Supprimer cet avis définitivement ?')) deleteMutation.mutate(review.id) }}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
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
