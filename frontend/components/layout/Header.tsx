"use client";

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { Search, User, ChevronDown, Zap } from 'lucide-react'
import dynamic from 'next/dynamic'
const MiniCart = dynamic(() => import('./MiniCart'), { ssr: false })
const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false })
import { GlobalSearch } from './GlobalSearch'
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
    <header className={`sticky top-0 z-40 w-full border-b transition-all duration-200 ${
      isScrolled
        ? 'border-brand-border bg-brand-card/95 shadow-card backdrop-blur-xl'
        : 'border-brand-border/70 bg-brand-card/92 shadow-none backdrop-blur-xl'
    }`}>

      {/* ── Top Utility Bar ──────────────────────────────────────────────── */}
      <div className="border-b border-white/10 bg-brand-primary py-2 text-xs text-white/72">
        <div className="section-padding flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-brand-accent" />
            <p className="hidden md:block">
              Livraison Gratuite à partir de <span className="text-brand-accent font-semibold">100 DT</span>
            </p>
            <p className="w-full text-center md:hidden">
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
      <div className="section-padding py-3">
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
                className="h-10 w-auto object-contain transition-opacity duration-200 group-hover:opacity-85"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-primary/72 transition-all duration-200 hover:bg-brand-primary/5 hover:text-brand-primary"
            >
              {t('home')}
            </Link>

            {/* Highlighted Find My Oil CTA */}
            <Link
              href="/#oil-finder"
              className="flex items-center gap-1.5 rounded-lg border border-brand-accent/25 bg-brand-accent/12 px-3 py-2 text-sm font-semibold text-brand-primary transition-all duration-200 hover:bg-brand-accent/20 hover:shadow-card"
            >
              <Zap size={14} />
              Trouver mon huile
            </Link>

            {/* Mega Menu Trigger */}
            <div
              className="group relative"
              onMouseEnter={() => setIsHoveringMenu(true)}
              onMouseLeave={() => setIsHoveringMenu(false)}
            >
              <Link
                href="/catalogue"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-primary/72 transition-all duration-200 hover:bg-brand-primary/5 hover:text-brand-primary"
              >
                {t('catalog')}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isHoveringMenu ? 'rotate-180 text-brand-accent' : ''}`}
                />
              </Link>

              {/* Mega Menu Dropdown */}
              {isHoveringMenu && categories && categories.length > 0 && (
                <div className="animate-scale-in absolute top-full left-1/2 mt-3 w-[820px] -translate-x-1/2 rounded-lg border border-brand-border bg-brand-card/98 p-6 shadow-overlay backdrop-blur-xl">
                  {/* Gold accent top bar */}
                  <div className="mb-5 h-px bg-brand-border" />
                  <div className="grid grid-cols-3 gap-6">
                    {categories.slice(0, 6).map((category) => (
                      <div key={category.id} className="group/cat">
                        <Link
                          href={`/categorie/${category.slug}`}
                          className="font-display mb-3 block text-sm font-semibold uppercase tracking-normal text-brand-primary transition-colors hover:text-brand-accent"
                        >
                          {category.name}
                        </Link>
                        <ul className="space-y-1.5">
                          {category.children?.slice(0, 5).map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={`/categorie/${sub.slug}`}
                                className="block truncate text-sm text-brand-muted transition-colors duration-150 hover:text-brand-primary"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 h-px bg-brand-border" />
                  <div className="mt-4 flex justify-center">
                    <Link href="/catalogue" className="text-xs font-semibold uppercase tracking-normal text-brand-muted transition-colors hover:text-brand-primary">
                      Voir tout le catalogue
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/a-propos"
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-primary/72 transition-all duration-200 hover:bg-brand-primary/5 hover:text-brand-primary"
            >
              {t('about')}
            </Link>
            <Link
              href="/contact"
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-primary/72 transition-all duration-200 hover:bg-brand-primary/5 hover:text-brand-primary"
            >
              {t('contact')}
            </Link>
          </nav>

          {/* Search Bar — Desktop */}
          <GlobalSearch />

          {/* Icons */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <LanguageSwitcher />

            <button
              className="flex h-11 w-11 items-center justify-center rounded-lg text-brand-primary/68 transition-colors duration-200 hover:bg-brand-primary/5 hover:text-brand-primary lg:hidden"
              aria-label={t('search')}
            >
              <Search size={22} />
            </button>

            <Link
              href={isAuthenticated ? '/compte' : '/auth/login'}
              className="group relative hidden h-11 w-11 items-center justify-center rounded-lg text-brand-primary/68 transition-colors duration-200 hover:bg-brand-primary/5 hover:text-brand-primary sm:flex"
              aria-label={t('account')}
            >
              <User size={22} />
              {isAuthenticated && (
                <span className="absolute right-1 bottom-1 h-2.5 w-2.5 rounded-full border-2 border-brand-card bg-green-500" />
              )}
            </Link>

            <MiniCart />
          </div>
        </div>
      </div>
    </header>
  )
}
