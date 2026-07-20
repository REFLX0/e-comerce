"use client";

import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('NotFound')

  return (
    <main className="bg-brand-surface flex min-h-screen flex-col items-center justify-center px-4">
      {/* Background decorative elements */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="bg-brand-accent/5 absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full blur-3xl" />
        <div className="bg-brand-primary/5 absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Large 404 display */}
        <div className="relative mb-8">
          <span
            className="text-brand-primary/[0.06] select-none text-[200px] font-black leading-none tracking-tighter"
            aria-hidden="true"
          >
            404
          </span>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Oil drop icon */}
            <div className="bg-brand-primary/10 border-brand-primary/20 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-brand-primary h-10 w-10"
                aria-hidden="true"
              >
                <path
                  d="M24 6C24 6 10 20 10 30C10 37.7 16.3 44 24 44C31.7 44 38 37.7 38 30C38 20 24 6 24 6Z"
                  fill="currentColor"
                  opacity="0.3"
                />
                <path
                  d="M24 6C24 6 10 20 10 30C10 37.7 16.3 44 24 44C31.7 44 38 37.7 38 30C38 20 24 6 24 6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 33C17.5 36 20 38.5 23 39"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Copy */}
        <h1 className="font-display text-brand-primary mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mx-auto mb-2 max-w-md text-base leading-relaxed text-gray-500">
          {t('subtitle')}
        </p>
        <p className="mb-10 text-sm text-gray-400">{t('errorCode')}</p>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="bg-brand-primary hover:bg-brand-primary-light inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
          >
            <Home size={16} />
            {t('goHome')}
          </Link>
          <Link
            href="/catalogue"
            className="border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
          >
            <Search size={16} />
            {t('viewCatalog')}
          </Link>
        </div>

        {/* Quick links */}
        <div className="border-brand-border mt-12 border-t pt-8">
          <p className="mb-4 text-xs font-medium tracking-widest text-gray-400 uppercase">
            {t('usefulLinks')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { labelKey: 'catalog', href: '/catalogue' },
              { labelKey: 'contact', href: '/contact' },
              { labelKey: 'faq', href: '/faq' },
              { labelKey: 'account', href: '/compte' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brand-primary/60 hover:text-brand-primary text-sm transition-colors duration-150"
              >
                {t(`links.${link.labelKey}`)}
              </Link>
            ))}
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600"
          type="button"
        >
          <ArrowLeft size={14} />
          {t('goBack')}
        </button>
      </div>
    </main>
  )
}
