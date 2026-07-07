"use client";

import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { authApi } from '@/lib/api/auth'
import { NotificationDropdown } from '@/components/admin/NotificationDropdown'
import Image from 'next/image'
import {
  LayoutDashboard, ShoppingCart, Package, Users, Tag,
  Truck, CreditCard, Star, Settings, ChevronRight,
  Menu, BarChart2, FolderTree, Layers, LogOut,
  Search, ChevronDown, LifeBuoy
} from 'lucide-react'

// ── Navigation definition ──────────────────────────────────────────────────
const NAV = [
  {
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    href: '/admin',
    exact: true,
  },
  {
    label: 'Commandes',
    icon: ShoppingCart,
    href: '/admin/orders',
    badge: 'new',
  },
  {
    label: 'Catalogue',
    icon: Package,
    children: [
      { label: 'Produits', href: '/admin/catalog/products', icon: Layers },
      { label: 'Catégories', href: '/admin/catalog/categories', icon: FolderTree },
      { label: 'Inventaire', href: '/admin/catalog/inventory', icon: Package },
    ],
  },
  {
    label: 'Clients',
    icon: Users,
    href: '/admin/customers',
  },
  {
    label: 'Promotions',
    icon: Tag,
    href: '/admin/promotions',
  },
  {
    label: 'Support & Retours',
    icon: LifeBuoy,
    href: '/admin/tickets',
  },
  {
    label: 'Livraison',
    icon: Truck,
    href: '/admin/shipping',
  },
  {
    label: 'Paiements',
    icon: CreditCard,
    href: '/admin/payments',
  },
  {
    label: 'Avis',
    icon: Star,
    href: '/admin/reviews',
  },
  {
    label: 'Analytique',
    icon: BarChart2,
    href: '/admin/analytics',
  },
  {
    label: 'Paramètres',
    icon: Settings,
    href: '/admin/settings',
  },
]

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
  item: (typeof NAV)[number]
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
              ? 'bg-brand-accent/15 text-brand-accent'
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
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                    childActive
                      ? 'text-brand-accent'
                      : 'text-gray-500 hover:text-white'
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
          ? 'bg-brand-accent/15 text-brand-accent'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <item.icon size={18} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="rounded-full bg-brand-accent px-1.5 py-0.5 text-[10px] font-bold text-black">
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
}: {
  collapsed: boolean
  onClose?: () => void
}) {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'

  const handleLogout = () => {
    logout()
    router.push(`/${locale}/auth/login`)
  }

  return (
    <div className="flex h-full flex-col bg-brand-primary-dark">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <Link href={withLocale('/admin', locale)} onClick={onClose} className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="KiosqueTN Admin"
            width={120}
            height={36}
            className="h-8 w-auto brightness-0 invert"
          />
          {!collapsed && (
            <span className="rounded bg-brand-accent px-1.5 py-0.5 text-[10px] font-bold text-black">
              ADMIN
            </span>
          )}
        </Link>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-gray-400">
            <Search size={14} />
            <span className="text-xs">Recherche rapide…</span>
            <span className="ml-auto rounded border border-white/10 px-1 text-[10px]">⌘K</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {NAV.map((item) => (
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent font-bold text-sm text-black">
              {user?.firstName?.[0] ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin'}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-gray-500 hover:text-red-400 transition-colors"
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-xl p-2.5 text-gray-500 hover:text-red-400 transition-colors"
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isHydrated, user, setAuth } = useAuthStore()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isCheckingServerAuth, setIsCheckingServerAuth] = useState(true)
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
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
    if (!isHydrated) return

    if (isAuthenticated && user?.role?.toUpperCase() === 'ADMIN') {
      window.setTimeout(() => setIsCheckingServerAuth(false), 0)
      return
    }

    let cancelled = false
    const checkingTimer = window.setTimeout(() => {
      if (!cancelled) setIsCheckingServerAuth(true)
    }, 0)

    authApi
      .me()
      .then((serverUser) => {
        if (cancelled) return
        if (serverUser?.role?.toUpperCase() === 'ADMIN') {
          setAuth(serverUser)
          setIsCheckingServerAuth(false)
          return
        }
        router.push(`/${locale}/auth/login?callbackUrl=/${locale}/admin&reason=admin`)
      })
      .catch(() => {
        if (!cancelled) router.push(`/${locale}/auth/login?callbackUrl=/${locale}/admin`)
      })

    return () => {
      cancelled = true
      window.clearTimeout(checkingTimer)
    }
  }, [isHydrated, isAuthenticated, user, setAuth, router, locale])

  if (!isHydrated || isCheckingServerAuth || user?.role?.toUpperCase() !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-primary-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-accent border-t-transparent" />
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
        <Sidebar collapsed={sidebarCollapsed} />
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
            <Sidebar collapsed={false} onClose={() => setMobileOpen(false)} />
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
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <span className="font-semibold text-brand-primary">Admin</span>
            <ChevronRight size={14} />
            <span className="capitalize">
              {adminPathname.split('/').filter(Boolean).slice(1).join(' › ') || 'Tableau de bord'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Global search - desktop */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="search"
                placeholder="Rechercher…"
                className="w-56 rounded-xl border border-gray-200 bg-gray-50 py-2 pr-4 pl-9 text-sm outline-none focus:border-brand-accent focus:bg-white transition-all"
              />
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent font-bold text-sm text-black">
              {user?.firstName?.[0] ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
