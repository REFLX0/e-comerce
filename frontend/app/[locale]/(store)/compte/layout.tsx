"use client";

import { useState, useEffect } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { useAuthStore } from '@/lib/store/auth.store'
import { useSession } from 'next-auth/react'
import { authApi } from '@/lib/api/auth'
import { useTranslations, useLocale } from 'next-intl'
import {
  LayoutDashboard, Package, Heart, MapPin, ShieldCheck, Car,
  LifeBuoy, LogOut, User, ChevronRight, Menu, X, Sparkles, CheckCircle
} from 'lucide-react'

function SidebarContent({
  initials, fullName, user, pathname, handleLogout, setMobileOpen, t, NAV_ITEMS
}: {
  initials: string; fullName: string; user: any; pathname: string;
  handleLogout: () => void; setMobileOpen: (v: boolean) => void; t: (k: string) => string
  NAV_ITEMS: { href: string; icon: React.ElementType; label: string; exact?: boolean; badge?: string }[]
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* User Header Profile */}
      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-[#16254c] via-[#1c3166] to-[#16254c] p-6 text-white shadow-inner">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[18px] border-[#D4A76A]/15 pointer-events-none" />
        <div className="absolute right-4 bottom-2 h-16 w-16 rounded-full bg-white/5 blur-xl pointer-events-none" />
        
        <div className="relative flex items-center gap-3.5">
          <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#D4A76A] to-[#F3D7A4] font-black text-slate-950 text-base shadow-lg shadow-black/20 ring-2 ring-white/20 overflow-hidden">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#16254c] z-10">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-bold text-sm text-white tracking-tight">{fullName || t('myAccount')}</p>
            </div>
            <p className="truncate text-xs text-white/70 mt-0.5 font-normal">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#D4A76A] backdrop-blur-md">
              <Sparkles size={10} />
              <span>{t('verifiedClient')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3.5 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#16254c] to-[#223b76] text-white font-semibold shadow-md shadow-[#16254c]/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#16254c]'
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                isActive 
                  ? 'bg-white/15 text-[#D4A76A]' 
                  : 'bg-slate-100 text-slate-500 group-hover:bg-[#16254c]/10 group-hover:text-[#16254c]'
              }`}>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.9} />
              </div>
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && (
                <ChevronRight size={15} className="text-[#D4A76A] animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout Row */}
      <div className="border-t border-slate-100 p-3.5 bg-slate-50/50">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100/70 text-rose-600">
            <LogOut size={15} />
          </div>
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  )
}

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Account')
  const layoutT = useTranslations('Layout')
  const locale = useLocale()

  const NAV_ITEMS = [
    { href: '/compte',           icon: LayoutDashboard, label: t('dashboard'),     exact: true },
    { href: '/compte/commandes', icon: Package,          label: t('myOrders') },
    { href: '/compte/wishlist',  icon: Heart,            label: t('myWishlist') },
    { href: '/compte/voitures',  icon: Car,              label: t('myCars') },
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
      .catch(() => {
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#16254c]/20 border-t-[#16254c]" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{t('loadingSpace')}</p>
        </div>
      </div>
    )
  }

  const fullName = user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : ''
  const initials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const sidebarProps = { initials, fullName, user, pathname, handleLogout, setMobileOpen, t, NAV_ITEMS }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100 py-4 sm:py-8">
      {/* Mobile top bar */}
      <div className="mx-4 mb-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label={layoutT('openMenu')}
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="text-xs text-slate-400 font-medium">{t('myClientSpace')}</p>
            <p className="text-sm font-bold text-[#16254c]">
              {NAV_ITEMS.find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)))?.label ?? t('myAccount')}
            </p>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#D4A76A] to-[#F3D7A4] text-xs font-bold text-slate-900 shadow-sm">
          {initials}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <div
            className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-hidden rounded-r-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#D4A76A]" />
                <p className="font-bold text-sm text-[#16254c]">{t('navMenu')}</p>
              </div>
              <button 
                onClick={() => setMobileOpen(false)} 
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="h-[calc(100%-60px)]">
              <SidebarContent {...sidebarProps} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 lg:gap-8 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_15px_40px_-15px_rgba(22,37,76,0.08)] ring-1 ring-slate-900/5">
              <SidebarContent {...sidebarProps} />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="min-w-0 flex-1">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(22,37,76,0.08)] ring-1 ring-slate-900/5">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
