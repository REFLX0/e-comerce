import { Shield, Truck, CreditCard, Headphones, Tag, Package } from 'lucide-react'

const badges = [
  {
    icon: Shield,
    title: 'PAIEMENT',
    desc: '100% SÉCURISÉ',
  },
  {
    icon: Tag,
    title: 'LE MEILLEUR',
    desc: 'PRIX GARANTI',
  },
  {
    icon: Truck,
    title: 'LIVRAISON EXPRESS',
    desc: 'Paiement à la livraison',
  },
  {
    icon: CreditCard,
    title: 'PAIEMENT',
    desc: 'À LA LIVRAISON',
  },
  {
    icon: Package,
    title: 'COMMANDES',
    desc: 'EN GROS',
  },
  {
    icon: Headphones,
    title: 'SERVICE CLIENT',
    desc: 'À VOTRE ÉCOUTE',
  },
]

export function TrustBadges() {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="section-padding">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-brand-surface flex items-center justify-center mb-4 group-hover:-translate-y-2 transition-transform duration-300">
                <badge.icon className="w-8 h-8 text-brand-primary group-hover:text-brand-accent transition-colors" />
              </div>
              <h3 className="font-display font-bold text-brand-primary text-sm uppercase mb-1">{badge.title}</h3>
              <p className="text-xs text-gray-500 uppercase">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
