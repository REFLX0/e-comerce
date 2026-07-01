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
    title: 'LIVRAISON',
    desc: 'RAPIDE & FIABLE',
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
    <section className="border-y border-gray-100 bg-white py-12">
      <div className="section-padding">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-6">
          {badges.map((badge, index) => (
            <div key={index} className="group flex flex-col items-center text-center">
              <div className="bg-brand-surface mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-translate-y-2">
                <badge.icon className="text-brand-primary group-hover:text-brand-accent h-8 w-8 transition-colors" />
              </div>
              <h3 className="font-display text-brand-primary mb-1 text-sm font-bold uppercase">
                {badge.title}
              </h3>
              <p className="text-xs text-gray-500 uppercase">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
