import Link from 'next/link'
import { Share2, Phone, Mail, MapPin, CreditCard, Truck } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-brand-primary-dark text-gray-300 pt-16 pb-8 mt-auto">
      <div className="section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-white/10 pb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="font-display font-bold text-3xl tracking-tight text-white">
                Best<span className="text-brand-accent">Lub</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Le spécialiste numéro 1 de la vente de lubrifiants et d'huiles moteur en Tunisie. Des produits authentiques, des conseils d'experts et une livraison rapide partout.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-accent hover:text-white transition-all text-white">
                <Share2 size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-accent hover:text-white transition-all text-white">
                <Share2 size={20} />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-6">Contactez-nous</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-brand-accent shrink-0 mt-1" />
                <span className="text-sm">Zone Industrielle, Megrine, Ben Arous, Tunisie</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-brand-accent shrink-0" />
                <span className="text-sm">+216 71 123 456</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-brand-accent shrink-0" />
                <span className="text-sm">contact@bestlub.tn</span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-6">Liens Utiles</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/catalogue" className="hover:text-brand-accent transition-colors">Notre Catalogue</Link></li>
              <li><Link href="/promotions" className="hover:text-brand-accent transition-colors">Promotions</Link></li>
              <li><Link href="/trouver-mon-huile" className="hover:text-brand-accent transition-colors">Trouver mon huile</Link></li>
              <li><Link href="/espace-pro" className="hover:text-brand-accent transition-colors">Espace Professionnel</Link></li>
              <li><Link href="/blog" className="hover:text-brand-accent transition-colors">Blog & Conseils</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-6">Informations</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/a-propos" className="hover:text-brand-accent transition-colors">À propos de nous</Link></li>
              <li><Link href="/faq" className="hover:text-brand-accent transition-colors">Foire aux questions</Link></li>
              <li><Link href="/cgv" className="hover:text-brand-accent transition-colors">Conditions de vente</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-brand-accent transition-colors">Mentions légales</Link></li>
              <li><Link href="/contact" className="hover:text-brand-accent transition-colors">Nous contacter</Link></li>
            </ul>
          </div>
        </div>

        {/* Features / Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-brand-primary rounded-2xl p-8">
          <div className="flex items-center gap-4">
            <Truck className="text-brand-accent w-10 h-10" />
            <div>
              <h4 className="text-white font-medium">Livraison Rapide</h4>
              <p className="text-xs text-white/70">Partout en Tunisie</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CreditCard className="text-brand-accent w-10 h-10" />
            <div>
              <h4 className="text-white font-medium">Paiement Sécurisé</h4>
              <p className="text-xs text-white/70">À la livraison ou en ligne</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-brand-accent text-brand-accent font-bold text-lg shrink-0">100%</div>
            <div>
              <h4 className="text-white font-medium">Produits Originaux</h4>
              <p className="text-xs text-white/70">Garantis authentiques</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="text-brand-accent w-10 h-10" />
            <div>
              <h4 className="text-white font-medium">Support Expert</h4>
              <p className="text-xs text-white/70">À votre écoute 6j/7</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} BestLub Tunisie. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/cgv" className="hover:text-white transition-colors">CGV</Link>
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
