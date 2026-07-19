"use client";

import { useHasMounted } from '@/lib/hooks/useHasMounted'
import { Home, Search, ShoppingCart, User } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { useTranslations } from 'next-intl'

/**
 * Sticky mobile bottom navigation bar — only visible on small screens.
 * Modelled after Nike/Stripe mobile UX: Home, Search, Cart, Account.
 */
export function MobileBottomNav() {
  const pathname = usePathname()
  const { items } = useCartStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasMounted = useHasMounted()
  const t = useTranslations('Layout')

  const totalItems = hasMounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0
  const accountHref = hasMounted && isAuthenticated ? '/compte' : '/auth/login'

  const links = [
    { href: '/', icon: Home, label: t('home'), exact: true },
    { href: '/catalogue', icon: Search, label: t('catalog'), exact: false },
    { href: '/panier', icon: ShoppingCart, label: t('cart'), exact: false, badge: totalItems > 0 ? totalItems : null },
    { href: accountHref, icon: User, label: t('account'), exact: false },
  ]

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-40 border-t border-brand-border bg-brand-card/96 shadow-[0_-10px_28px_rgba(15,23,31,0.10)] backdrop-blur-xl md:hidden"
      aria-label="Navigation mobile"
    >
      <div className="safe-pb flex items-center justify-around px-2 py-2">
        {links.map((link) => {
          const isActive = link.exact
            ? pathname === link.href || pathname === `/fr${link.href}` || pathname === `/en${link.href}`
            : pathname.includes(link.href === '/auth/login' ? 'compte' : link.href.replace('/', ''))

          return (
            <Link
              key={link.href}
              href={link.href as any}
              className={`relative flex min-h-12 min-w-[68px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-1.5 transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-brand-primary'
                  : 'text-brand-muted hover:bg-brand-surface hover:text-brand-primary'
              }`}
            >
              {/* Active pill indicator */}
              {isActive && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-brand-accent" />
              )}

              <div className="relative">
                <link.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {link.badge != null && (
                  <span className="absolute -top-2 -right-2.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] leading-none font-black text-brand-primary">
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
