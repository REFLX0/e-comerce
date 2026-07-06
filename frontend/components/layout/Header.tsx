"use client";

import { useState, useEffect, useRef } from 'react'
import { Link } from '@/i18n/routing'
import { Search, User, ShoppingBag, ChevronDown, Menu, X } from 'lucide-react'
import dynamic from 'next/dynamic'
const MiniCart = dynamic(() => import('./MiniCart'), { ssr: false })
const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false })
import { GlobalSearch } from './GlobalSearch'
import { MobileSearchSheet } from './MobileSearchSheet'
import { useAuthStore } from '@/lib/store/auth.store'
import { useCartStore } from '@/lib/store/cart.store'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useHasMounted } from '@/lib/hooks/useHasMounted'

const NAV_CATEGORIES = [
  { label: 'Engine Oil', slug: 'automobile' },
  { label: 'Car Care', slug: 'additifs' },
  { label: 'Filters', slug: 'filtres' },
  { label: 'Brake System', slug: 'automobile' },
  { label: 'Batteries', slug: 'automobile' },
  { label: 'Accessories', slug: 'automobile' },
  { label: 'Performance Parts', slug: 'automobile' },
  { label: 'Deals', slug: 'automobile' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const cartStore = useCartStore()
  const hasMounted = useHasMounted()
  const t = useTranslations('Navigation')
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMenuEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
    setMegaOpen(true)
  }
  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setMegaOpen(false), 200)
  }

  const { data: categories } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const cartCount = hasMounted ? cartStore.items.reduce((s, i) => s + i.quantity, 0) : 0

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* ── Announcement Bar (hides on scroll) ────────────────────── */}
      <div className={`overflow-hidden bg-[#0B0B0C] text-center text-xs font-medium tracking-wide text-white/70 transition-all duration-300 ${
        isScrolled ? 'max-h-0 py-0' : 'max-h-12 py-2'
      }`}>
        <p>Free shipping on orders over <span className="font-bold text-white">100 DT</span> — Authentic products guaranteed</p>
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
              href={hasMounted && isAuthenticated ? '/compte' : '/auth/login'}
              className="hidden h-10 w-10 items-center justify-center rounded-lg text-[#111] transition-colors hover:bg-gray-100 sm:flex"
              aria-label={t('account')}
            >
              <User size={20} strokeWidth={1.8} />
            </Link>

            <MiniCart />
          </div>
        </div>
      </div>

      {/* ── Red Category Nav ──────────────────────────────────────── */}
      <nav className="hidden bg-[#E10600] md:block">
        <div className="section-padding flex min-h-[48px] items-stretch">
          {/* All Categories trigger */}
          <div
            className="relative"
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
          >
            <button className="flex h-full items-center gap-2 bg-black/15 px-5 text-[13px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-black/25">
              <Menu size={16} />
              All Categories
              <ChevronDown size={14} className={`transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega dropdown */}
            {megaOpen && categories && categories.length > 0 && (
              <div
                className="absolute left-0 top-full z-50 w-[640px] rounded-b-lg border border-gray-100 bg-white p-6 shadow-2xl"
                onMouseEnter={handleMenuEnter}
                onMouseLeave={handleMenuLeave}
              >
                <div className="grid grid-cols-3 gap-6">
                  {categories.slice(0, 9).map((cat) => (
                    <div key={cat.id}>
                      <Link
                        href={`/categorie/${cat.slug}`}
                        className="mb-2 block text-sm font-bold uppercase tracking-wide text-[#111] hover:text-[#E10600]"
                      >
                        {cat.name}
                      </Link>
                      <ul className="space-y-1">
                        {cat.children?.slice(0, 4).map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/categorie/${sub.slug}`}
                              className="block text-sm text-gray-500 hover:text-[#E10600]"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <Link href="/catalogue" className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[#E10600]">
                    View full catalogue →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Category links */}
          {NAV_CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={`/categorie/${cat.slug}`}
              className="flex items-center px-4 text-[13px] font-semibold text-white/90 transition-colors hover:bg-black/15 hover:text-white"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
