"use client";

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  title?: string
  message?: string
  onRetry?: () => void
  /** Show technical detail only when explicitly needed */
  detail?: string
}

export function ErrorState({
  title,
  message,
  onRetry,
  detail,
}: Props) {
  const t = useTranslations('Common')
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
        {title ?? t('errorTitle')}
      </h3>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-gray-500">
        {message ?? t('errorMessage')}
      </p>

      {/* Technical detail (collapsed by default) */}
      {detail && (
        <details className="mb-6 max-w-sm">
          <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">
            {t('showTechDetails')}
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
          {t('retry')}
        </button>
      )}
    </div>
  )
}
