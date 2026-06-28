import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Briefcase, Percent, Truck, FileText, Users, Phone, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Espace Professionnel | BestLub Tunisie',
  description: 'Découvrez nos offres dédiées aux professionnels : tarifs préférentiels, livraison prioritaire et accompagnement personnalisé.',
}

export default function EspaceProPage() {
  const benefits = [
    { icon: Percent, title: 'Tarifs Préférentiels', desc: 'Bénéficiez de remises exclusives sur l\'ensemble de notre catalogue, avec des prix dégressifs selon les volumes commandés.' },
    { icon: Truck, title: 'Livraison Prioritaire', desc: 'Vos commandes sont traitées en priorité avec une livraison express sous 24h partout en Tunisie.' },
    { icon: FileText, title: 'Facturation Adaptée', desc: 'Recevez des factures pro-forma, bénéficiez de facilités de paiement et de conditions de crédit avantageuses.' },
    { icon: Users, title: 'Conseiller Dédié', desc: 'Un interlocuteur unique à votre écoute pour vous accompagner dans vos choix et vos commandes.' },
    { icon: Phone, title: 'Support Prioritaire', desc: 'Accédez à une ligne dédiée pour un service après-vente réactif et personnalisé.' },
    { icon: Briefcase, title: 'Catalogue Élargi', desc: 'Accédez à des références exclusives et à des conditionnements professionnels (fûts, palettes).' },
  ]

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white py-16 md:py-24">
        <div className="section-padding text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Briefcase size={18} />
            <span className="text-sm font-medium">Espace Professionnel</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-4">
            Espace <span className="text-brand-accent">Professionnel</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Des solutions sur mesure pour les garagistes, mécaniciens, flottes automobiles et revendeurs.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-brand-accent text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-accent/90 transition-colors text-lg">
            Créer un compte Pro <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <div className="section-padding py-12">
        <Breadcrumb items={[{ label: 'Espace Professionnel' }]} />

        {/* Benefits Grid */}
        <section className="mt-12">
          <h2 className="font-display font-bold text-3xl text-brand-primary mb-10 text-center">
            Vos Avantages Pro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-5">
                  <b.icon size={28} className="text-brand-accent" />
                </div>
                <h3 className="font-display font-semibold text-xl text-brand-primary mb-2">{b.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 bg-brand-primary rounded-3xl p-12 text-center text-white">
          <h2 className="font-display font-bold text-3xl mb-4">Prêt à rejoindre nos partenaires ?</h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            Créez votre compte professionnel en quelques minutes et commencez à bénéficier de tous nos avantages dès aujourd&apos;hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-brand-accent text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-accent/90 transition-colors">
              S&apos;inscrire maintenant <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors">
              Nous contacter
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
