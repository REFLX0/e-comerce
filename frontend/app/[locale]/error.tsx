"use client";

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/routing'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Common')
  const notFoundT = useTranslations('NotFound')
  const [requestId, setRequestId] = useState<string | null>(null)

  useEffect(() => {
    // Attempt to extract the request ID from the document if the page crashed
    // after the initial HTML was sent, or from the error object if available
    // Next.js sometimes attaches headers to errors in server actions/layouts
    const reqId = (error as any)?.requestId || null
    if (reqId) setRequestId(reqId)

    // Log to error tracking service in production
    console.error('[Error Boundary]', error, { requestId: reqId })
  }, [error])

  return (
    <main className="bg-brand-surface flex min-h-screen flex-col items-center justify-center px-4">
      {/* Background decorative elements */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-red-500/5 blur-3xl" />
        <div className="bg-brand-primary/5 absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl text-center">
        {/* Error icon */}
        <div className="relative mb-8">
          <span
            className="select-none text-[160px] font-black leading-none tracking-tighter text-red-500/[0.07]"
            aria-hidden="true"
          >
            500
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
              <AlertCircle size={40} className="text-red-500" />
            </div>
          </div>
        </div>

        {/* Copy */}
        <h1 className="font-display text-brand-primary mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {t('errorTitle')}
        </h1>
        <p className="mx-auto mb-2 max-w-md text-base leading-relaxed text-gray-500">
          {t('errorDesc')}
        </p>
        <p className="mb-10 text-sm text-gray-400">
          {t('errorHint')}
          {(error.digest || requestId) && (
            <span className="text-brand-primary/40 mt-2 block font-mono text-xs">
              {t('refPrefix')} {error.digest} {requestId ? ` / ${t('reqPrefix')} ${requestId.slice(0,8)}` : ''}
            </span>
          )}
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="bg-brand-primary hover:bg-brand-primary-light inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
            type="button"
          >
            <RefreshCw size={16} />
            {t('retry')}
          </button>
          <Link
            href="/"
            className="border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
          >
            <Home size={16} />
            {notFoundT('goHome')}
          </Link>
        </div>

        {/* Status indicator */}
        <div className="mt-12 flex items-center justify-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
          <p className="text-xs text-gray-400">{t('teamsNotified')}</p>
        </div>
      </div>
    </main>
  )
}
