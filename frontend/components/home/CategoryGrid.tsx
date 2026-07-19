"use client";

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import {
  ArrowRight,
  Droplets,
  Car,
  Gauge,
  CircleDot,
  Thermometer,
  Disc3,
  Bike,
  Tractor,
  Filter,
  Package,
  FlaskConical,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'huiles-moteur': <Droplets size={36} />,
  automobile: <Car size={36} />,
  transmission: <Gauge size={36} />,
  hydraulique: <CircleDot size={36} />,
  graisses: <Disc3 size={36} />,
  refroidissement: <Thermometer size={36} />,
  frein: <CircleDot size={36} />,
  moto: <Bike size={36} />,
  'poids-lourd-agricole': <Tractor size={36} />,
  filtres: <Filter size={36} />,
  additifs: <FlaskConical size={36} />,
}

const CATEGORY_COLORS: Record<string, string> = {
  'huiles-moteur': 'from-amber-500/20 to-amber-700/20',
  automobile: 'from-blue-500/20 to-blue-700/20',
  transmission: 'from-cyan-500/20 to-cyan-700/20',
  hydraulique: 'from-sky-500/20 to-sky-700/20',
  graisses: 'from-yellow-500/20 to-yellow-700/20',
  refroidissement: 'from-teal-500/20 to-teal-700/20',
  frein: 'from-red-500/20 to-red-700/20',
  moto: 'from-orange-500/20 to-orange-700/20',
  'poids-lourd-agricole': 'from-green-500/20 to-green-700/20',
  filtres: 'from-purple-500/20 to-purple-700/20',
  additifs: 'from-pink-500/20 to-pink-700/20',
}

export function CategoryGrid() {
  const t = useTranslations('Home')
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-all'],
    queryFn: categoriesApi.getAll,
  })

  // Filter to root categories only (no parentId)
  const roots = categories?.filter((c) => !c.parentId)?.slice(0, 4) ?? []

  if (isLoading) {
    return (
    <section className="bg-white py-6 md:py-10 lg:py-16">
        <div className="section-padding">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white py-20">
      <div className="section-padding">
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-[#111] md:text-4xl">
            {t('shopByCategory')}
          </h2>
          <Link
            href="/catalogue"
            className="hidden items-center gap-1 text-sm font-bold text-[#E10600] transition-colors hover:text-[#b80500] sm:inline-flex"
          >
            {t('viewAll')} <ArrowRight size={14} />
          </Link>
        </div>

        {/* Tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {roots.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorie/${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
            >
              {/* Image */}
              <CategoryCardImage cat={cat} />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-lg font-bold uppercase tracking-wide text-white drop-shadow-lg">
                  {cat.name}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-accent transition-all duration-200 group-hover:gap-2">
                  {t('explore')} <ArrowRight size={12} />
                </span>
              </div>

              {/* Hover ring */}
              <div className="absolute inset-0 rounded-xl ring-0 ring-brand-accent/0 transition-all duration-200 group-hover:ring-2 group-hover:ring-brand-accent/40" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoryCardImage({ cat }: { cat: { image?: string | null; name: string; slug: string } }) {
  const [imgError, setImgError] = useState(false)

  if (!cat.image || imgError) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${CATEGORY_COLORS[cat.slug] || 'from-gray-200 to-gray-100'}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="text-gray-400">
            {CATEGORY_ICONS[cat.slug] || <Package size={36} />}
          </div>
          <span className="text-lg font-bold uppercase text-gray-400">{cat.name.charAt(0)}</span>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={cat.image}
      alt={cat.name}
      fill
      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      onError={() => setImgError(true)}
    />
  )
}
