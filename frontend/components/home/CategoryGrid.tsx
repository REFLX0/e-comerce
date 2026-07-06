"use client";

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function CategoryGrid() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-all'],
    queryFn: categoriesApi.getAll,
  })

  // Filter to root categories only (no parentId)
  const roots = categories?.filter((c) => !c.parentId)?.slice(0, 4) ?? []

  if (isLoading) {
    return (
      <section className="bg-white py-20">
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
            Shop by Category
          </h2>
          <Link
            href="/catalogue"
            className="hidden items-center gap-1 text-sm font-bold text-[#E10600] transition-colors hover:text-[#b80500] sm:inline-flex"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {roots.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorie/${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100"
            >
              {/* Image */}
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100">
                  <span className="text-3xl font-bold uppercase text-gray-300">{cat.name.charAt(0)}</span>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-lg font-bold uppercase tracking-wide text-white drop-shadow-lg">
                  {cat.name}
                </h3>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors group-hover:text-[#E10600]">
                  Explore <ArrowRight size={12} />
                </span>
              </div>

              {/* Hover shadow lift */}
              <div className="absolute inset-0 rounded-lg ring-0 ring-[#E10600]/0 transition-all duration-300 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.2)] group-hover:ring-2 group-hover:ring-[#E10600]/30" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
