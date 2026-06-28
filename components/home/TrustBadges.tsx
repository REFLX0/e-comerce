import { ShieldCheck, ThumbsUp, Wrench, Headphones } from 'lucide-react'

export function TrustBadges() {
  const badges = [
    {
      icon: <ShieldCheck size={32} />,
      title: "Paiement 100% Sécurisé",
      description: "À la livraison ou par carte bancaire en ligne avec chiffrement SSL."
    },
    {
      icon: <ThumbsUp size={32} />,
      title: "Garantie Satisfait ou Remboursé",
      description: "Vous disposez de 14 jours pour changer d'avis sur votre commande."
    },
    {
      icon: <Wrench size={32} />,
      title: "Huiles 100% Originales",
      description: "Produits certifiés authentiques, directement depuis les fabricants."
    },
    {
      icon: <Headphones size={32} />,
      title: "Service Client Dédié",
      description: "Des experts à votre écoute du lundi au samedi de 8h à 18h."
    }
  ]

  return (
    <section className="bg-white py-12 border-b border-brand-surface-dark">
      <div className="section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-brand-surface text-brand-primary flex items-center justify-center mb-4">
                {badge.icon}
              </div>
              <h3 className="font-display font-semibold text-brand-primary mb-2">
                {badge.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
