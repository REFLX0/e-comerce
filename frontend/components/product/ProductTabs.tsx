"use client";

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Product } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewsSection } from './ReviewsSection'
import { Check } from 'lucide-react'

interface Props {
  product: Product
}

export function ProductTabs({ product }: Props) {
  const t = useTranslations('Product')
  
  const descString = product.description || '<p>Aucune description détaillée disponible.</p>';
  let baseDesc = descString;
  let specsHtml = '';
  let oeHtml = '';
  let compatHtml = '';

  const specsMatch = descString.match(/(<h3>Spécifications<\/h3><ul>.*?<\/ul>)/);
  if (specsMatch && specsMatch[1]) {
    specsHtml = specsMatch[1].replace('<h3>Spécifications</h3>', '');
    baseDesc = baseDesc.replace(specsMatch[1], '');
  }

  const oeMatch = descString.match(/(<h3>Références d'origine<\/h3><ul>.*?<\/ul>)/);
  if (oeMatch && oeMatch[1]) {
    oeHtml = oeMatch[1].replace('<h3>Références d\'origine</h3>', '');
    baseDesc = baseDesc.replace(oeMatch[1], '');
  }

  const compatMatch = descString.match(/(<h3>Compatibilité Véhicules<\/h3><ul>.*?<\/ul>)/);
  if (compatMatch && compatMatch[1]) {
    compatHtml = compatMatch[1].replace('<h3>Compatibilité Véhicules</h3>', '');
    baseDesc = baseDesc.replace(compatMatch[1], '');
  }

  return (
    <div className="border-brand-surface-dark mt-16 rounded-2xl border bg-white p-6 shadow-sm md:p-10">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="border-brand-surface-dark hide-scrollbar mb-8 h-auto w-full flex-nowrap justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="description"
            className="data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary font-display shrink-0 rounded-none border-b-2 border-transparent px-6 pb-4 text-base font-medium text-gray-500 data-[state=active]:bg-transparent md:text-lg"
          >
            {t('description')}
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary font-display shrink-0 rounded-none border-b-2 border-transparent px-6 pb-4 text-base font-medium text-gray-500 data-[state=active]:bg-transparent md:text-lg"
          >
            {t('specifications')}
          </TabsTrigger>
          <TabsTrigger
            value="compatibility"
            className="data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary font-display shrink-0 rounded-none border-b-2 border-transparent px-6 pb-4 text-base font-medium text-gray-500 data-[state=active]:bg-transparent md:text-lg"
          >
            {t('compatibility')}
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary font-display shrink-0 rounded-none border-b-2 border-transparent px-6 pb-4 text-base font-medium text-gray-500 data-[state=active]:bg-transparent md:text-lg"
          >
            {t('reviews', { count: product.reviewCount })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-0 space-y-6 leading-relaxed text-gray-600 prose prose-brand max-w-none">
          <div dangerouslySetInnerHTML={{ __html: baseDesc }} />
          {oeHtml && (
            <div className="mt-8">
              <h3 className="text-xl font-display font-bold text-brand-primary mb-4">Références d'origine</h3>
              <div className="bg-gray-50 rounded-xl p-5" dangerouslySetInnerHTML={{ __html: oeHtml }} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="specs" className="mt-0">
          {specsHtml ? (
            <div className="prose prose-brand max-w-none prose-li:text-gray-600 prose-strong:text-gray-900 bg-gray-50 rounded-xl p-6" dangerouslySetInnerHTML={{ __html: specsHtml }} />
          ) : product.specs ? (
            <div className="flex flex-col gap-10">
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

              {/* Documents & PDFs */}
              <div className="border-t border-gray-100 pt-8">
                <h4 className="font-display text-brand-primary mb-6 text-lg font-bold">{t('techDocs')}</h4>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <a href="#" onClick={(e) => e.preventDefault()} className="group flex flex-1 items-center gap-4 rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-all hover:shadow-md">
                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                     </div>
                     <div>
                       <p className="text-sm font-bold text-brand-primary group-hover:text-gray-900 transition-colors">{t('tds')}</p>
                       <p className="text-xs text-gray-500">PDF • 1.2 MB</p>
                     </div>
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()} className="group flex flex-1 items-center gap-4 rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-all hover:shadow-md">
                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                     </div>
                     <div>
                       <p className="text-sm font-bold text-brand-primary group-hover:text-gray-900 transition-colors">{t('sds')}</p>
                       <p className="text-xs text-gray-500">PDF • 0.8 MB</p>
                     </div>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">{t('noSpecs')}</p>
          )}
        </TabsContent>

        <TabsContent value="compatibility" className="mt-0">
          {compatHtml ? (
            <div className="prose prose-brand max-w-none prose-li:text-gray-600 prose-li:marker:text-brand-primary bg-gray-50 rounded-xl p-6" dangerouslySetInnerHTML={{ __html: compatHtml }} />
          ) : product.compatibility && product.compatibility.length > 0 ? (
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
            <p className="text-gray-500">{t('noCompat')}</p>
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
