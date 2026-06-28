'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh] p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-card border border-red-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-display font-bold text-brand-primary mb-3">
          Oups, une erreur est survenue !
        </h2>
        <p className="text-gray-500 mb-8">
          Nous sommes désolés, mais nous n'avons pas pu charger cette page. Veuillez réessayer.
        </p>
        <button
          onClick={() => reset()}
          className="btn-primary inline-flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Réessayer
        </button>
      </div>
    </div>
  )
}
