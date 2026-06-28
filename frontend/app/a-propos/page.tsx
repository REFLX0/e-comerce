import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Shield, Award, Truck, Users, MapPin, Clock } from 'lucide-react'

export const metadata = {
  title: 'À propos | BestLub Tunisie',
  description: 'Découvrez BestLub, le spécialiste de la vente de lubrifiants et huiles moteur en Tunisie.',
}

export default function AProposPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white py-16 md:py-24">
        <div className="section-padding text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-4">
            À propos de <span className="text-brand-accent">BestLub</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Le partenaire de confiance pour tous vos besoins en lubrifiants et huiles moteur en Tunisie.
          </p>
        </div>
      </section>

      <div className="section-padding py-12">
        <Breadcrumb items={[{ label: 'À propos' }]} />

        {/* Story */}
        <section className="mt-12 max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-brand-primary mb-6">Notre Histoire</h2>
          <div className="prose prose-lg text-gray-600 space-y-4">
            <p>
              Fondée en Tunisie, <strong>BestLub</strong> s&apos;est imposée comme le leader de la distribution de lubrifiants et d&apos;huiles moteur de qualité supérieure. Notre mission est simple : rendre accessibles les meilleurs produits de lubrification à tous les automobilistes et professionnels tunisiens.
            </p>
            <p>
              Nous travaillons en partenariat avec les plus grandes marques mondiales — Castrol, Shell, Total, Mobil, Motul — pour garantir à nos clients des produits 100% authentiques, livrés rapidement partout en Tunisie.
            </p>
            <p>
              Notre équipe d&apos;experts est passionnée par l&apos;automobile et se tient à votre disposition pour vous conseiller et vous accompagner dans le choix du lubrifiant adapté à votre véhicule.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mt-16">
          <h2 className="font-display font-bold text-3xl text-brand-primary mb-10 text-center">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Authenticité', desc: 'Tous nos produits sont 100% originaux et certifiés par les marques.' },
              { icon: Award, title: 'Qualité', desc: 'Nous sélectionnons uniquement les meilleures références du marché.' },
              { icon: Truck, title: 'Rapidité', desc: 'Livraison partout en Tunisie sous 24 à 48 heures.' },
              { icon: Users, title: 'Expertise', desc: 'Une équipe de spécialistes à votre écoute pour vous conseiller.' },
              { icon: MapPin, title: 'Proximité', desc: 'Un service client tunisien, disponible et réactif.' },
              { icon: Clock, title: 'Fiabilité', desc: 'Des milliers de clients satisfaits nous font confiance chaque jour.' },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-5">
                  <v.icon size={28} className="text-brand-accent" />
                </div>
                <h3 className="font-display font-semibold text-xl text-brand-primary mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mt-16 bg-brand-primary rounded-3xl p-12 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Clients satisfaits' },
              { value: '500+', label: 'Produits référencés' },
              { value: '24/48h', label: 'Délai de livraison' },
              { value: '100%', label: 'Produits originaux' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-bold text-brand-accent mb-2">{s.value}</div>
                <div className="text-sm text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
