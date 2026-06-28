'use client'

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
    <div className="mt-16 bg-white rounded-2xl border border-brand-surface-dark p-6 md:p-10 shadow-sm">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full justify-start border-b border-brand-surface-dark rounded-none bg-transparent h-auto p-0 mb-8 overflow-x-auto hide-scrollbar flex-nowrap">
          <TabsTrigger 
            value="description"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:text-brand-primary text-gray-500 font-display font-medium text-base md:text-lg pb-4 px-6 shrink-0"
          >
            Description
          </TabsTrigger>
          <TabsTrigger 
            value="specs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:text-brand-primary text-gray-500 font-display font-medium text-base md:text-lg pb-4 px-6 shrink-0"
          >
            Spécifications
          </TabsTrigger>
          <TabsTrigger 
            value="compatibility"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:text-brand-primary text-gray-500 font-display font-medium text-base md:text-lg pb-4 px-6 shrink-0"
          >
            Compatibilité
          </TabsTrigger>
          <TabsTrigger 
            value="reviews"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:text-brand-primary text-gray-500 font-display font-medium text-base md:text-lg pb-4 px-6 shrink-0"
          >
            Avis ({product.reviewCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="text-gray-600 leading-relaxed space-y-6 mt-0">
          <div dangerouslySetInnerHTML={{ __html: product.description || '<p>Aucune description détaillée disponible.</p>' }} />
        </TabsContent>

        <TabsContent value="specs" className="mt-0">
          {product.specs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {Object.entries(product.specs).map(([key, value]) => {
                if (!value) return null
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                return (
                  <div key={key} className="flex border-b border-gray-100 py-3">
                    <span className="w-1/3 text-gray-500 font-medium">{label}</span>
                    <span className="w-2/3 text-brand-primary font-semibold">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.compatibility.map((comp) => (
                <div key={comp.id} className="flex items-start gap-3 p-4 bg-brand-surface rounded-xl">
                  <div className="mt-1">
                    <Check size={18} className="text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-primary">{comp.make} {comp.model}</h4>
                    <p className="text-sm text-gray-500">
                      {comp.yearFrom} - {comp.yearTo || 'Aujourd\'hui'}
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
          <ReviewsSection productId={product.id} rating={product.rating} reviewCount={product.reviewCount} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
