"use client";

import { Link } from '@/i18n/routing'
import dynamic from 'next/dynamic'
const MiniCart = dynamic(() => import('./MiniCart'), { ssr: false })
const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false })
import { GlobalSearch } from './GlobalSearch'
import { CategoryNav } from './CategoryNav'
import { useAuthStore } from '@/lib/store/auth.store'
// Logo is served directly from public/logo.jpg
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useHasMounted } from '@/lib/hooks/useHasMounted'

export default function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const hasMounted = useHasMounted()
  const t = useTranslations('Navigation')

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* ── Main Bar ──────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white py-3 shadow-sm">
        <div className="section-padding flex items-center gap-4 md:gap-6">
          {/* Mobile menu */}
          <MobileMenu />

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="specpart"
              className="h-12 w-auto object-contain sm:h-16 md:h-20 lg:h-20"
            />
          </Link>

          {/* Search — Desktop (more prominent) */}
          <div className="hidden flex-1 md:flex md:justify-center">
            <div className="w-full max-w-xl">
              <GlobalSearch />
            </div>
          </div>

          {/* Right icons */}
          <div className="ms-auto flex shrink-0 items-center gap-2">
            <LanguageSwitcher />

            <Link
              href={hasMounted && isAuthenticated ? (user?.role?.toUpperCase() === 'ADMIN' ? '/admin' : '/compte') : '/auth/login'}
              className="hidden h-10 px-3.5 items-center justify-center rounded-xl bg-brand-primary text-white font-medium text-sm transition-all duration-200 hover:bg-brand-primary-light sm:flex gap-2.5 shadow-sm"
              aria-label={t('account')}
              title={user?.role?.toUpperCase() === 'ADMIN' ? 'Admin' : t('account')}
            >
              {hasMounted && isAuthenticated && user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.firstName || 'Compte'}
                  className="h-6 w-6 rounded-full object-cover ring-1 ring-white/30"
                />
              ) : null}
              <span>{hasMounted && isAuthenticated ? (user?.firstName || t('account')) : t('signIn')}</span>
            </Link>

            <MiniCart />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar — always visible below main row */}
      <div className="border-b border-gray-100 bg-white lg:hidden">
        <div className="section-padding pb-3">
          <GlobalSearch className="max-w-none" />
        </div>
      </div>

      <CategoryNav />
    </header>
  )
}
