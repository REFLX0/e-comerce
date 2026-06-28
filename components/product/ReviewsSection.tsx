'use client'

import { useQuery } from '@tanstack/react-query'
import { reviewsApi } from '@/lib/api/reviews'
import { RatingStars } from '../common/RatingStars'
import { formatDate } from '@/lib/utils/format'

interface Props {
  productId: string
  rating: number
  reviewCount: number
}

export function ReviewsSection({ productId, rating, reviewCount }: Props) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.getByProduct(productId),
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Summary */}
      <div className="lg:col-span-1">
        <h3 className="text-xl font-display font-bold text-brand-primary mb-6">Avis Clients</h3>
        <div className="flex items-center gap-4 mb-8">
          <div className="text-5xl font-bold text-brand-primary">{rating.toFixed(1)}</div>
          <div>
            <RatingStars rating={rating} count={reviewCount} size={20} />
            <p className="text-sm text-gray-500 mt-1">Basé sur {reviewCount} avis</p>
          </div>
        </div>
        
        {/* Progress bars (simplified) */}
        <div className="space-y-3 mb-8">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center gap-3 text-sm">
              <span className="w-12 text-gray-500">{stars} étoiles</span>
              <div className="flex-1 h-2 bg-brand-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 5 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <button className="w-full btn-secondary">
          Rédiger un avis
        </button>
      </div>

      {/* Reviews List */}
      <div className="lg:col-span-2 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-24 bg-brand-surface rounded-xl animate-pulse" />
            <div className="h-24 bg-brand-surface rounded-xl animate-pulse" />
          </div>
        ) : reviews?.data && reviews.data.length > 0 ? (
          reviews.data.map((review: any) => (
            <div key={review.id} className="border-b border-brand-surface-dark pb-6 last:border-0">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-brand-primary">{review.userName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={review.rating} size={14} />
                    <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              {review.title && (
                <h5 className="font-medium text-brand-primary mb-2">{review.title}</h5>
              )}
              <p className="text-gray-600 text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">Aucun avis pour ce produit pour le moment. Soyez le premier à donner votre avis !</p>
        )}
      </div>
    </div>
  )
}
