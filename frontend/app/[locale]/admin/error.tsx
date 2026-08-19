"use client";

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Admin')
  const [requestId, setRequestId] = useState<string | null>(null)

  useEffect(() => {
    const reqId = (error as any)?.requestId || null
    if (reqId) setRequestId(reqId)
    console.error('[Admin Error Boundary]', error, { requestId: reqId })
  }, [error])

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-500">
          <AlertCircle size={32} />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          {t('errorTitle')}
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          {t('errorDesc')}
          {(error.digest || requestId) && (
            <span className="mt-2 block font-mono text-xs text-gray-400">
              {t('refPrefix')}: {error.digest} {requestId ? ` / ${t('reqPrefix')}: ${requestId.slice(0,8)}` : ''}
            </span>
          )}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-light transition-all"
          >
            <RefreshCw size={16} />
            {t('retry')}
          </button>
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            <LayoutDashboard size={16} />
            {t('dashboardBack')}
          </Link>
        </div>
      </div>
    </div>
  )
}
