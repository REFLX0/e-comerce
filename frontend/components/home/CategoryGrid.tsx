"use client";

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  ArrowRight,
  Droplets, Car, Gauge, CircleDot, Thermometer,
  Disc3, Bike, Tractor, Filter, Package, FlaskConical,
} from 'lucide-react'

// Map of category slug → local image override (takes priority over DB image)
const LOCAL_CATEGORY_IMAGES: Record<string, string> = {
  'lubrifiants':    '/img/categories/lubrifiant.png',
  'frein':          '/img/categories/frein.png',
  'hydraulique':    '/img/categories/hydraulique.png',
  'pieces-auto':    'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?q=80&w=600',
  'moto-karting':   'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600',
  'marine':         'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=600',
}

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string; desc?: string; descKey?: string }> = {
  'huiles-moteur':        { icon: Droplets,     color: 'text-amber-600',   bg: 'bg-amber-50',   descKey: 'catOilDesc' },
  'automobile':           { icon: Car,          color: 'text-blue-600',    bg: 'bg-blue-50',    desc: 'Voitures de tourisme & SUV' },
  'transmission':         { icon: Gauge,        color: 'text-cyan-600',    bg: 'bg-cyan-50',    descKey: 'catTransmissionDesc' },
  'hydraulique':          { icon: CircleDot,    color: 'text-sky-600',     bg: 'bg-sky-50',     descKey: 'catHydraulicDesc' },
  'graisses':             { icon: Disc3,        color: 'text-yellow-600',  bg: 'bg-yellow-50',  desc: 'Protection maximale' },
  'refroidissement':      { icon: Thermometer,  color: 'text-teal-600',    bg: 'bg-teal-50',    desc: 'Liquides de refroidissement' },
  'frein':                { icon: CircleDot,    color: 'text-red-600',     bg: 'bg-red-50',     descKey: 'catBrakeDesc' },
  'moto-karting':         { icon: Bike,         color: 'text-orange-600',  bg: 'bg-orange-50',  desc: '2 roues & scooters' },
  'poids-lourd-agricole': { icon: Tractor,      color: 'text-green-600',   bg: 'bg-green-50',   desc: 'Camions & engins agricoles' },
  'filtres':              { icon: Filter,       color: 'text-purple-600',  bg: 'bg-purple-50',  descKey: 'catFiltersDesc' },
  'additifs':             { icon: FlaskConical, color: 'text-pink-600',    bg: 'bg-pink-50',    desc: 'Traitements & entretien moteur' },
}

function CategoryCardImage({ cat }: { cat: { image?: string | null; name: string; slug: string } }) {
  const [imgError, setImgError] = useState(false)
  const meta = CATEGORY_META[cat.slug]

  // Use local image first, then fall back to DB image, then fallback map
  const localImg = LOCAL_CATEGORY_IMAGES[cat.slug]
  let imageUrl = localImg || cat.image;
  if (!imageUrl && !imgError) {
    // Search by name if slug doesn't match exactly
    const entry = Object.entries(LOCAL_CATEGORY_IMAGES).find(([, _]) =>
      cat.name.toLowerCase().includes(_)
    )
    if (entry) imageUrl = entry[1]
  }

  if (!imageUrl || imgError) {
    const Icon = meta?.icon ?? Package
    return (
      <div className={`flex h-full w-full items-center justify-center ${meta?.bg ?? 'bg-gray-100'}`}>
        <Icon size={40} className={`${meta?.color ?? 'text-gray-400'}`} strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <Image
      src={imageUrl}
      alt={cat.name}
      fill
      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
      onError={() => setImgError(true)}
    />
  )
}

export function CategoryGrid() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-all'],
    queryFn: categoriesApi.getAll,
  })
  const t = useTranslations('Home')

  // Show up to 6 root categories
  const roots = categories?.filter((c) => !c.parentId)?.slice(0, 6) ?? []

  if (isLoading) {
    return (
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="section-padding">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="section-padding">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-accent">
            Notre catalogue
          </p>
          <h2 className="text-3xl font-black uppercase tracking-tight text-brand-primary md:text-4xl">
            {t('shopByCategory')}
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Trouvez exactement ce qu&apos;il vous faut
          </p>
        </div>

        {/* 6-column grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {roots.map((cat) => {
            const meta = CATEGORY_META[cat.slug]
            return (
              <Link
                key={cat.id}
                href={`/categorie/${cat.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-accent/30 hover:shadow-lg"
              >
                {/* Image / Icon area */}
                <div className="relative aspect-square overflow-hidden">
                  <CategoryCardImage cat={cat} />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-brand-primary/0 transition-colors duration-200 group-hover:bg-brand-primary/10" />
                </div>

                {/* Text */}
                <div className="p-3 text-center">
                  <h3 className="text-xs font-bold leading-tight text-gray-800 group-hover:text-brand-accent transition-colors">
                    {cat.name}
                  </h3>
                  {(meta?.descKey || meta?.desc) && (
                    <p className="mt-1 text-[10px] text-gray-400 leading-tight line-clamp-2">
                      {meta?.descKey ? t(meta.descKey) : meta.desc}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-brand-primary px-8 py-3 text-sm font-bold uppercase tracking-widest text-brand-primary transition-all duration-200 hover:bg-brand-primary hover:text-white"
          >
            {t('explore')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
