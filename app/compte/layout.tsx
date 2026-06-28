'use client'

import { useAuthStore } from '@/lib/store/auth.store'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { User, Package, Heart, LogOut } from 'lucide-react'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, logout, isHydrated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isHydrated, isAuthenticated, router])

  if (!isHydrated || !isAuthenticated) return null

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const menuItems = [
    { href: '/compte', icon: <User size={20} />, label: 'Mon Profil' },
    { href: '/compte/commandes', icon: <Package size={20} />, label: 'Mes Commandes' },
    { href: '/compte/favoris', icon: <Heart size={20} />, label: 'Mes Favoris' },
  ]

  return (
    <div className="section-padding py-12 bg-brand-surface min-h-screen">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar Menu */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-brand-surface-dark p-4 shadow-sm">
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-brand-primary text-white font-medium'
                        : 'text-gray-600 hover:bg-brand-surface hover:text-brand-primary'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              })}
              <div className="h-px bg-gray-100 my-2"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut size={20} />
                Déconnexion
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-3xl border border-brand-surface-dark p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
