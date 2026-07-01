import { Link } from '@/i18n/routing'
import { PackageSearch } from 'lucide-react'

interface Props {
  icon?: React.ReactNode
  title?: string
  message: string
  action?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  secondaryAction,
}: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
      role="status"
      aria-live="polite"
    >
      {/* Icon container with layered rings */}
      <div className="relative mb-8">
        <div className="bg-brand-primary/[0.03] absolute inset-0 m-auto h-28 w-28 rounded-full" />
        <div className="bg-brand-primary/[0.05] absolute inset-2 m-auto h-24 w-24 rounded-full" />
        <div className="border-brand-primary/10 relative flex h-20 w-20 items-center justify-center rounded-full border bg-white shadow-sm">
          <div className="text-brand-primary/30">
            {icon || <PackageSearch size={36} />}
          </div>
        </div>
      </div>

      {/* Text */}
      {title && (
        <h3 className="font-display text-brand-primary mb-2 text-xl font-semibold tracking-tight">
          {title}
        </h3>
      )}
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-gray-500">
        {message}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          {action &&
            (action.href ? (
              <Link href={action.href} className="btn-primary text-sm">
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="btn-primary text-sm"
                type="button"
              >
                {action.label}
              </button>
            ))}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="text-brand-primary/60 hover:text-brand-primary text-sm transition-colors"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="text-brand-primary/60 hover:text-brand-primary text-sm transition-colors"
                type="button"
              >
                {secondaryAction.label}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
