"use client"

import { Link } from '@/i18n/routing'
import { Phone, Mail, MapPin, ArrowRight, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'

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

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return toast.error('Please enter a valid email')
    toast.success('Subscribed!')
    setEmail('')
  }

  return (
    <footer className="bg-[#0B0B0C]">
      <div className="section-padding pt-16 pb-10">
        <div className="mb-14 grid grid-cols-1 gap-10 border-b border-white/8 pb-14 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand + Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-5 inline-block">
              <Image src="/logo.png" alt="KiosqueTN" width={120} height={36} className="h-8 w-auto brightness-0 invert" />
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/40">
              Specialist in lubricants and auto parts for passenger, commercial and industrial vehicles since 15+ years.
            </p>
            {/* Newsletter inline */}
            <form onSubmit={handleNewsletter} className="flex gap-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-10 flex-1 border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/25 focus:border-[#E10600] focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#E10600] text-white transition-colors hover:bg-[#b80500]"
                aria-label="Subscribe"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Information */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-white/30">
              Information
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/a-propos', label: 'About Us' },
                { href: '/cgv', label: 'Terms & Conditions' },
                { href: '/mentions-legales', label: 'Legal Notice' },
                { href: '/faq', label: 'FAQ' },
                { href: '/contact', label: 'Contact Us' },
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
              My Account
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/compte', label: 'Dashboard' },
                { href: '/compte/commandes', label: 'My Orders' },
                { href: '/compte/favoris', label: 'Wishlist' },
                { href: '/auth/login', label: 'Sign In' },
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
              Contact
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#E10600]" />
                <span className="text-white/40">Kélibia, Tunisia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-[#E10600]" />
                <a href="tel:+21692975959" className="text-white/40 hover:text-white">+216 92 975 959</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-[#E10600]" />
                <a href="mailto:contact@kiosquetn.tn" className="text-white/40 hover:text-white">contact@kiosquetn.tn</a>
              </li>
            </ul>

            {/* Social */}
            <div className="mt-6 flex gap-3">
              <a href="https://www.facebook.com/KiosqueTN/" target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded border border-white/10 text-white/40 transition-all hover:border-[#E10600] hover:text-[#E10600]">
                <Facebook size={16} />
              </a>
              <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded border border-white/10 text-white/40 transition-all hover:border-[#E10600] hover:text-[#E10600]">
                <Instagram size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-white/20 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} KiosqueTN. All rights reserved.</p>
          <p>Made by Mohamed Harbi & Mohamed Aziz Jlassi</p>
        </div>
      </div>
    </footer>
  )
}
