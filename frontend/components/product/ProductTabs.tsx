"use client"

import { useMemo, forwardRef } from 'react'
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

function humanizeSpec(key: string, t?: (k: string) => string) {
  const labels: Record<string, string> = {
    viscosity: t?.(`viscosityLabel`) ?? 'Viscosité',
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

function toSpecRows(specs?: Product['specs'], t?: (k: string) => string): DetailRow[] {
  if (!specs) return []
  return Object.entries(specs)
    .filter(([key, value]) => {
      if (['isFullySynth', 'isSemiSynth', 'isMinerale', 'approvals', 'vehicleTypes', 'fuelTypes', 'minCylinders', 'maxCylinders', 'minPower', 'maxPower', 'baseOil', 'application'].includes(key)) {
        return false
      }
      return value !== undefined && value !== null && value !== '' && value !== false
    })
    .map(([key, value]) => {
      let formattedValue = Array.isArray(value) ? value.join(', ') : value === true ? 'Oui' : String(value)
      if (key === 'type') {
        if (value === 'full_synth' || value === '100% Synthèse') formattedValue = '100% Synthèse'
        else if (value === 'semi_synth' || value === 'Semi-Synthèse') formattedValue = 'Semi-Synthèse'
        else if (value === 'mineral' || value === 'Minérale') formattedValue = 'Minérale'
        else formattedValue = String(value)
      }
      return {
        label: humanizeSpec(key, t),
        value: formattedValue,
      }
    })
}

export function ProductTabs({ product }: Props) {
  const t = useTranslations('Product')
  const details = useMemo(() => splitProductDetails(product.description), [product.description])
  const tecdocAttributeRows = useMemo(() => {
    if (!product.attributes?.length) return []
    return product.attributes.map((a) => ({ label: a.title, value: a.value }))
  }, [product.attributes])
  const specRows = useMemo(() => [...toSpecRows(product.specs, t), ...tecdocAttributeRows, ...details.technicalDetails], [product.specs, tecdocAttributeRows, details.technicalDetails, t])

  return (
    <div className="border-brand-surface-dark mt-16 rounded-2xl border bg-white p-6 shadow-sm md:p-10">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="border-brand-surface-dark hide-scrollbar mb-8 h-auto w-full flex-nowrap justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
          <ProductTab value="description">{t('description')}</ProductTab>
          <ProductTab value="specs">{t('specifications')}</ProductTab>
          {product.oeNumbers?.length ? (
            <ProductTab value="oe">Références Constructeur ({product.oeNumbers.length})</ProductTab>
          ) : null}
          <ProductTab value="compatibility">{t('compatibility')}</ProductTab>
          {product.crossList?.length ? (
            <ProductTab value="cross">Équivalences ({product.crossList.length})</ProductTab>
          ) : null}
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

        {product.oeNumbers?.length ? (
          <TabsContent value="oe" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {product.oeNumbers.map((oe, idx) => (
                <div key={`${oe.manufacturer}-${oe.oenNumber}-${idx}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <span className="text-xs font-semibold uppercase text-gray-500">{oe.manufacturer}</span>
                  <span className="font-mono text-sm font-bold text-brand-primary">{oe.oenNumber}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        ) : null}

        <TabsContent value="compatibility" className="mt-0">
          <div className="space-y-8">
            {/* 1. OEM Approvals / Homologations constructeurs (For Oils & Lubricants) */}
            {product.specs?.oemApprovals && product.specs.oemApprovals.length > 0 ? (
              <div>
                <h3 className="text-base font-bold text-brand-primary mb-3 flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  Homologations & Approbations Officielles Constructeurs
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Cette huile répond et surpasse les exigences techniques et cahiers des charges des constructeurs suivants :
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.specs.oemApprovals.map((approval, idx) => (
                    <div
                      key={`approval-${idx}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-primary/20 bg-brand-primary/5 px-3 py-2 text-xs font-bold text-brand-primary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                      {approval}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 2. Normes Internationales (API, ACEA, JASO) */}
            {(product.specs?.apiSpec || product.specs?.aceaSpec || product.specs?.jasoSpec) ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Normes & Spécifications Internationales
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {product.specs.aceaSpec && (
                    <div className="p-3 bg-white rounded-lg border border-gray-100">
                      <span className="text-[11px] font-medium text-gray-400 block">Norme Européenne</span>
                      <span className="text-sm font-bold text-brand-primary">ACEA {product.specs.aceaSpec}</span>
                    </div>
                  )}
                  {product.specs.apiSpec && (
                    <div className="p-3 bg-white rounded-lg border border-gray-100">
                      <span className="text-[11px] font-medium text-gray-400 block">Norme Américaine</span>
                      <span className="text-sm font-bold text-brand-primary">API {product.specs.apiSpec}</span>
                    </div>
                  )}
                  {product.specs.jasoSpec && (
                    <div className="p-3 bg-white rounded-lg border border-gray-100">
                      <span className="text-[11px] font-medium text-gray-400 block">Norme Moto / 2 Roues</span>
                      <span className="text-sm font-bold text-brand-primary">JASO {product.specs.jasoSpec}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* 3. Direct Vehicle Compatibility List */}
            {product.compatibility?.length ? (
              <div>
                <h3 className="text-base font-bold text-brand-primary mb-3 flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  Véhicules et Motorisations Compatibles
                </h3>
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {product.compatibility.map((compatibility) => (
                    <li
                      key={compatibility.id}
                      className="flex items-start gap-2.5 rounded-lg border border-gray-100 bg-white p-3 shadow-xs hover:border-brand-primary/30 transition-colors"
                    >
                      <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
                      <div className="text-xs">
                        <span className="font-bold text-brand-primary block text-sm">
                          {compatibility.make} {compatibility.model}
                        </span>
                        <span className="text-gray-500 mt-0.5 block">
                          Années : {compatibility.yearFrom || '—'} – {compatibility.yearTo || t('today')}
                          {compatibility.engine ? ` · Moteur : ${compatibility.engine}` : ''}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              /* Fallback intelligent compatibility summary for oils based on approvals */
              <div>
                <h3 className="text-base font-bold text-brand-primary mb-2 flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  Compatibilité & Recommandations
                </h3>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 text-sm text-blue-950 space-y-3">
                  <p className="leading-relaxed font-medium">
                    Ce produit est universellement compatible avec l'ensemble des véhicules dont le manuel constructeur préconise :
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-blue-900 ml-2">
                    {product.specs?.viscosity && (
                      <li>La viscosité SAE <strong>{product.specs.viscosity}</strong></li>
                    )}
                    {product.specs?.aceaSpec && (
                      <li>Le standard européen <strong>ACEA {product.specs.aceaSpec}</strong> {product.specs.dpfCompatible ? '(compatible Filtre à Particules DPF/FAP)' : ''}</li>
                    )}
                    {product.specs?.apiSpec && (
                      <li>La classification <strong>API {product.specs.apiSpec}</strong></li>
                    )}
                    {product.specs?.jasoSpec && (
                      <li>La spécification moto <strong>JASO {product.specs.jasoSpec}</strong> (adaptée aux embrayages à bain d'huile)</li>
                    )}
                  </ul>
                  <p className="text-xs text-gray-500 pt-2 border-t border-blue-100/60">
                    💡 Conseil d'expert : Utilisez le sélecteur de véhicule SpecPart en haut de page pour vérifier la compatibilité exacte avec votre carte grise.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {product.crossList?.length ? (
          <TabsContent value="cross" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {product.crossList.map((cross, idx) => (
                <div key={`${cross.supplier}-${cross.article}-${idx}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <span className="text-xs font-semibold uppercase text-gray-500">{cross.supplier}</span>
                  <span className="font-mono text-sm font-bold text-brand-primary">{cross.article}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        ) : null}

        <TabsContent value="reviews" className="mt-0">
          <ReviewsSection productId={product.id} rating={product.rating} reviewCount={product.reviewCount} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

const ProductTab = forwardRef<HTMLButtonElement, { value: string; children: React.ReactNode }>(
  ({ value, children }, ref) => (
    <TabsTrigger
      ref={ref}
      value={value}
      className="data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary shrink-0 rounded-none border-b-2 border-transparent px-4 pb-4 pt-2 text-sm font-semibold text-gray-500 transition-colors hover:text-brand-primary data-[state=active]:bg-transparent md:px-6 md:text-base"
    >
      {children}
    </TabsTrigger>
  )
)
ProductTab.displayName = 'ProductTab'
