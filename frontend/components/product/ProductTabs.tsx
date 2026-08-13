"use client"

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import type { Product } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewsSection } from './ReviewsSection'

interface Props {
  product: Product
}

type DetailRow = { label: string; value: string }

const TECHNICAL_SECTION = /(?:^|\n)\s*(?:<h[23][^>]*>)?\s*spécifications?(?:\s+techniques?)?\s*:?(?:<\/h[23]>)?\s*(?:\n|<br\s*\/?>|<ul[^>]*>)?/i
const COMPATIBILITY_SECTION = /(?:^|\n)\s*(?:<h[23][^>]*>)?\s*compatibilit[ée](?:\s+v[ée]hicules?)?\s*:?(?:<\/h[23]>)?\s*(?:\n|<br\s*\/?>|<ul[^>]*>)?/i

function htmlToText(value: string) {
  return value
    .replace(/<\/?(p|div|li|h[1-6])[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function splitProductDetails(description?: string) {
  const text = htmlToText(description || '')
  if (!text) return { description: '', technicalDetails: [] as DetailRow[] }

  const technicalMatch = TECHNICAL_SECTION.exec(text)
  const compatibilityMatch = COMPATIBILITY_SECTION.exec(text)
  const technicalStart = technicalMatch?.index
  const compatibilityStart = compatibilityMatch?.index

  const descriptionEnd = [technicalStart, compatibilityStart]
    .filter((value): value is number => typeof value === 'number')
    .sort((a, b) => a - b)[0]
  const descriptionText = (descriptionEnd === undefined ? text : text.slice(0, descriptionEnd)).trim()

  const technicalText = technicalMatch
    ? text.slice(technicalMatch.index + technicalMatch[0].length, compatibilityStart && compatibilityStart > technicalMatch.index ? compatibilityStart : undefined)
    : ''

  const technicalDetails = technicalText
    .split('\n')
    .map((line) => line.replace(/^[\s•·\-]+/, '').trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.search(/\s*[:–—]\s*/)
      if (separatorIndex > 0) {
        return {
          label: line.slice(0, separatorIndex).trim(),
          value: line.slice(separatorIndex).replace(/^\s*[:–—]\s*/, '').trim(),
        }
      }
      return { label: '', value: line }
    })

  return { description: descriptionText, technicalDetails }
}

function humanizeSpec(key: string) {
  const labels: Record<string, string> = {
    viscosity: 'Viscosité',
    apiSpec: 'Norme API',
    aceaSpec: 'Norme ACEA',
    jasoSpec: 'Norme JASO',
    type: "Type d'huile",
    oemApprovals: 'Approbations constructeur',
    dpfCompatible: 'Compatible FAP',
    turboCompatible: 'Compatible turbo',
    hybridCompatible: 'Compatible hybride',
  }
  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase())
}

function toSpecRows(specs?: Product['specs']): DetailRow[] {
  if (!specs) return []
  return Object.entries(specs)
    .filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== false)
    .map(([key, value]) => ({
      label: humanizeSpec(key),
      value: Array.isArray(value) ? value.join(', ') : value === true ? 'Oui' : String(value),
    }))
}

export function ProductTabs({ product }: Props) {
  const t = useTranslations('Product')
  const details = useMemo(() => splitProductDetails(product.description), [product.description])
  const specRows = useMemo(() => [...toSpecRows(product.specs), ...details.technicalDetails], [product.specs, details.technicalDetails])

  return (
    <div className="border-brand-surface-dark mt-16 rounded-2xl border bg-white p-6 shadow-sm md:p-10">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="border-brand-surface-dark hide-scrollbar mb-8 h-auto w-full flex-nowrap justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
          <ProductTab value="description">{t('description')}</ProductTab>
          <ProductTab value="specs">{t('specifications')}</ProductTab>
          <ProductTab value="compatibility">{t('compatibility')}</ProductTab>
          <ProductTab value="reviews">{t('reviews', { count: product.reviewCount })}</ProductTab>
        </TabsList>

        <TabsContent value="description" className="mt-0">
          {details.description ? (
            <div className="max-w-4xl whitespace-pre-line text-[15px] leading-8 text-gray-600">{details.description}</div>
          ) : (
            <p className="text-gray-500">{t('noDescription')}</p>
          )}
        </TabsContent>

        <TabsContent value="specs" className="mt-0">
          {specRows.length ? (
            <div className="grid grid-cols-1 overflow-hidden border border-gray-100 md:grid-cols-2">
              {specRows.map((spec, index) => (
                <div key={`${spec.label}-${spec.value}-${index}`} className="flex gap-4 border-b border-gray-100 px-4 py-4 last:border-b-0 md:nth-[2n+1]:border-r">
                  {spec.label ? <span className="w-[42%] shrink-0 text-sm font-medium text-gray-500">{spec.label}</span> : null}
                  <span className="text-sm font-semibold text-brand-primary">{spec.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{t('noSpecs')}</p>
          )}
        </TabsContent>

        <TabsContent value="compatibility" className="mt-0">
          {product.compatibility?.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {product.compatibility.map((compatibility) => (
                <div key={compatibility.id} className="flex items-start gap-3 border border-gray-100 bg-brand-surface p-4">
                  <Check size={18} className="mt-0.5 shrink-0 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-brand-primary">{compatibility.make} {compatibility.model}</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {compatibility.yearFrom || '—'} – {compatibility.yearTo || t('today')}
                      {compatibility.engine ? ` · ${compatibility.engine}` : ''}
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
          <ReviewsSection productId={product.id} rating={product.rating} reviewCount={product.reviewCount} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProductTab({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary font-display shrink-0 rounded-none border-b-2 border-transparent px-6 pb-4 text-base font-medium text-gray-500 data-[state=active]:bg-transparent md:text-lg"
    >
      {children}
    </TabsTrigger>
  )
}
