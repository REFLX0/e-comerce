"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import {
  LayoutDashboard, Package, Heart, MapPin, ShieldCheck,
  Star, Bell, LifeBuoy, LogOut, User, ChevronRight, Menu, X
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/compte',           icon: LayoutDashboard, label: 'Tableau de bord',     exact: true },
  { href: '/compte/commandes', icon: Package,          label: 'Mes Commandes' },
  { href: '/compte/wishlist',  icon: Heart,            label: 'Ma Liste de souhaits' },
  { href: '/compte/profil',    icon: User,             label: 'Mon Profil' },
  { href: '/compte/adresses',  icon: MapPin,           label: 'Mes Adresses' },
  { href: '/compte/avis',      icon: Star,             label: 'Mes Avis' },
  { href: '/compte/support',   icon: LifeBuoy,         label: 'Support & Retours' },
  { href: '/compte/securite',  icon: ShieldCheck,      label: 'Sécurité' },
  { href: '/compte/notifications', icon: Bell,         label: 'Notifications' },
]

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, isHydrated, user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => setMobileOpen(false), [pathname])

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/auth/login')
  }, [isHydrated, isAuthenticated, router])

  const handleLogout = () => { logout(); router.push('/') }

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent" />
      </div>
    )
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : ''
  const initials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* User card */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-brand-primary">{fullName || 'Mon compte'}</p>
            <p className="truncate text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
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
                  ? 'bg-brand-accent/10 text-brand-primary font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-brand-primary'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-brand-accent' : 'text-gray-400'} />
              {item.label}
              {isActive && <ChevronRight size={14} className="ml-auto text-brand-accent" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </div>
  )

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
          {NAV_ITEMS.find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)))?.label ?? 'Mon compte'}
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
              <p className="font-semibold text-brand-primary">Mon espace</p>
              <button onClick={() => setMobileOpen(false)} className="rounded-xl p-2 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="h-[calc(100%-64px)]">
              <SidebarContent />
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
              <SidebarContent />
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
