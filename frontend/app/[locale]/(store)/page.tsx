import Link from 'next/link'
import { ArrowRight, Shield, Truck, CreditCard, Headphones, Tag, Package } from 'lucide-react'
import { HeroBanner } from '@/components/home/HeroBanner'
import { OilFinderWidget } from '@/features/oil-finder/components/OilFinderWidget'
import { BestSellers } from '@/components/home/BestSellers'
import { BrandsBar } from '@/components/home/BrandsBar'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { PromosBanner } from '@/components/home/PromosBanner'

// ── Trust badges data ─────────────────────────────────────────────────
const trustBadges = [
  { icon: Shield,     title: 'Paiement',           desc: '100% Sécurisé' },
  { icon: Tag,        title: 'Meilleur Prix',       desc: 'Garanti' },
  { icon: Truck,      title: 'Livraison Express',   desc: 'Paiement à la livraison' },
  { icon: CreditCard, title: 'Paiement',            desc: 'À la livraison' },
  { icon: Package,    title: 'Commandes en gros',   desc: 'Prix dégressifs' },
  { icon: Headphones, title: 'Service client',      desc: 'À votre écoute' },
]

export default function Home() {
  return (
    <>
      {/* ── Section 1: Hero ─────────────────────────────────────────────
          Full-width photographic category cards with gradient overlays.
          The HeroBanner is a standalone section with its own internal grid.
          ─────────────────────────────────────────────────────────────── */}
      <HeroBanner />

      {/* ── Section 2: Oil Finder — grid-aligned, -mt overlapping hero ──
          This widget sits on the 12-column grid with an overlap that
          creates visual tension between sections (Müller-Brockmann).
          Uses cols 1→13 (full width) with internal padding.
          ─────────────────────────────────────────────────────────────── */}
      <div className="spread relative z-10 -mt-16 md:-mt-24">
        <div className="wrap" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="grid-layout">
            {/* Oil finder spans full 12 columns */}
            <div className="band">
              <div style={{ gridColumn: '1 / -1' }}>
                <OilFinderWidget />
              </div>
            </div>
          </div>
          {/* Grid overlay for this spread */}
          <div className="guides" aria-hidden="true">
            <div className="cols" />
            <div className="rows" />
            <div className="mline l" />
            <div className="mline r" />
          </div>
        </div>
      </div>

      {/* ── Section 3: Trust Badges ─────────────────────────────────────
          6 badges × 2 columns each = full 12-column row.
          Border top/bottom creates a typographic rule (Swiss style).
          ─────────────────────────────────────────────────────────────── */}
      <section
        className="spread border-y border-gray-100 bg-white"
        aria-label="Nos engagements"
      >
        <div
          className="wrap"
          style={{
            paddingTop: 'calc(var(--lh) * 3)',    /* 72px = 9 × 8px */
            paddingBottom: 'calc(var(--lh) * 3)',
          }}
        >
          <div className="grid-layout">
            <div className="band" role="list">
              {trustBadges.map((badge, i) => (
                <div
                  key={badge.title + i}
                  role="listitem"
                  className="group flex flex-col items-center text-center"
                  style={{ gridColumn: `${i * 2 + 1} / ${i * 2 + 3}` }}
                >
                  <div
                    className="bg-brand-surface mb-4 flex h-16 w-16 items-center justify-center
                               rounded-2xl transition-transform duration-300 group-hover:-translate-y-1.5"
                    aria-hidden="true"
                  >
                    <badge.icon
                      className="text-brand-primary group-hover:text-brand-accent h-8 w-8 transition-colors duration-200"
                    />
                  </div>
                  <h3 className="font-display text-brand-primary mb-1 text-sm font-bold">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-gray-500">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="guides" aria-hidden="true">
            <div className="cols" />
            <div className="rows" />
            <div className="mline l" />
            <div className="mline r" />
          </div>
        </div>
      </section>

      {/* ── Section 4: Brands Bar ──────────────────────────────────────
          Logo row. Left col = label, right = scrolling logo strip.
          ─────────────────────────────────────────────────────────────── */}
      <BrandsBar />

      {/* ── Section 5: Category Grid ───────────────────────────────────
          6-category tiles in a 12-col grid (2 cols each on desktop).
          ─────────────────────────────────────────────────────────────── */}
      <CategoryGrid />

      {/* ── Section 6: Promos CTA Banner ──────────────────────────────
          Yellow/accent full-width banner — asymmetric composition.
          ─────────────────────────────────────────────────────────────── */}
      <PromosBanner />

      {/* ── Section 7: Best Sellers ────────────────────────────────────
          Product grid with skeleton loading and error recovery.
          ─────────────────────────────────────────────────────────────── */}
      <BestSellers />

      {/* ── Section 8: Newsletter / Final CTA ─────────────────────────
          A tight 2-column layout: copy on left (cols 1-7),
          form on right (cols 8-13). Pure whitespace separation.
          ─────────────────────────────────────────────────────────────── */}
      <section className="spread bg-brand-primary" aria-label="Newsletter">
        <div
          className="wrap"
          style={{
            paddingTop: 'calc(var(--lh) * 5)',
            paddingBottom: 'calc(var(--lh) * 5)',
          }}
        >
          <div className="grid-layout">
            <div className="band items-center">
              {/* Copy — left 7 columns */}
              <div style={{ gridColumn: '1 / 8' }}>
                <p
                  className="font-mono mb-3 text-xs tracking-widest text-white/50 uppercase"
                  data-optical
                >
                  Restez informé
                </p>
                <h2
                  className="font-display mb-4 text-3xl font-bold text-white md:text-4xl"
                  data-optical
                >
                  Offres exclusives & nouveautés
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Recevez en avant-première nos promotions, nouveaux produits et
                  conseils techniques directement dans votre boîte mail.
                </p>
              </div>

              {/* Form — right 5 columns */}
              <div style={{ gridColumn: '8 / 13' }}>
                <form
                  className="flex flex-col gap-4"
                  aria-label="Inscription newsletter"
                >
                  <div>
                    <label htmlFor="newsletter-email" className="sr-only">
                      Adresse email
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      placeholder="votre@email.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-5
                                 text-white placeholder:text-white/40 backdrop-blur-sm
                                 transition-all focus:border-brand-accent focus:bg-white/15
                                 focus:ring-2 focus:ring-brand-accent/30 focus:outline-none"
                      style={{ height: 48 }} /* 6 × 8px baseline */
                      aria-label="Adresse email"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-primary w-full"
                    aria-label="S'inscrire à la newsletter"
                  >
                    S&apos;inscrire gratuitement
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                  <p className="text-xs text-white/40">
                    Pas de spam. Désinscription en un clic.
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* Grid overlay for this spread */}
          <div className="guides" aria-hidden="true">
            <div className="cols" />
            <div className="rows" />
            <div className="mline l" />
            <div className="mline r" />
          </div>
        </div>
      </section>
    </>
  )
}
