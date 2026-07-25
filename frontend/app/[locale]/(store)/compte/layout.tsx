"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { useSession } from 'next-auth/react'
import { authApi } from '@/lib/api/auth'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard, Package, Heart, MapPin, ShieldCheck,
  LifeBuoy, LogOut, User, ChevronRight, Menu, X
} from 'lucide-react'

function SidebarContent({
  initials, fullName, user, pathname, handleLogout, setMobileOpen, t, NAV_ITEMS
}: {
  initials: string; fullName: string; user: any; pathname: string;
  handleLogout: () => void; setMobileOpen: (v: boolean) => void; t: (k: string) => string
  NAV_ITEMS: { href: string; icon: React.ElementType; label: string; exact?: boolean }[]
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-brand-primary">{fullName || t('myAccount')}</p>
            <p className="truncate text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-brand-primary'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-brand-primary' : 'text-gray-400'} />
              {item.label}
              {isActive && <ChevronRight size={14} className="ml-auto text-brand-primary" />}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          {t('logout')}
        </button>
      </div>
    </div>
  )
}

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Account')

  const NAV_ITEMS = [
    { href: '/compte',           icon: LayoutDashboard, label: t('dashboard'),     exact: true },
    { href: '/compte/commandes', icon: Package,          label: t('myOrders') },
    { href: '/compte/wishlist',  icon: Heart,            label: t('myWishlist') },
    { href: '/compte/profil',    icon: User,             label: t('myProfile') },
    { href: '/compte/adresses',  icon: MapPin,           label: t('myAddresses') },
    { href: '/compte/support',   icon: LifeBuoy,         label: t('support') },
    { href: '/compte/securite',  icon: ShieldCheck,      label: t('security') },
  ]

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setAuth = useAuthStore((s) => s.setAuth)
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const { data: nextAuthSession, status: nextAuthStatus } = useSession()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    if (nextAuthStatus === 'loading') return

    let cancelled = false

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        cancelled = true
        setIsCheckingAuth(false)
        router.push(`/${locale}/auth/login?callbackUrl=/${locale}/compte`)
      }
    }, 5_000)

    // Fast-path: If user is logged in via NextAuth (e.g. Google)
    if (nextAuthStatus === 'authenticated' && nextAuthSession?.user) {
      if (cancelled) return
      window.clearTimeout(timeoutId)
      const u = nextAuthSession.user as any
      setAuth(u)
      setIsCheckingAuth(false)
      if (u.role?.toUpperCase() === 'ADMIN') {
        router.push(`/${locale}/admin`)
      }
      return
    }

    authApi
      .me()
      .then((serverUser) => {
        if (cancelled) return
        window.clearTimeout(timeoutId)
        if (serverUser) {
          setAuth(serverUser)
          setIsCheckingAuth(false)
          if (serverUser.role?.toUpperCase() === 'ADMIN') {
            router.push(`/${locale}/admin`)
          }
          return
        }
        router.push(`/${locale}/auth/login?callbackUrl=/${locale}/compte`)
      })
      .catch((err) => {
        if (cancelled) return
        window.clearTimeout(timeoutId)
        setIsCheckingAuth(false)
        router.push(`/${locale}/auth/login?callbackUrl=/${locale}/compte`)
      })

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [isMounted, locale, nextAuthStatus, router, setAuth])

  const handleLogout = () => { logout(); router.push('/') }

  if (!isMounted || isCheckingAuth || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary/20 border-t-brand-primary" />
      </div>
    )
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : ''
  const initials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const sidebarProps = { initials, fullName, user, pathname, handleLogout, setMobileOpen, t, NAV_ITEMS }

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* Mobile top bar */}
      <div className="sticky top-16 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
        <p className="text-sm font-semibold text-brand-primary">
          {NAV_ITEMS.find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)))?.label ?? t('myAccount')}
        </p>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute inset-y-0 left-0 w-80 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="font-semibold text-brand-primary">{t('mySpace')}</p>
              <button onClick={() => setMobileOpen(false)} className="rounded-xl p-2 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="h-[calc(100%-64px)]">
              <SidebarContent {...sidebarProps} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="section-padding py-8">
        <div className="mx-auto flex max-w-6xl gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <SidebarContent {...sidebarProps} />
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0 flex-1">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
