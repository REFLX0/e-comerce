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
      <div className="flex text-brand-accent">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} size={size} fill="currentColor" />
        ))}
        {hasHalfStar && <StarHalf size={size} fill="currentColor" />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-gray-300" />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-sm text-gray-500 ml-1">({count})</span>
      )}
    </div>
  )
}
