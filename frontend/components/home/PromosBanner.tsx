import { Link } from '@/i18n/routing'
import { Tag, ArrowRight } from 'lucide-react'

export function PromosBanner() {
  return (
    <section className="bg-gray-50 py-10 border-b border-gray-100">
      <div className="section-padding">
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-xl bg-gradient-to-r from-brand-accent to-brand-accent-hover p-8 text-white md:flex-row md:items-center md:p-12 shadow-xl shadow-red-500/10">
          {/* Decorative background pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)'
          }} />
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur md:flex shadow-sm">
              <Tag size={30} />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/90">Limited Time Offer</p>
              <h2 className="font-display mb-2 text-2xl font-black uppercase md:text-3xl">
                Up to 25% Off
              </h2>
              <p className="max-w-xl text-sm text-white/90 font-medium">
                On selected premium synthetic oils. Don't miss out on these exclusive deals.
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full shrink-0 md:w-auto">
            <Link
              href="/promotions"
              className="group flex min-h-12 w-full items-center justify-center gap-2 rounded bg-white px-8 py-3 text-center text-sm font-black uppercase tracking-wider text-brand-accent shadow-lg transition-all duration-200 hover:bg-white/90 md:w-auto hover:shadow-xl hover:-translate-y-0.5"
            >
              Shop Deals
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
