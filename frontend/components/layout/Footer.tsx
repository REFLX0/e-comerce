'use client'

import { Link } from '@/i18n/routing'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
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
  { href: '/categorie/huiles-moteur', label: 'Huiles Moteur' },
  { href: '/categorie/liquides-auto', label: 'Liquides' },
  { href: '/categorie/auto-filtres', label: 'Filtres' },
  { href: '/categorie/additifs', label: 'Additifs' },
  { href: '/catalogue', label: 'Toutes les catégories' },
]

const SERVICE_LINKS = [
  { href: '/a-propos', label: 'À propos' },
  { href: '/livraison', label: 'Livraison & Information' },
  { href: '/retours', label: 'Retours & Remboursements' },
  { href: '/cgv', label: 'Conditions Générales' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Nous contacter' },
]

const ACCOUNT_LINKS = [
  { href: '/compte/commandes', label: 'Mes Commandes' },
  { href: '/compte/wishlist', label: 'Ma Wishlist' },
  { href: '/compte', label: 'Suivi de commande' },
  { href: '/compte/securite', label: 'Paramètres du compte' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const tFooter = useTranslations('Footer')
  const tHome = useTranslations('Home')
  const tLayout = useTranslations('Layout')
  const siteLogo = '/logo.jpg'

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
            <Link href="/" className="mb-5 inline-flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="specpart" className="h-20 w-auto object-contain sm:h-24" />
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
              Boutique
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SHOP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Service Client */}
          <div>
            <h3 className="mb-5 text-xs font-bold tracking-[0.15em] text-white/30 uppercase">
              Service Client
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SERVICE_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Mon Compte */}
          <div>
            <h3 className="mb-5 text-xs font-bold tracking-[0.15em] text-white/30 uppercase">
              Mon Compte
            </h3>
            <ul className="space-y-2.5 text-sm">
              {ACCOUNT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact */}
          <div>
            <h3 className="mb-5 text-xs font-bold tracking-[0.15em] text-white/30 uppercase">
              Contact
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Clock size={15} className="text-brand-accent mt-0.5 shrink-0" />
                <span className="text-white/40">Lun–Sam 8h–18h</span>
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
                <span className="text-white/40">Kalâa, Tunisie</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} specpart. {tLayout('allRightsReserved')}
          </p>

          {/* Payment logos text badges */}
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'D17', 'FLOUSS'].map((label) => (
              <span
                key={label}
                className="flex h-7 min-w-[42px] items-center justify-center rounded border border-white/10 bg-white/5 px-2 text-[10px] font-black tracking-wider text-white/40"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
