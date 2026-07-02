import { ArrowRight, Shield, Truck, CreditCard, Headphones, Tag, Package } from 'lucide-react'
import { HeroBanner } from '@/components/home/HeroBanner'
import { OilFinderWidget } from '@/features/oil-finder/components/OilFinderWidget'
import { BestSellers } from '@/components/home/BestSellers'
import { BrandsBar } from '@/components/home/BrandsBar'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { PromosBanner } from '@/components/home/PromosBanner'

const trustBadges = [
  { icon: Shield, title: 'Paiement', desc: '100% sécurisé' },
  { icon: Tag, title: 'Meilleur prix', desc: 'Garanti' },
  { icon: Truck, title: 'Livraison express', desc: 'Paiement à la livraison' },
  { icon: CreditCard, title: 'Paiement', desc: 'À la livraison' },
  { icon: Package, title: 'Commandes en gros', desc: 'Prix dégressifs' },
  { icon: Headphones, title: 'Service client', desc: 'À votre écoute' },
]

export default function Home() {
  return (
    <>
      <HeroBanner />

      <div className="section-padding relative z-10 -mt-14 md:-mt-20">
        <OilFinderWidget />
      </div>

      <section className="border-y border-brand-border bg-brand-card" aria-label="Nos engagements">
        <div className="section-padding py-10 md:py-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {trustBadges.map((badge, index) => (
              <div
                key={badge.title + index}
                className="group flex min-h-32 flex-col items-center justify-center rounded-lg border border-brand-border bg-brand-surface/60 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-accent/35 hover:bg-brand-card hover:shadow-card"
              >
                <div
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-card text-brand-primary shadow-sm transition-colors duration-200 group-hover:text-brand-accent"
                  aria-hidden="true"
                >
                  <badge.icon size={23} />
                </div>
                <h3 className="text-sm font-bold text-brand-primary">{badge.title}</h3>
                <p className="mt-1 text-xs text-brand-muted">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BrandsBar />
      <CategoryGrid />
      <PromosBanner />
      <BestSellers />

      <section className="bg-brand-primary" aria-label="Newsletter">
        <div className="section-padding py-14 md:py-20">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-normal text-brand-accent">
                Restez informé
              </p>
              <h2 className="font-display text-3xl font-bold leading-tight text-brand-surface md:text-4xl">
                Offres exclusives & nouveautés
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-brand-surface/70">
                Recevez en avant-première nos promotions, nouveaux produits et conseils techniques directement dans votre boîte mail.
              </p>
            </div>

            <form
              className="surface-card border-white/[0.10] bg-white/[0.08] p-4 backdrop-blur md:p-5"
              aria-label="Inscription newsletter"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Adresse email
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="votre@email.com"
                  autoComplete="email"
                  className="min-h-12 flex-1 rounded-lg border border-white/[0.18] bg-white/[0.10] px-4 text-brand-surface placeholder:text-brand-surface/50 transition-all duration-200 focus:border-brand-accent focus:bg-white/[0.15] focus:ring-2 focus:ring-brand-accent/30"
                  aria-label="Adresse email"
                />
                <button
                  type="button"
                  className="btn-accent shrink-0"
                  aria-label="S'inscrire à la newsletter"
                >
                  S&apos;inscrire
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
              <p className="mt-3 text-xs text-brand-surface/50">
                Pas de spam. Désinscription en un clic.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
