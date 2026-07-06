"use client"

import Image from 'next/image'
import { ShieldCheck, Zap, Clock, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/routing'

const features = [
  { icon: ShieldCheck, label: 'BETTER ENGINE', sub: 'PROTECTION' },
  { icon: Zap,         label: 'ENHANCED',      sub: 'PERFORMANCE' },
  { icon: Clock,       label: 'LONGER ENGINE', sub: 'LIFE' },
]

export function HeroBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0B0B0C]">
      <div className="section-padding relative z-10 grid min-h-[560px] items-center gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-0">

        {/* ── Left: Copy ────────────────────────────────────────── */}
        <div className="flex flex-col justify-center">
          <h1
            className="text-5xl font-bold uppercase tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
            style={{ lineHeight: 1.05, fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
          >
            High Performance
            <br />
            <span className="italic">Engine Oils</span>
          </h1>

          <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-[#E10600] sm:text-base">
            Maximum Protection. Maximum Performance.
          </p>

          {/* Feature icons */}
          <div className="mt-10 flex flex-wrap gap-8">
            {features.map((f) => (
              <div key={f.label} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 text-white/80">
                  <f.icon size={24} strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">{f.label}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">{f.sub}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10">
            <Link
              href="/catalogue"
              className="group inline-flex h-14 items-center gap-3 bg-[#E10600] px-10 text-sm font-bold uppercase tracking-widest text-white transition-all duration-200 hover:bg-[#b80500] hover:shadow-[0_8px_30px_rgba(225,6,0,0.35)]"
            >
              Shop Now
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ── Right: Product Image ──────────────────────────────── */}
        <div className="relative hidden h-[520px] items-center justify-center lg:flex">
          <Image
            src="/img/hero/hero_oils.png"
            alt="Premium Motor Oils"
            fill
            className="object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)]"
            priority
          />
        </div>
      </div>

      {/* Subtle gradient accent at bottom */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#E10600]/40 to-transparent" />
    </section>
  )
}
