import Link from 'next/link'
import { Share2, Phone, Mail, MapPin, CreditCard, Truck } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-brand-primary-dark text-gray-300 pt-16 pb-8 mt-auto">
      <div className="section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-white/10 pb-12">
          {/* Informations */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-6">Informations</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/qui-sommes-nous" className="hover:text-brand-accent transition-colors">Qui sommes-nous ?</Link></li>
              <li><Link href="/politique-de-confidentialite" className="hover:text-brand-accent transition-colors">Politique de confidentialité</Link></li>
              <li><Link href="/conditions-de-vente" className="hover:text-brand-accent transition-colors">Conditions de vente</Link></li>
              <li><Link href="/conditions-utilisation" className="hover:text-brand-accent transition-colors">Conditions d'utilisation</Link></li>
              <li><Link href="/livraison-et-retour" className="hover:text-brand-accent transition-colors">Livraison et retour</Link></li>
              <li><Link href="/contact" className="hover:text-brand-accent transition-colors">Contactez-nous</Link></li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-6">Compte</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/mon-compte" className="hover:text-brand-accent transition-colors">Mon compte</Link></li>
              <li><Link href="/mes-commandes" className="hover:text-brand-accent transition-colors">Mes commandes</Link></li>
              <li><Link href="/favoris" className="hover:text-brand-accent transition-colors">Liste de mes favoris</Link></li>
              <li><Link href="/comparer" className="hover:text-brand-accent transition-colors">Comparaison de produits</Link></li>
              <li><Link href="/logout" className="hover:text-brand-accent transition-colors">Se déconnecter</Link></li>
            </ul>
          </div>

          {/* Boutique */}
          <div>
            <h3 className="text-white font-display font-semibold text-lg mb-6">Boutique</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/nouveaux-produits" className="hover:text-brand-accent transition-colors">Nouveaux produits</Link></li>
              <li><Link href="/meilleures-ventes" className="hover:text-brand-accent transition-colors">Meilleures ventes</Link></li>
              <li><Link href="/promotions" className="hover:text-brand-accent transition-colors">Nos promotions</Link></li>
            </ul>
          </div>

          {/* Contact (Besoin d'aide) */}
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
