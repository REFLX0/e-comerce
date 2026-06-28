import Link from 'next/link'
import { Phone, Mail, MapPin, Share2 } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-brand-primary-dark text-gray-300 pt-16 pb-8 mt-auto">
      <div className="section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12 border-b border-white/10 pb-12">
          {/* Informations */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-6">Informations</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/a-propos" className="hover:text-brand-accent transition-colors">À propos</Link></li>
              <li><Link href="/cgv" className="hover:text-brand-accent transition-colors">Conditions générales de vente</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-brand-accent transition-colors">Mentions légales</Link></li>
              <li><Link href="/faq" className="hover:text-brand-accent transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-brand-accent transition-colors">Contactez-nous</Link></li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-6">Compte</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/compte" className="hover:text-brand-accent transition-colors">Mon compte</Link></li>
              <li><Link href="/compte/commandes" className="hover:text-brand-accent transition-colors">Mes commandes</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="font-display font-bold text-3xl tracking-tight text-white">
                Best<span className="text-brand-accent">oil</span>
              </span>
            </Link>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-brand-accent shrink-0 mt-1" />
                <span className="text-sm">Route Manzel Chaker Km 1, Rue Kerbala, 3072 Sfax - Tunisie</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-brand-accent shrink-0" />
                <span className="text-sm">+216 92 975 959</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-brand-accent shrink-0" />
                <span className="text-sm">contact@bestoil.tn</span>
              </li>
            </ul>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/Bestoil.Tunisie/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-accent hover:text-white transition-all text-white">
                <Share2 size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Bestoil Tunisie. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
