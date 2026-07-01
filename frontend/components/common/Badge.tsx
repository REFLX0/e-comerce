import { Badge as ShadcnBadge } from '@/components/ui/badge'

interface Props {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: Props) {
  let variantClass = ''

  if (variant === 'success') {
    variantClass = 'bg-green-100 text-green-800 hover:bg-green-100'
  } else if (variant === 'warning') {
    variantClass = 'bg-orange-100 text-orange-800 hover:bg-orange-100'
  }

  return (
    <ShadcnBadge
      variant={variant === 'success' || variant === 'warning' ? 'default' : variant}
      className={`${variantClass} ${className}`}
    >
      {children}
    </ShadcnBadge>
  )
}
