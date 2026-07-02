import { Link } from '@/i18n/routing'
import { Phone, Mail, MapPin, Share2, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-brand-primary-dark">
      <div className="h-px w-full bg-brand-accent/50" />

      <div className="section-padding relative pt-16 pb-10">
        <div className="mb-14 grid grid-cols-1 gap-12 border-b border-white/8 pb-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="inline-flex rounded-lg bg-white p-2">
                <img
                  src="/logo.png"
                  alt="KiosqueTN"
                  className="h-10 w-auto object-contain"
                />
              </span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-white/45 max-w-xs">
              Spécialiste en lubrifiants et pièces auto pour véhicules particuliers, utilitaires et industriels depuis plus de 15 ans.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/KiosqueTN/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook KiosqueTN"
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/8 text-white/60
                           transition-all duration-200 hover:bg-brand-accent hover:text-brand-primary"
              >
                <Share2 size={17} />
              </a>
            </div>
          </div>

          {/* Informations */}
          <div>
            <h3 className="font-display mb-6 text-xs font-bold tracking-[0.15em] text-white/30 uppercase">
              Informations
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/a-propos', label: 'À propos' },
                { href: '/cgv', label: 'Conditions générales de vente' },
                { href: '/mentions-legales', label: 'Mentions légales' },
                { href: '/faq', label: 'FAQ' },
                { href: '/contact', label: 'Contactez-nous' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex min-h-11 items-center gap-2 text-white/48 transition-colors duration-200 hover:text-white"
                  >
                    <ArrowRight size={13} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-brand-accent" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mon Compte */}
          <div>
            <h3 className="font-display mb-6 text-xs font-bold tracking-[0.15em] text-white/30 uppercase">
              Mon Compte
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/compte', label: 'Mon espace client' },
                { href: '/compte/commandes', label: 'Mes commandes' },
                { href: '/compte/favoris', label: 'Mes favoris' },
                { href: '/auth/login', label: 'Connexion' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex min-h-11 items-center gap-2 text-white/48 transition-colors duration-200 hover:text-white"
                  >
                    <ArrowRight size={13} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-brand-accent" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display mb-6 text-xs font-bold tracking-[0.15em] text-white/30 uppercase">
              Contact
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10">
                  <MapPin size={15} className="text-brand-accent" />
                </div>
                <span className="text-white/45 leading-relaxed">
                  Kélibia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10">
                  <Phone size={15} className="text-brand-accent" />
                </div>
                <a href="tel:+21692975959" className="flex min-h-11 items-center text-white/48 transition-colors duration-200 hover:text-white">
                  +216 92 975 959
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10">
                  <Mail size={15} className="text-brand-accent" />
                </div>
                <a href="mailto:contact@kiosquetn.tn" className="flex min-h-11 items-center text-white/48 transition-colors duration-200 hover:text-white">
                  contact@kiosquetn.tn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with Trust Badges */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          
          <div className="flex gap-4 items-center opacity-60">
            {/* Payment Trust Signals */}
            <div className="flex items-center gap-2 bg-white/5 rounded px-2 py-1 border border-white/10">
               <span className="text-white text-xs font-bold tracking-wider">SECURE PAY</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded px-2 py-1 border border-white/10">
               <span className="text-white text-xs font-bold tracking-wider">VISA</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded px-2 py-1 border border-white/10">
               <span className="text-white text-xs font-bold tracking-wider">MASTERCARD</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-xs text-white/20 md:items-end">
            <p>© {new Date().getFullYear()} KiosqueTN. Tous droits réservés.</p>
            <p className="text-white/12">Made By Mohamed Harbi & Mohamed Aziz Jlassi </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
