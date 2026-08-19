"use client";

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
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

interface Props {
  productId: string
  rating: number
  reviewCount: number
}

export function ReviewsSection({ productId, rating, reviewCount }: Props) {
  const t = useTranslations('Product')
  const reviewSchema = z.object({
    rating: z.number().min(1, t('ratingRequired')).max(5),
    comment: z
      .string()
      .min(10, t('reviewMinLength'))
      .max(500, t('reviewTooLong')),
  })

  type ReviewFormData = z.infer<typeof reviewSchema>
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const {
    data: reviews,
    isLoading,
    refetch,
  } = useQuery({
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
    },
  })

  const currentRating = watch('rating')

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true)
    try {
      await reviewsApi.create(productId, data)
      
      toast.success(t('reviewSubmitted'))
      setShowForm(false)
      reset()
      refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la publication de votre avis.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
      {/* Summary */}
      <div className="lg:col-span-1">
        <h3 className="font-display text-brand-primary mb-6 text-xl font-bold">{t('clientReviews')}</h3>
        <div className="mb-8 flex items-center gap-4">
          <div className="text-brand-primary text-5xl font-bold">{rating.toFixed(1)}</div>
          <div>
            <RatingStars rating={rating} count={reviewCount} size={20} />
            <p className="mt-1 text-sm text-gray-500">{t('basedOn', { count: reviewCount })}</p>
          </div>
        </div>

        <p className="mb-8 text-sm leading-6 text-gray-500">{t('verifiedOnly')}</p>

        {!showForm ? (
          <button
            onClick={() => {
              if (isAuthenticated) {
                setShowForm(true)
              } else {
                toast.error(t('loginRequired'))
              }
            }}
            className="btn-secondary w-full"
          >
            {t('writeReview')}
          </button>
        ) : (
          <div className="bg-brand-surface border-brand-surface-dark mt-6 rounded-2xl border p-6">
            <h4 className="text-brand-primary mb-4 font-bold">{t('yourReview')}</h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t('rating')}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue('rating', star, { shouldValidate: true })}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`h-6 w-6 ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <span className="mt-1 text-xs text-red-500">{errors.rating.message}</span>
                )}
              </div>

              <div>
                <label
                  htmlFor="review-comment"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  {t('comment')}
                </label>
                <textarea
                  id="review-comment"
                  {...register('comment')}
                  rows={4}
                  className={`focus:ring-brand-primary/30 w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 ${
                    errors.comment
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-transparent'
                  }`}
                  placeholder={t('reviewPlaceholder')}
                />
                {errors.comment && (
                  <span className="mt-1 block text-xs text-red-500">{errors.comment.message}</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    reset()
                  }}
                  className="btn-secondary flex-1 py-2 text-sm"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 py-2 text-sm disabled:opacity-50"
                >
                  {isSubmitting ? t('sending') : t('publish')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6 lg:col-span-2">
        {isLoading ? (
          <div className="space-y-4">
            <div className="bg-brand-surface h-24 animate-pulse rounded-xl" />
            <div className="bg-brand-surface h-24 animate-pulse rounded-xl" />
          </div>
        ) : reviews?.data && reviews.data.length > 0 ? (
          reviews.data.map((review: Review) => (
            <div key={review.id} className="border-brand-surface-dark border-b pb-6 last:border-0">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h4 className="text-brand-primary font-semibold">{review.authorName}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <RatingStars rating={review.rating} size={14} />
                    <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-gray-600">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">
            {t('noReviews')}
          </p>
        )}
      </div>
    </div>
  )
}
