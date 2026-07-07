import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Shield, Award, Truck, Users, MapPin, Clock } from 'lucide-react'

export const metadata = {
  title: 'À propos | KiosqueTN',
  description:
    'Découvrez KiosqueTN, le spécialiste de la vente de lubrifiants et huiles moteur en Tunisie.',
}

export default function AProposPage() {
  return (
    <>
      {/* Hero */}
      <section className="from-brand-primary to-brand-primary-dark bg-gradient-to-br py-16 text-white md:py-24">
        <div className="section-padding text-center">
          <h1 className="font-display mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            À propos de <span className="text-brand-accent">KiosqueTN</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80 md:text-xl">
            Le partenaire de confiance pour tous vos besoins en lubrifiants et huiles moteur en
            Tunisie.
          </p>
        </div>
      </section>

      <div className="section-padding py-12">
        <Breadcrumb items={[{ label: 'À propos' }]} />

        {/* Story */}
        <section className="mx-auto mt-12 max-w-4xl">
          <h2 className="font-display text-brand-primary mb-6 text-3xl font-bold">
            Notre Histoire
          </h2>
          <div className="prose prose-lg space-y-4 text-gray-600">
            <p>
              Fondée en Tunisie, <strong>KiosqueTN</strong> s&apos;est imposée comme le leader de la
              distribution de lubrifiants et d&apos;huiles moteur de qualité supérieure. Notre
              mission est simple : rendre accessibles les meilleurs produits de lubrification à tous
              les automobilistes et professionnels tunisiens.
            </p>
            <p>
              Nous travaillons en partenariat avec les plus grandes marques mondiales — Castrol,
              Shell, Total, Mobil, Motul — pour garantir à nos clients des produits 100%
              authentiques, livrés rapidement partout en Tunisie.
            </p>
            <p>
              Notre équipe d&apos;experts est passionnée par l&apos;automobile et se tient à votre
              disposition pour vous conseiller et vous accompagner dans le choix du lubrifiant
              adapté à votre véhicule.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mt-16">
          <h2 className="font-display text-brand-primary mb-10 text-center text-3xl font-bold">
            Nos Valeurs
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Shield,
                title: 'Authenticité',
                desc: 'Tous nos produits sont 100% originaux et certifiés par les marques.',
              },
              {
                icon: Award,
                title: 'Qualité',
                desc: 'Nous sélectionnons uniquement les meilleures références du marché.',
              },
              {
                icon: Truck,
                title: 'Rapidité',
                desc: 'Livraison partout en Tunisie sous 24 à 48 heures.',
              },
              {
                icon: Users,
                title: 'Expertise',
                desc: 'Une équipe de spécialistes à votre écoute pour vous conseiller.',
              },
              {
                icon: MapPin,
                title: 'Proximité',
                desc: 'Un service client tunisien, disponible et réactif.',
              },
              {
                icon: Clock,
                title: 'Fiabilité',
                desc: 'Des milliers de clients satisfaits nous font confiance chaque jour.',
              },
            ].map((v) => (
              <div
                key={v.title}
                className="shadow-soft rounded-2xl border border-gray-100 bg-white p-8 transition-shadow hover:shadow-lg"
              >
                <div className="bg-brand-accent/10 mb-5 flex h-14 w-14 items-center justify-center rounded-xl">
                  <v.icon size={28} className="text-brand-accent" />
                </div>
                <h3 className="font-display text-brand-primary mb-2 text-xl font-semibold">
                  {v.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-brand-primary mt-16 rounded-3xl p-12 text-white">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: '10K+', label: 'Clients satisfaits' },
              { value: '500+', label: 'Produits référencés' },
              { value: '24/48h', label: 'Délai de livraison' },
              { value: '100%', label: 'Produits originaux' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-brand-accent mb-2 text-3xl font-bold md:text-4xl">
                  {s.value}
                </div>
                <div className="text-sm text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
