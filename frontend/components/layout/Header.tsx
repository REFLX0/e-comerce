"use client";

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { Search, User, ChevronDown, Zap } from 'lucide-react'
import dynamic from 'next/dynamic'
const MiniCart = dynamic(() => import('./MiniCart'), { ssr: false })
const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false })
import { useAuthStore } from '@/lib/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHoveringMenu, setIsHoveringMenu] = useState(false)
  const { isAuthenticated, user } = useAuthStore()
  const t = useTranslations('Navigation')

  const { data: categories } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-500 ${
      isScrolled
        ? 'bg-brand-primary/95 backdrop-blur-xl shadow-overlay border-b border-white/5'
        : 'bg-brand-primary shadow-none'
    }`}>

      {/* ── Top Utility Bar ──────────────────────────────────────────────── */}
      <div className="border-b border-white/8 bg-brand-primary-dark/60 py-2 text-xs text-white/60">
        <div className="section-padding flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-brand-accent" />
            <p className="hidden md:block tracking-wide">
              Livraison Gratuite à partir de <span className="text-brand-accent font-semibold">100 DT</span>
            </p>
            <p className="w-full text-center md:hidden tracking-wide">
              Livraison Gratuite dès <span className="text-brand-accent font-semibold">100 DT</span>
            </p>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/contact" className="hover:text-brand-accent transition-colors duration-200">
              {t('contact')}
            </Link>
            <Link href="/faq" className="hover:text-brand-accent transition-colors duration-200">
              FAQ
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Header ──────────────────────────────────────────────────── */}
      <div className="section-padding py-4">
        <div className="flex items-center justify-between gap-4 md:gap-8">

          {/* Logo + Mobile Menu */}
          <div className="flex items-center gap-3">
            <MobileMenu />
            <Link href="/" className="flex shrink-0 items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="KiosqueTN"
                width={140}
                height={40}
                className="h-9 w-auto object-contain brightness-0 invert group-hover:opacity-90 transition-opacity"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg hover:bg-white/8 transition-all duration-200"
            >
              {t('home')}
            </Link>

            {/* Mega Menu Trigger */}
            <div
              className="group relative"
              onMouseEnter={() => setIsHoveringMenu(true)}
              onMouseLeave={() => setIsHoveringMenu(false)}
            >
              <Link
                href="/catalogue"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg hover:bg-white/8 transition-all duration-200"
              >
                {t('catalog')}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isHoveringMenu ? 'rotate-180 text-brand-accent' : ''}`}
                />
              </Link>

              {/* Mega Menu Dropdown */}
              {isHoveringMenu && categories && categories.length > 0 && (
                <div className="animate-scale-in absolute top-full left-1/2 mt-2 w-[820px] -translate-x-1/2 rounded-2xl border border-white/10 bg-brand-primary/98 backdrop-blur-xl p-8 shadow-overlay">
                  {/* Gold accent top bar */}
                  <div className="mb-6 h-px bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent" />
                  <div className="grid grid-cols-3 gap-8">
                    {categories.slice(0, 6).map((category) => (
                      <div key={category.id} className="group/cat">
                        <Link
                          href={`/categorie/${category.slug}`}
                          className="font-display mb-3 block text-sm font-bold text-brand-accent hover:text-brand-accent/80 uppercase tracking-wider transition-colors"
                        >
                          {category.name}
                        </Link>
                        <ul className="space-y-1.5">
                          {category.children?.slice(0, 5).map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={`/categorie/${sub.slug}`}
                                className="block text-sm text-white/50 hover:text-white transition-colors duration-150 truncate"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                  <div className="mt-4 flex justify-center">
                    <Link href="/catalogue" className="text-xs font-semibold text-white/40 hover:text-brand-accent transition-colors tracking-widest uppercase">
                      Voir tout le catalogue →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/a-propos"
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg hover:bg-white/8 transition-all duration-200"
            >
              {t('about')}
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg hover:bg-white/8 transition-all duration-200"
            >
              {t('contact')}
            </Link>
          </nav>

          {/* Search Bar — Desktop */}
          <div className="relative hidden max-w-sm flex-1 lg:flex">
            <input
              type="text"
              placeholder={t('search') + "…"}
              className="w-full rounded-xl border border-white/10 bg-white/6 px-5 pr-12 py-2.5 text-sm text-white placeholder:text-white/30
                         transition-all duration-200 outline-none
                         focus:border-brand-accent/50 focus:bg-white/10 focus:ring-2 focus:ring-brand-accent/20"
              aria-label={t('search')}
            />
            <button
              className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-white/40 hover:text-brand-accent transition-colors"
              aria-label={t('search')}
            >
              <Search size={17} />
            </button>
          </div>

          {/* Icons */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <LanguageSwitcher />

            <button
              className="p-2 text-white/60 hover:text-white lg:hidden transition-colors"
              aria-label={t('search')}
            >
              <Search size={22} />
            </button>

            <Link
              href={isAuthenticated ? '/compte' : '/auth/login'}
              className="group relative hidden p-2 text-white/60 hover:text-white sm:block transition-colors rounded-lg hover:bg-white/8"
              aria-label={t('account')}
            >
              <User size={22} />
              {isAuthenticated && (
                <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-brand-primary bg-green-400" />
              )}
            </Link>

            <MiniCart />
          </div>
        </div>
      </div>
    </header>
  )
}
