"use client"

import { Link } from '@/i18n/routing'
import { Phone, Mail, MapPin, ArrowRight, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const Facebook = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const Instagram = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><circle cx="12" cy="12" r="4.5" /><circle cx="17.5" cy="6.5" r="1.5" />
  </svg>
)

export default function Footer() {
  const [email, setEmail] = useState('')
  const tFooter = useTranslations('Footer')
  const tLayout = useTranslations('Layout')
  const tHome = useTranslations('Home')

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return toast.error(tHome('validEmail'))
    toast.success(tHome('thankYou'))
    setEmail('')
  }

  return (
    <footer className="bg-brand-primary-dark">
      <div className="section-padding pt-16 pb-10">
        <div className="mb-14 grid grid-cols-1 gap-10 border-b border-white/8 pb-14 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand + Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-5 inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg font-black text-white">
                K
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                specpart
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/40">
              {tFooter('description')}
            </p>
            {/* Newsletter inline */}
            <form onSubmit={handleNewsletter} className="flex gap-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tFooter('newsletterPlaceholder')}
                className="h-10 flex-1 border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/25 focus:border-brand-accent focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-accent text-brand-primary-dark transition-colors hover:bg-brand-accent-hover"
                aria-label={tFooter('subscribe')}
              >
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Information */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-white/30">
              {tFooter('information')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/a-propos', label: tFooter('aboutUs') },
                { href: '/cgv', label: tFooter('terms') },
                { href: '/mentions-legales', label: tFooter('legalNotice') },
                { href: '/faq', label: tFooter('faq') },
                { href: '/contact', label: tFooter('contactUs') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-white/30">
              {tFooter('myAccount')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/compte', label: tFooter('dashboard') },
                { href: '/compte/commandes', label: tFooter('myOrders') },
                { href: '/compte/wishlist', label: tFooter('wishlist') },
                { href: '/auth/login', label: tFooter('signIn') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-white/30">
              {tFooter('contact')}
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-accent" />
                <span className="text-white/40">Tunis, Tunisia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-brand-accent" />
                <a href="tel:+21629294195" className="text-white/40 hover:text-white">+216 29 294 195</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-brand-accent" />
                <a href="mailto:specpart@hotmail.com" className="text-white/40 hover:text-white">specpart@hotmail.com</a>
              </li>
            </ul>

            {/* Social */}
            <div className="mt-6 flex gap-3">
              <a href="https://www.facebook.com/specpart/" target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded border border-white/10 text-white/40 transition-all hover:border-brand-accent hover:text-brand-accent">
                <Facebook size={16} />
              </a>
              <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded border border-white/10 text-white/40 transition-all hover:border-brand-accent hover:text-brand-accent">
                <Instagram size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-white/20 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} specpart. {tLayout('allRightsReserved')}</p>
          <p>{tLayout('madeBy')}</p>
        </div>
      </div>
    </footer>
  )
}
