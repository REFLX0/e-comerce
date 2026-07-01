import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  title?: string
  message?: string
  onRetry?: () => void
  /** Show technical detail only when explicitly needed */
  detail?: string
}

export function ErrorState({
  title = 'Oups ! Quelque chose s\'est mal passé',
  message = 'Une erreur est survenue lors du chargement des données. Veuillez réessayer.',
  onRetry,
  detail,
}: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
      role="alert"
      aria-live="assertive"
    >
      {/* Icon with pulse ring */}
      <div className="relative mb-8">
        <div className="absolute inset-0 m-auto h-24 w-24 animate-ping rounded-full bg-red-100 opacity-50" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-red-200 bg-red-50">
          <AlertTriangle size={36} className="text-red-500" />
        </div>
      </div>

      {/* Text */}
      <h3 className="font-display text-brand-primary mb-2 text-xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-gray-500">
        {message}
      </p>

      {/* Technical detail (collapsed by default) */}
      {detail && (
        <details className="mb-6 max-w-sm">
          <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">
            Afficher les détails techniques
          </summary>
          <p className="mt-2 rounded-lg bg-gray-50 px-4 py-3 text-left font-mono text-xs break-all text-gray-500">
            {detail}
          </p>
        </details>
      )}

      {/* Retry action */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
          type="button"
        >
          <RefreshCw size={15} />
          Réessayer
        </button>
      )}
    </div>
  )
}
