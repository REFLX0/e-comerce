"use client";

import { Link } from '@/i18n/routing'
import { PackageSearch, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('Common')
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
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-500">
        {message}
      </p>

      <div className="mb-8 max-w-sm rounded-xl border border-brand-primary/10 bg-brand-primary/5 p-4 text-sm text-brand-primary shadow-sm flex flex-col gap-3 text-left">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-brand-primary shadow-sm">
            <Phone size={16} />
          </div>
          <div>
            <strong className="block font-bold">{t('notFoundPartTitle')}</strong>
            <span className="opacity-90 leading-snug block mt-1">{t('notFoundPartHint')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-brand-primary/10">
          <a
            href="tel:+21629294195"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#001E3C] px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#002B56] transition active:scale-95"
          >
            <Phone size={13} />
            +216 29 294 195
          </a>
          <Link
            href="/contact"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-primary/20 bg-white px-3 py-2 text-xs font-bold text-brand-primary shadow-xs hover:bg-slate-50 transition active:scale-95"
          >
            Demander au magasin
          </Link>
        </div>
      </div>

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
