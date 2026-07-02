"use client";

import { Home, Search, ShoppingCart, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart.store'
import { useAuthStore } from '@/lib/store/auth.store'

/**
 * Sticky mobile bottom navigation bar — only visible on small screens.
 * Modelled after Nike/Stripe mobile UX: Home, Search, Cart, Account.
 */
export function MobileBottomNav() {
  const pathname = usePathname()
  const { items } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const links = [
    { href: '/', icon: Home, label: 'Accueil', exact: true },
    { href: '/catalogue', icon: Search, label: 'Catalogue', exact: false },
    { href: '/panier', icon: ShoppingCart, label: 'Panier', exact: false, badge: totalItems > 0 ? totalItems : null },
    { href: isAuthenticated ? '/compte' : '/auth/login', icon: User, label: 'Compte', exact: false },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      aria-label="Navigation mobile"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-pb">
        {links.map((link) => {
          const isActive = link.exact
            ? pathname === link.href || pathname === `/fr${link.href}` || pathname === `/en${link.href}`
            : pathname.includes(link.href === '/auth/login' ? 'compte' : link.href.replace('/', ''))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-brand-primary'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {/* Active pill indicator */}
              {isActive && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-brand-accent" />
              )}

              <div className="relative">
                <link.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {link.badge != null && (
                  <span className="absolute -top-2 -right-2.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-black text-black leading-none">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none ${isActive ? 'font-bold text-brand-primary' : ''}`}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
