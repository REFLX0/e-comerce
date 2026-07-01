import { Star, StarHalf } from 'lucide-react'

interface Props {
  rating: number
  count?: number
  size?: number
}

export function RatingStars({ rating, count, size = 16 }: Props) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center gap-1">
      <div className="text-brand-accent flex">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} size={size} fill="currentColor" />
        ))}
        {hasHalfStar && <StarHalf size={size} fill="currentColor" />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-gray-300" />
        ))}
      </div>
      {count !== undefined && <span className="ml-1 text-sm text-gray-500">({count})</span>}
    </div>
  )
}
