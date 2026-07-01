"use client";

import { useState } from 'react'
import type { Product } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewsSection } from './ReviewsSection'
import { Check } from 'lucide-react'

interface Props {
  product: Product
}

export function ProductTabs({ product }: Props) {
  return (
    <div className="border-brand-surface-dark mt-16 rounded-2xl border bg-white p-6 shadow-sm md:p-10">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="border-brand-surface-dark hide-scrollbar mb-8 h-auto w-full flex-nowrap justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="description"
            className="data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary font-display shrink-0 rounded-none border-b-2 border-transparent px-6 pb-4 text-base font-medium text-gray-500 data-[state=active]:bg-transparent md:text-lg"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary font-display shrink-0 rounded-none border-b-2 border-transparent px-6 pb-4 text-base font-medium text-gray-500 data-[state=active]:bg-transparent md:text-lg"
          >
            Spécifications
          </TabsTrigger>
          <TabsTrigger
            value="compatibility"
            className="data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary font-display shrink-0 rounded-none border-b-2 border-transparent px-6 pb-4 text-base font-medium text-gray-500 data-[state=active]:bg-transparent md:text-lg"
          >
            Compatibilité
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary font-display shrink-0 rounded-none border-b-2 border-transparent px-6 pb-4 text-base font-medium text-gray-500 data-[state=active]:bg-transparent md:text-lg"
          >
            Avis ({product.reviewCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-0 space-y-6 leading-relaxed text-gray-600">
          <div
            dangerouslySetInnerHTML={{
              __html: product.description || '<p>Aucune description détaillée disponible.</p>',
            }}
          />
        </TabsContent>

        <TabsContent value="specs" className="mt-0">
          {product.specs ? (
            <div className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
              {Object.entries(product.specs).map(([key, value]) => {
                if (!value) return null
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                return (
                  <div key={key} className="flex border-b border-gray-100 py-3">
                    <span className="w-1/3 font-medium text-gray-500">{label}</span>
                    <span className="text-brand-primary w-2/3 font-semibold">
                      {Array.isArray(value) ? value.join(', ') : value}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500">Aucune spécification disponible.</p>
          )}
        </TabsContent>

        <TabsContent value="compatibility" className="mt-0">
          {product.compatibility && product.compatibility.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.compatibility.map((comp: any) => (
                <div
                  key={comp.id}
                  className="bg-brand-surface flex items-start gap-3 rounded-xl p-4"
                >
                  <div className="mt-1">
                    <Check size={18} className="text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-brand-primary font-semibold">
                      {comp.make} {comp.model}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {comp.yearFrom} - {comp.yearTo || "Aujourd'hui"}
                      {comp.engine && ` • ${comp.engine}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune information de compatibilité disponible.</p>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-0" id="avis">
          <ReviewsSection
            productId={product.id}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
