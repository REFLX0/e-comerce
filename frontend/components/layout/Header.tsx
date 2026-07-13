"use client";

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { User } from 'lucide-react'
import dynamic from 'next/dynamic'
const MiniCart = dynamic(() => import('./MiniCart'), { ssr: false })
const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false })
import { GlobalSearch } from './GlobalSearch'
import { MobileSearchSheet } from './MobileSearchSheet'
import { CategoryNav } from './CategoryNav'
import { useAuthStore } from '@/lib/store/auth.store'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useHasMounted } from '@/lib/hooks/useHasMounted'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated, user } = useAuthStore()
  const hasMounted = useHasMounted()
  const t = useTranslations('Navigation')
  const tLayout = useTranslations('Layout')

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* ── Announcement Bar (hides on scroll) ────────────────────── */}
      <div className={`overflow-hidden bg-[#0B0B0C] text-center text-xs font-medium tracking-wide text-white/70 transition-all duration-300 ${
        isScrolled ? 'max-h-0 py-0' : 'max-h-12 py-2'
      }`}>
        <p>{tLayout.rich('freeShipping', { bold: (chunks) => <span className="font-bold text-white">{chunks}</span> })}</p>
      </div>

      {/* ── Main Bar ──────────────────────────────────────────────── */}
      <div className={`border-b border-gray-100 bg-white transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-3'
      }`}>
        <div className="section-padding flex items-center gap-4 md:gap-8">
          {/* Mobile menu */}
          <MobileMenu />

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center group">
            <Image
              src="/logo.png"
              alt="KiosqueTN"
              width={140}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search — Desktop */}
          <div className="hidden flex-1 md:block">
            <GlobalSearch />
          </div>

          {/* Right icons */}
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <LanguageSwitcher />
            <MobileSearchSheet />

            <Link
              href={hasMounted && isAuthenticated ? (user?.role?.toUpperCase() === 'ADMIN' ? '/admin' : '/compte') : '/auth/login'}
              className="hidden h-10 w-10 items-center justify-center rounded-lg text-[#111] transition-colors hover:bg-gray-100 sm:flex"
              aria-label={t('account')}
              title={user?.role?.toUpperCase() === 'ADMIN' ? 'Admin' : t('account')}
            >
              <User size={20} strokeWidth={1.8} />
            </Link>

            <MiniCart />
          </div>
        </div>
      </div>

      <CategoryNav />
    </header>
  )
}
