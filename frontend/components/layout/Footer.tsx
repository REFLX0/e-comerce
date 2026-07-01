import Link from 'next/link'
import { Phone, Mail, MapPin, Share2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-brand-primary-dark mt-auto pt-16 pb-8 text-gray-300">
      <div className="section-padding">
        <div className="mb-12 grid grid-cols-1 gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Informations */}
          <div>
            <h3 className="font-display mb-6 text-lg font-semibold text-white">Informations</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/a-propos" className="hover:text-brand-accent transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="hover:text-brand-accent transition-colors">
                  Conditions générales de vente
                </Link>
              </li>
              <li>
                <Link
                  href="/mentions-legales"
                  className="hover:text-brand-accent transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-accent transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-accent transition-colors">
                  Contactez-nous
                </Link>
              </li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h3 className="font-display mb-6 text-lg font-semibold text-white">Compte</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/compte" className="hover:text-brand-accent transition-colors">
                  Mon compte
                </Link>
              </li>
              <li>
                <Link
                  href="/compte/commandes"
                  className="hover:text-brand-accent transition-colors"
                >
                  Mes commandes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="KiosqueTN" className="h-10 w-auto object-contain brightness-0 invert" />
            </Link>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-brand-accent mt-1 shrink-0" />
                <span className="text-sm">
                  Route Manzel Chaker Km 1, Rue Kerbala, 3072 Sfax - Tunisie
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-brand-accent shrink-0" />
                <span className="text-sm">+216 92 975 959</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-brand-accent shrink-0" />
                <span className="text-sm">contact@kiosquetn.tn</span>
              </li>
            </ul>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/KiosqueTN/"
                target="_blank"
                rel="noreferrer"
                className="hover:bg-brand-accent flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:text-white"
              >
                <Share2 size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} KiosqueTN. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
