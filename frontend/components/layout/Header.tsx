"use client";

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { Search, User, ChevronDown } from 'lucide-react'
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled ? 'shadow-soft bg-white/95 backdrop-blur-md' : 'bg-white shadow-sm'
      }`}
    >
      {/* Top bar */}
      <div className="bg-brand-primary py-2 text-xs text-white">
        <div className="section-padding flex items-center justify-between">
          <p className="hidden md:block">Livraison Gratuite à partir de 100 DT</p>
          <p className="w-full text-center md:hidden">Livraison Gratuite à partir de 100 DT</p>
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/contact" className="hover:text-brand-accent transition-colors">
              {t('contact')}
            </Link>
            <Link href="/faq" className="hover:text-brand-accent transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="section-padding py-4">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-4">
            <MobileMenu />
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image src="/logo.png" alt="KiosqueTN" width={140} height={40} className="h-9 w-auto object-contain" priority />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="hover:text-brand-primary text-sm font-medium transition-colors"
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
                className="hover:text-brand-primary flex items-center gap-1 py-4 text-sm font-medium transition-colors"
              >
                {t('catalog')}
                <ChevronDown
                  size={14}
                  className="transition-transform duration-200 group-hover:rotate-180"
                />
              </Link>

              {/* Mega Menu Dropdown */}
              {isHoveringMenu && categories && categories.length > 0 && (
                <div className="shadow-card-hover absolute top-full left-1/2 grid w-[800px] -translate-x-1/2 grid-cols-3 gap-8 rounded-xl border border-gray-100 bg-white p-6">
                  {categories.slice(0, 6).map((category) => (
                    <div key={category.id}>
                      <Link
                        href={`/categorie/${category.slug}`}
                        className="font-display text-brand-primary hover:text-brand-accent mb-3 block font-semibold truncate"
                      >
                        {category.name}
                      </Link>
                      <ul className="space-y-2">
                        {category.children?.slice(0, 5).map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/categorie/${sub.slug}`}
                              className="hover:text-brand-primary block text-sm text-gray-500 transition-colors truncate"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/a-propos"
              className="hover:text-brand-primary text-sm font-medium transition-colors"
            >
              {t('about')}
            </Link>
            <Link
              href="/contact"
              className="hover:text-brand-primary text-sm font-medium transition-colors"
            >
              {t('contact')}
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="relative hidden max-w-md flex-1 lg:flex">
            <input
              type="text"
              placeholder={t('search') + "..."}
              className="bg-brand-surface focus:border-brand-primary/30 w-full rounded-full border-transparent py-2.5 pr-12 pl-5 text-sm transition-all outline-none focus:bg-white"
              aria-label={t('search')}
            />
            <button
              className="hover:text-brand-primary absolute top-1/2 right-2 -translate-y-1/2 p-2 text-gray-400"
              aria-label={t('search')}
            >
              <Search size={18} />
            </button>
          </div>

          {/* Icons & Switcher */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-4">
            
            <LanguageSwitcher />

            <button
              className="hover:text-brand-primary p-2 text-gray-600 lg:hidden"
              aria-label={t('search')}
            >
              <Search size={24} />
            </button>

            <Link
              href={isAuthenticated ? '/compte' : '/auth/login'}
              className="hover:text-brand-primary group relative hidden p-2 text-gray-600 sm:block"
              aria-label={t('account')}
            >
              <User size={24} />
              {isAuthenticated && (
                <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
              )}
            </Link>

            <MiniCart />
          </div>
        </div>
      </div>
    </header>
  )
}
