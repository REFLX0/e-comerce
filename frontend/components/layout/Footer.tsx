'use client'

import { Link } from '@/i18n/routing'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'
import { useState } from 'react'
import { gooeyToast as toast } from 'goey-toast'
import { useTranslations } from 'next-intl'
// Logo is served directly from public/logo.jpg

const Facebook = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const Instagram = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="17.5" cy="6.5" r="1.5" />
  </svg>
)

const SHOP_LINKS = [
  { href: '/categorie/huiles-moteur', ns: 'Footer', key: 'shopHuilesMoteur' },
  { href: '/categorie/liquides-auto', ns: 'Footer', key: 'shopLiquides' },
  { href: '/categorie/auto-filtres', ns: 'Footer', key: 'shopFiltres' },
  { href: '/categorie/additifs', ns: 'Footer', key: 'shopAdditifs' },
  { href: '/catalogue', ns: 'Footer', key: 'shopAllCategories' },
]

const SERVICE_LINKS = [
  { href: '/a-propos', ns: 'Footer', key: 'aboutUs' },
  { href: '/livraison', ns: 'Shipping', key: 'title' },
  { href: '/retours', ns: 'Returns', key: 'title' },
  { href: '/cgv', ns: 'Footer', key: 'terms' },
  { href: '/faq', ns: 'Footer', key: 'faq' },
  { href: '/contact', ns: 'Footer', key: 'contactUs' },
]

const ACCOUNT_LINKS = [
  { href: '/compte/commandes', ns: 'Account', key: 'myOrders' },
  { href: '/compte/wishlist', ns: 'Account', key: 'myWishlist' },
  { href: '/compte', ns: 'Footer', key: 'accountTrackOrder' },
  { href: '/compte/securite', ns: 'Footer', key: 'accountSettings' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const tFooter = useTranslations('Footer')
  const tHome = useTranslations('Home')
  const tLayout = useTranslations('Layout')
  const tAccount = useTranslations('Account')
  const tShipping = useTranslations('Shipping')
  const tReturns = useTranslations('Returns')
  const linkLabel = (ns: string, key: string) => {
    if (ns === 'Account') return tAccount(key)
    if (ns === 'Shipping') return tShipping(key)
    if (ns === 'Returns') return tReturns(key)
    return tFooter(key)
  }

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return toast.error(tHome('validEmail'))
    toast.success(tHome('thankYou'))
    setEmail('')
  }

  return (
    <footer className="bg-brand-primary-dark">
      <div className="section-padding pt-16 pb-10">
        {/* 5-column grid */}
        <div className="mb-14 grid grid-cols-1 gap-10 border-b border-white/8 pb-14 sm:grid-cols-2 lg:grid-cols-5">
          {/* Col 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-5 inline-flex items-center gap-1.5 group">
              <span className="text-2xl font-black tracking-wider uppercase text-white group-hover:text-brand-accent transition-colors">
                SPEC<span className="text-brand-accent">PART</span>
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/40">
              {tFooter('description')}
            </p>
            {/* Newsletter */}
            <form onSubmit={handleNewsletter} className="flex gap-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tFooter('newsletterPlaceholder')}
                className="focus:border-brand-accent h-10 flex-1 border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-brand-accent text-brand-primary-dark hover:bg-brand-accent-hover flex h-10 w-10 shrink-0 items-center justify-center transition-colors"
                aria-label={tFooter('subscribe')}
              >
                <Send size={14} />
              </button>
            </form>
            {/* Social */}
            <div className="mt-5 flex gap-3">
              <a
                href="https://www.facebook.com/specpart/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="hover:border-brand-accent hover:text-brand-accent flex h-9 w-9 items-center justify-center rounded border border-white/10 text-white/40 transition-all"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://www.instagram.com/specpart/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:border-brand-accent hover:text-brand-accent flex h-9 w-9 items-center justify-center rounded border border-white/10 text-white/40 transition-all"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Col 2: Boutique */}
          <div>
            <h3 className="mb-5 text-xs font-bold tracking-[0.15em] text-white/30 uppercase">
              {tFooter('shopTitle')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SHOP_LINKS.map(({ href, ns, key }) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 transition-colors hover:text-white">
                    {linkLabel(ns, key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Service Client */}
          <div>
            <h3 className="mb-5 text-xs font-bold tracking-[0.15em] text-white/30 uppercase">
              {tFooter('serviceTitle')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SERVICE_LINKS.map(({ href, ns, key }) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 transition-colors hover:text-white">
                    {linkLabel(ns, key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Mon Compte */}
          <div>
            <h3 className="mb-5 text-xs font-bold tracking-[0.15em] text-white/30 uppercase">
              {tFooter('myAccount')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {ACCOUNT_LINKS.map(({ href, ns, key }) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 transition-colors hover:text-white">
                    {linkLabel(ns, key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact */}
          <div>
            <h3 className="mb-5 text-xs font-bold tracking-[0.15em] text-white/30 uppercase">
              {tFooter('contact')}
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Clock size={15} className="text-brand-accent mt-0.5 shrink-0" />
                <span className="text-white/40">{tFooter('hours')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-brand-accent shrink-0" />
                <a href="tel:+21629294195" className="text-white/40 hover:text-white">
                  +216 29 294 195
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-brand-accent shrink-0" />
                <a href="mailto:contact@specpart.tn" className="text-white/40 hover:text-white">
                  contact@specpart.tn
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-brand-accent mt-0.5 shrink-0" />
                <span className="text-white/40">{tFooter('location')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} specpart. {tLayout('allRightsReserved')}
          </p>

          {/* Discreet Developer Credits */}
          <p className="text-[11px] text-white/20">
            Made by{' '}
            <a
              href="https://www.linkedin.com/in/aziz-jlassi111/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 transition-colors hover:text-white/60"
            >
              Med Aziz Jlassi
            </a>
            {' & '}
            <a
              href="https://www.linkedin.com/in/mohamed-harbi-4385471ab/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 transition-colors hover:text-white/60"
            >
              Mohamed Harbi
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
