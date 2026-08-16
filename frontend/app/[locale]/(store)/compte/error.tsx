"use client";

import { useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { AlertCircle, RefreshCw, User } from 'lucide-react'

export default function CompteError({
  error,
  reset,
}: {
  error: Error & { digest?: string; requestId?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Compte Error Boundary]', error, { requestId: error?.requestId || null })
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-500">
          <AlertCircle size={32} />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Une erreur s'est produite
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Votre espace client a rencontré un problème inattendu.
          {(error.digest || error.requestId) && (
            <span className="mt-2 block font-mono text-xs text-gray-400">
              Réf: {error.digest} {error.requestId ? ` / Req: ${error.requestId.slice(0,8)}` : ''}
            </span>
          )}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-light transition-all"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
          <Link
            href="/compte"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            <User size={16} />
            Mon compte
          </Link>
        </div>
      </div>
    </div>
  )
}
