"use client";

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { User, MapPin, Clock, Phone } from 'lucide-react'
import dynamic from 'next/dynamic'
const MiniCart = dynamic(() => import('./MiniCart'), { ssr: false })
const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false })
import { GlobalSearch } from './GlobalSearch'
import { CategoryNav } from './CategoryNav'
import { useAuthStore } from '@/lib/store/auth.store'
import { useSiteLogo } from '@/lib/hooks/useSiteLogo'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useHasMounted } from '@/lib/hooks/useHasMounted'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const hasMounted = useHasMounted()
  const siteLogo = useSiteLogo()
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
      <div className={`overflow-hidden bg-brand-primary text-xs font-medium tracking-wide text-white/90 transition-all duration-300 ${
        isScrolled ? 'max-h-0 py-0' : 'max-h-12 py-2.5'
      }`}>
        <div className="section-padding flex items-center justify-center gap-6 md:justify-between flex-wrap">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-white/70" />
            <span>{tLayout('announcementShipping')}</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-white/70" />
              <span>Lun-Sam 8h-18h</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-white/70" />
              <a href="tel:+21629294195" className="hover:text-white transition-colors">+216 29 294 195</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Bar ──────────────────────────────────────────────── */}
      <div className={`border-b border-gray-100 bg-white shadow-sm transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-3'
      }`}>
        <div className="section-padding flex items-center gap-4 md:gap-6">
          {/* Mobile menu */}
          <MobileMenu />

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center group">
            <Image
              src={siteLogo}
              alt="specpart"
              width={220}
              height={60}
              className="h-12 w-auto object-contain md:h-16"
              priority
            />
          </Link>

          {/* Search — Desktop (more prominent) */}
          <div className="hidden flex-1 md:flex md:justify-center">
            <div className="w-full max-w-xl">
              <GlobalSearch />
            </div>
          </div>

          {/* Right icons */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <LanguageSwitcher />

            <Link
              href={hasMounted && isAuthenticated ? (user?.role?.toUpperCase() === 'ADMIN' ? '/admin' : '/compte') : '/auth/login'}
              className="hidden h-10 px-4 items-center justify-center rounded-lg bg-brand-primary text-white font-medium text-sm transition-all duration-200 hover:bg-brand-primary-light sm:flex gap-2"
              aria-label={t('account')}
              title={user?.role?.toUpperCase() === 'ADMIN' ? 'Admin' : t('account')}
            >
              {hasMounted && isAuthenticated ? t('account') : t('signIn')}
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
