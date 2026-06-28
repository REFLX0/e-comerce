'use client'

import { useQuery } from '@tanstack/react-query'
import { reviewsApi } from '@/lib/api/reviews'
import { RatingStars } from '../common/RatingStars'
import { formatDate } from '@/lib/utils/format'
import type { Review } from '@/lib/types'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store/auth.store'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Veuillez sélectionner une note').max(5),
  comment: z.string().min(10, 'Votre avis doit contenir au moins 10 caractères').max(500, 'Votre avis est trop long'),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface Props {
  productId: string
  rating: number
  reviewCount: number
}

export function ReviewsSection({ productId, rating, reviewCount }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  const { data: reviews, isLoading, refetch } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.getByProduct(productId),
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
    }
  })

  const currentRating = watch('rating')

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true)
    try {
      // API call to add review would go here
      // await reviewsApi.addReview(productId, data)
      await new Promise(r => setTimeout(r, 1000)) // Simulation
      toast.success('Votre avis a été publié avec succès !')
      setShowForm(false)
      reset()
      refetch()
    } catch (error) {
      toast.error('Une erreur est survenue lors de la publication de votre avis.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

        {!showForm ? (
          <button 
            onClick={() => {
              if (isAuthenticated) {
                setShowForm(true)
              } else {
                toast.error('Vous devez être connecté pour rédiger un avis.')
              }
            }}
            className="w-full btn-secondary"
          >
            Rédiger un avis
          </button>
        ) : (
          <div className="bg-brand-surface p-6 rounded-2xl border border-brand-surface-dark mt-6">
            <h4 className="font-bold text-brand-primary mb-4">Votre avis</h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue('rating', star, { shouldValidate: true })}
                      className="focus:outline-none"
                    >
                      <svg 
                        className={`w-6 h-6 ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {errors.rating && <span className="text-xs text-red-500 mt-1">{errors.rating.message}</span>}
              </div>
              
              <div>
                <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                <textarea 
                  id="review-comment"
                  {...register('comment')}
                  rows={4}
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-brand-accent outline-none resize-none ${
                    errors.comment ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                  }`}
                  placeholder="Partagez votre expérience..."
                />
                {errors.comment && <span className="text-xs text-red-500 mt-1 block">{errors.comment.message}</span>}
              </div>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false)
                    reset()
                  }} 
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 btn-primary text-sm py-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Envoi...' : 'Publier'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="lg:col-span-2 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-24 bg-brand-surface rounded-xl animate-pulse" />
            <div className="h-24 bg-brand-surface rounded-xl animate-pulse" />
          </div>
        ) : reviews?.data && reviews.data.length > 0 ? (
          reviews.data.map((review: Review) => (
            <div key={review.id} className="border-b border-brand-surface-dark pb-6 last:border-0">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-brand-primary">{review.authorName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={review.rating} size={14} />
                    <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>
              
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
