import { AlertTriangle } from 'lucide-react'

interface Props {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Une erreur est survenue lors du chargement des données.', onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-red-500/20 mb-4">
        <AlertTriangle size={64} className="text-red-500" />
      </div>
      <h3 className="font-display font-semibold text-xl text-brand-primary mb-2">
        Oups ! Quelque chose s'est mal passé
      </h3>
      <p className="text-gray-500 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Réessayer
        </button>
      )}
    </div>
  )
}
