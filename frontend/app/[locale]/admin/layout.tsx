"use client";
import { useSession } from 'next-auth/react'

import type { ReactNode } from 'react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { useTranslations, useLocale } from 'next-intl'
import { authApi } from '@/lib/api/auth'
import { NotificationDropdown } from '@/components/admin/NotificationDropdown'

import {
  LayoutDashboard, ShoppingCart, Package, Users, Tag,
  Truck, CreditCard, Star, Settings, ChevronRight,
  Menu, BarChart2, FolderTree, Layers, LogOut,
  Search, ChevronDown, LifeBuoy, Mail, ShoppingBag, FileText
} from 'lucide-react'

type NavItemShape = {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  href?: string
  exact?: boolean
  badge?: string
  children?: Array<{ label: string; icon: React.ComponentType<{ size?: number; className?: string }>; href: string }>
}

function stripLocale(pathname: string) {
  return pathname.replace(/^\/(fr|en)(?=\/|$)/, '') || '/'
}

function withLocale(href: string, locale: string) {
  return href.startsWith(`/${locale}/`) || href === `/${locale}` ? href : `/${locale}${href}`
}

function NavItem({
  item,
  collapsed,
  onClose,
  locale,
}: {
  item: NavItemShape
  collapsed: boolean
  onClose?: () => void
  locale: string
}) {
  const pathname = usePathname()
  const adminPathname = stripLocale(pathname)
  const hasActiveChild = item.children?.some((c) => adminPathname.startsWith(c.href)) ?? false
  const [open, setOpen] = useState(hasActiveChild)
  const childOpen = open || hasActiveChild

  const isActive = item.href
    ? item.exact
      ? adminPathname === item.href
      : adminPathname.startsWith(item.href)
    : hasActiveChild

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen((p) => !p)}
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
            isActive
              ? 'bg-white/10 text-white'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <item.icon size={18} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${childOpen ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>
        {!collapsed && childOpen && (
          <div className="mt-1 ml-4 space-y-0.5 border-l border-white/10 pl-3">
            {item.children.map((child) => {
              const childActive = adminPathname.startsWith(child.href)
              return (
                <Link
                  key={child.href}
                  href={withLocale(child.href, locale)}
                  onClick={onClose}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs transition-all ${
                    childActive
                      ? 'font-bold text-white bg-white/10 border-l-2 border-brand-accent -ml-[2px] pl-[6px]'
                      : 'font-medium text-gray-500 hover:text-white'
                  }`}
                >
                  <child.icon size={14} />
                  {child.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={withLocale(item.href!, locale)}
      onClick={onClose}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? 'bg-white/10 text-white'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <item.icon size={18} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

function Sidebar({
  collapsed,
  onClose,
  nav,
}: {
  collapsed: boolean
  onClose?: () => void
  nav: NavItemShape[]
}) {
  const t = useTranslations('Admin')
  const locale = useLocale()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push(`/${locale}/auth/login`)
  }

  return (
    <div className="flex h-full flex-col bg-brand-primary-dark">
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <Link href="/admin" className="flex items-center gap-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="specpart"
            className="h-12 w-auto object-contain"
          />
        </Link>
        {!collapsed && (
          <span className="rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {t('adminLabel')}
          </span>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <button onClick={() => document.dispatchEvent(new CustomEvent('open-search'))} className="w-full px-3 pt-4 pb-2">
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">
            <Search size={14} />
            <span className="text-xs">{t('quickSearch')}</span>
            <span className="ml-auto rounded border border-white/10 px-1 text-[10px]">⌘K</span>
          </div>
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {nav.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            collapsed={collapsed}
            onClose={onClose}
            locale={locale}
          />
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 font-bold text-sm text-white">
              {user?.firstName?.[0] ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin'}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-gray-500 hover:text-red-400 transition-colors"
              title={t('logout')}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-xl p-2.5 text-gray-500 hover:text-red-400 transition-colors"
            title={t('logout')}
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('Admin')

  const NAV: NavItemShape[] = [
    { label: t('dashboard'), icon: LayoutDashboard, href: '/admin', exact: true },
    { label: t('orders'), icon: ShoppingCart, href: '/admin/orders', badge: t('badgeNew') },
    {
      label: t('catalog'),
      icon: Package,
      children: [
        { label: t('products'), href: '/admin/catalog/products', icon: Layers },
        { label: t('categories'), href: '/admin/catalog/categories', icon: FolderTree },
        { label: t('inventory'), href: '/admin/catalog/inventory', icon: Package },
      ],
    },
    { label: t('customers'), icon: Users, href: '/admin/customers' },
    { label: t('promotions'), icon: Tag, href: '/admin/promotions' },
    { label: t('supportTickets'), icon: LifeBuoy, href: '/admin/tickets' },
    { label: t('contactMessages'), icon: Mail, href: '/admin/contact-messages' },
    { label: t('shipping'), icon: Truck, href: '/admin/shipping' },
    { label: t('payments'), icon: CreditCard, href: '/admin/payments' },
    { label: t('reviews'), icon: Star, href: '/admin/reviews' },
    { label: t('analytics'), icon: BarChart2, href: '/admin/analytics' },
    { label: t('settings'), icon: Settings, href: '/admin/settings' },
  ]

  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isCheckingServerAuth, setIsCheckingServerAuth] = useState(true)
  const pathname = usePathname()
  const { data: nextAuthSession, status: nextAuthStatus } = useSession()
  const locale = useLocale()
  const adminPathname = stripLocale(pathname)

  // Close mobile menu on route change
  useEffect(() => {
    const timer = window.setTimeout(() => setMobileOpen(false), 0)
    return () => window.clearTimeout(timer)
  }, [pathname])

  // Close mobile drawer on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    // Wait for NextAuth session status to be determined before doing anything
    if (nextAuthStatus === 'loading') return

    let cancelled = false

    // ── Fast-path: NextAuth session already has the role (Google OAuth or any provider) ──
    const nextAuthRole = (nextAuthSession?.user as any)?.role
    if (nextAuthStatus === 'authenticated' && nextAuthRole?.toUpperCase() === 'ADMIN') {
      setIsCheckingServerAuth(false)
      return
    }

    // ── If not authenticated at all via NextAuth, still try NestJS JWT ──
    // (covers email/password login which sets an access_token cookie directly)
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        cancelled = true
        setIsCheckingServerAuth(false)
        router.push(`/${locale}/auth/login?callbackUrl=/${locale}/admin`)
      }
    }, 5_000)

    authApi
      .me()
      .then((serverUser) => {
        if (cancelled) return
        window.clearTimeout(timeoutId)
        if (serverUser?.role?.toUpperCase() === 'ADMIN') {
          setAuth(serverUser)
          setIsCheckingServerAuth(false)
          return
        }
        router.push(`/${locale}/auth/login?callbackUrl=/${locale}/admin&reason=admin`)
      })
      .catch((err) => {
        if (cancelled) return
        console.error("[AdminLayout] authApi.me() failed:", err)
        window.clearTimeout(timeoutId)
        setIsCheckingServerAuth(false)
        router.push(`/${locale}/auth/login?callbackUrl=/${locale}/admin`)
      })

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, locale, nextAuthStatus])

  if (!isMounted || isCheckingServerAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-primary-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-surface font-sans">
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`relative hidden lg:flex flex-col border-r border-white/10 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <Sidebar collapsed={sidebarCollapsed} nav={NAV} />
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed((p) => !p)}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-brand-primary-dark text-gray-400 hover:text-white shadow-lg"
        >
          <ChevronRight
            size={12}
            className={`transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`}
          />
        </button>
      </aside>

      {/* ── Mobile Sidebar Drawer ───────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          {/* Drawer */}
          <div
            className="absolute inset-y-0 left-0 w-72 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar collapsed={false} onClose={() => setMobileOpen(false)} nav={NAV} />
          </div>
        </div>
      )}

      {/* ── Main ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm">
          {/* Hamburger - mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label={t('openMenu')}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <span className="font-semibold text-brand-primary">{t('admin')}</span>
            <ChevronRight size={14} />
            <span className="capitalize">
              {adminPathname.split('/').filter(Boolean).slice(1).join(' › ') || t('dashboard')}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Global search - desktop */}
            <button onClick={() => document.dispatchEvent(new CustomEvent('open-search'))} className="relative hidden md:block">
              <div className="flex items-center gap-2 w-56 rounded-xl border border-gray-200 bg-gray-50 py-2 px-4 pl-9 text-sm text-gray-400 hover:border-gray-300 hover:bg-white transition-all cursor-pointer">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <span>{t('quickSearch')}</span>
                <span className="ml-auto text-[10px] text-gray-300">⌘K</span>
              </div>
            </button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-bold text-sm text-white">
              {user?.firstName?.[0] ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <SearchModal locale={locale} />
    </div>
  )
}

function SearchModal({ locale }: { locale: string }) {
  const t = useTranslations('Admin')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const pages = [
    { label: t('dashboard'), href: '/admin', icon: LayoutDashboard },
    { label: t('orders'), href: '/admin/orders', icon: ShoppingCart },
    { label: t('products'), href: '/admin/catalog/products', icon: Package },
    { label: t('categories'), href: '/admin/catalog/categories', icon: FolderTree },
    { label: t('inventory'), href: '/admin/catalog/inventory', icon: Layers },
    { label: t('customers'), href: '/admin/customers', icon: Users },
    { label: t('promotions'), href: '/admin/promotions', icon: Tag },
    { label: t('contactMessages'), href: '/admin/contact-messages', icon: Mail },
    { label: t('supportTickets'), href: '/admin/tickets', icon: LifeBuoy },
    { label: t('shipping'), href: '/admin/shipping', icon: Truck },
    { label: t('payments'), href: '/admin/payments', icon: CreditCard },
    { label: t('reviews'), href: '/admin/reviews', icon: Star },
    { label: t('analytics'), href: '/admin/analytics', icon: BarChart2 },
    { label: t('settings'), href: '/admin/settings', icon: Settings },
  ]

  const filtered = query ? pages.filter(p => p.label.toLowerCase().includes(query.toLowerCase())) : pages

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true) }
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) { e.preventDefault(); setOpen(true) }
    }
    document.addEventListener('keydown', handler)
    const onCustom = () => setOpen(true)
    document.addEventListener('open-search', onCustom)
    return () => { document.removeEventListener('keydown', handler); document.removeEventListener('open-search', onCustom) }
  }, [])

  useEffect(() => { if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50) } }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('searchPlaceholder')} className="flex-1 text-sm outline-none placeholder:text-gray-400" />
          <kbd className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">{t('noResults')}</p>
          ) : (
            filtered.map(p => (
              <button key={p.href} onClick={() => { router.push(`/${locale}${p.href}`); setOpen(false) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors text-left">
                <p.icon size={16} className="text-gray-400 shrink-0" />
                {p.label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
