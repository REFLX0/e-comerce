"use client"

import Image from 'next/image'
import { ArrowDown, Award, CheckCircle2, Gauge, Package, ShieldCheck, Truck } from 'lucide-react'
import { Link } from '@/i18n/routing'

const heroBadges = [
  { icon: Award, label: 'Distributeur officiel' },
  { icon: Package, label: '5000+ références' },
  { icon: Truck, label: 'Livraison rapide' },
  { icon: ShieldCheck, label: 'Conseil expert' },
]

const productTiles = [
  { logo: '/img/b/motul.svg', brand: 'Motul', spec: '5W-40', tone: 'bg-orange-50' },
  { logo: '/img/b/castrol.svg', brand: 'Castrol', spec: 'EDGE', tone: 'bg-green-50' },
  { logo: '/img/b/liqui-moly.svg', brand: 'Liqui Moly', spec: 'Synthèse', tone: 'bg-blue-50' },
  { logo: '/img/b/bosch.svg', brand: 'Bosch', spec: 'Filtres', tone: 'bg-red-50' },
]

export function HeroBanner() {
  const scrollToFinder = () => {
    document.getElementById('oil-finder')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative isolate overflow-hidden bg-brand-surface pt-12 pb-24 md:pt-16 md:pb-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(23,33,43,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(23,33,43,0.045) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="section-padding relative z-10 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(390px,0.75fr)] lg:items-center xl:gap-16">
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card/80 px-3 py-2 text-xs font-semibold uppercase tracking-normal text-brand-primary shadow-card backdrop-blur">
            <CheckCircle2 size={14} className="text-brand-accent" />
            La sélection automobile fiable
          </div>

          <h1 className="font-display text-4xl font-black leading-[1.08] text-brand-primary sm:text-5xl lg:text-6xl">
            KiosqueTN trouve l&apos;huile adaptée à votre moteur.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-brand-muted md:text-lg">
            Lubrifiants, filtres et pièces fiables avec recommandation par véhicule, disponibilité claire et commande rapide.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={scrollToFinder} className="btn-accent group w-full sm:w-auto">
              Trouver mon huile
              <ArrowDown size={18} className="transition-transform duration-200 group-hover:translate-y-0.5" />
            </button>
            <Link href="/catalogue" className="btn-secondary w-full sm:w-auto">
              Explorer le catalogue
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:hidden">
            {productTiles.slice(0, 2).map((item) => (
              <div key={item.brand} className="rounded-lg border border-brand-border bg-brand-card p-3 shadow-card">
                <div className="mb-3 flex h-12 items-center justify-center rounded-md bg-brand-surface p-2">
                  <Image src={item.logo} alt={item.brand} width={88} height={34} className="max-h-8 w-auto object-contain" />
                </div>
                <p className="text-xs font-semibold text-brand-muted">{item.brand}</p>
                <p className="text-sm font-bold text-brand-primary">{item.spec}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3">
            {heroBadges.map((badge) => (
              <div key={badge.label} className="flex min-h-20 items-center gap-3 rounded-lg border border-brand-border bg-brand-card/90 p-3 shadow-card backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-surface text-brand-primary">
                  <badge.icon size={20} />
                </div>
                <span className="text-sm font-semibold leading-snug text-brand-primary">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none relative hidden lg:block" aria-hidden="true">
          <div className="relative grid rotate-[-3deg] grid-cols-2 gap-4">
            {productTiles.map((item, index) => (
              <div
                key={item.brand}
                className={`rounded-lg border border-brand-border ${item.tone} p-4 shadow-card transition-transform duration-200 ${
                  index % 2 === 0 ? 'translate-y-7' : ''
                }`}
              >
                <div className="mb-5 flex h-20 items-center justify-center rounded-lg bg-brand-card p-4 shadow-sm">
                  <Image src={item.logo} alt="" width={120} height={48} className="max-h-12 w-auto object-contain" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-normal text-brand-muted">{item.brand}</p>
                    <p className="font-display text-lg font-bold text-brand-primary">{item.spec}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-brand-surface">
                    <Gauge size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
