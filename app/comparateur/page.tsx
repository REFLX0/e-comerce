'use client'

import { useComparatorStore } from '@/lib/store/comparator.store'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { formatPrice } from '@/lib/utils/format'
import { Trash2, Scale, ShoppingCart, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart.store'
import { toast } from 'sonner'
import { RatingStars } from '@/components/common/RatingStars'

export default function ComparatorPage() {
  const { items, remove, clear } = useComparatorStore()
  const { addItem } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="section-padding py-16">
        <Breadcrumb items={[{ label: 'Comparateur' }]} />
        <div className="bg-white rounded-2xl border border-brand-surface-dark p-12 text-center shadow-sm mt-8">
          <div className="w-24 h-24 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <Scale size={48} />
          </div>
          <h2 className="text-2xl font-display font-bold text-brand-primary mb-4">
            Le comparateur est vide
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Ajoutez des produits au comparateur pour analyser leurs caractéristiques côte à côte.
          </p>
          <Link href="/catalogue" className="btn-primary inline-flex">
            Parcourir le catalogue
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = (product: import('@/lib/types').Product, variant: import('@/lib/types').ProductVariant) => {
    addItem(product, variant, 1)
    toast.success('Produit ajouté au panier')
  }

  return (
    <div className="section-padding py-8">
      <Breadcrumb items={[{ label: 'Comparateur' }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-primary">
            Comparateur de produits
          </h1>
          <p className="text-gray-500 mt-1">
            {items.length} produit{items.length > 1 ? 's' : ''} en comparaison
          </p>
        </div>
        <button
          onClick={clear}
          className="text-gray-500 hover:text-red-500 font-medium flex items-center gap-2 transition-colors"
        >
          <Trash2 size={18} />
          Vider le comparateur
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-brand-surface-dark overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="p-6 bg-brand-surface/50 border-b border-r border-brand-surface-dark w-64 shrink-0 font-display font-bold text-brand-primary sticky left-0 z-10">
                Informations du produit
              </th>
              {items.map((item) => (
                <th key={item.id} className="p-6 border-b border-r border-brand-surface-dark last:border-r-0 w-72 bg-white relative">
                  <button
                    onClick={() => remove(item.id)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Retirer"
                  >
                    <Trash2 size={18} />
                  </button>
                  <Link href={`/produit/${item.slug}`} className="block group">
                    <div className="relative w-full h-48 bg-brand-surface rounded-xl overflow-hidden mb-4">
                      {item.images?.[0] ? (
                        <Image src={item.images[0]} alt={item.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    <h3 className="font-bold text-brand-primary line-clamp-2 group-hover:text-brand-accent transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="mt-2 text-xl font-display font-bold text-brand-accent">
                    {formatPrice(item.variants?.[0]?.priceTTC || 0)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <RatingStars rating={item.rating || 0} size={14} />
                    <span className="text-xs text-gray-500">({item.reviewCount || 0})</span>
                  </div>
                  <button 
                    onClick={() => handleAddToCart(item, item.variants?.[0])}
                    className="w-full mt-4 btn-primary flex items-center justify-center gap-2 py-2.5"
                    disabled={!item.variants?.[0] || item.variants[0].stock <= 0}
                  >
                    <ShoppingCart size={16} />
                    {item.variants?.[0]?.stock > 0 ? 'Ajouter' : 'Rupture'}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 bg-brand-surface/50 border-b border-r border-brand-surface-dark font-medium text-gray-700 sticky left-0 z-10">Marque</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-b border-r border-brand-surface-dark last:border-r-0 text-gray-600">
                  {item.brand?.name || '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 bg-brand-surface/50 border-b border-r border-brand-surface-dark font-medium text-gray-700 sticky left-0 z-10">Viscosité</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-b border-r border-brand-surface-dark last:border-r-0 text-gray-600 font-bold">
                  {item.specs?.viscosity || '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 bg-brand-surface/50 border-b border-r border-brand-surface-dark font-medium text-gray-700 sticky left-0 z-10">Type d'huile</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-b border-r border-brand-surface-dark last:border-r-0 text-gray-600">
                  {item.specs?.type || '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 bg-brand-surface/50 border-b border-r border-brand-surface-dark font-medium text-gray-700 sticky left-0 z-10">Application</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-b border-r border-brand-surface-dark last:border-r-0 text-gray-600">
                  {item.specs?.application || '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 bg-brand-surface/50 border-b border-r border-brand-surface-dark font-medium text-gray-700 sticky left-0 z-10">Normes API</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-b border-r border-brand-surface-dark last:border-r-0 text-gray-600">
                  {item.specs?.apiSpec || '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 bg-brand-surface/50 border-b border-r border-brand-surface-dark font-medium text-gray-700 sticky left-0 z-10">Normes ACEA</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-b border-r border-brand-surface-dark last:border-r-0 text-gray-600">
                  {item.specs?.aceaSpec || '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 bg-brand-surface/50 border-b border-r border-brand-surface-dark font-medium text-gray-700 sticky left-0 z-10">Homologations Constructeurs</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-b border-r border-brand-surface-dark last:border-r-0 text-gray-600">
                  {item.specs?.approvals && item.specs.approvals.length > 0 ? (
                    <ul className="space-y-1">
                      {item.specs.approvals.map((app: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5 text-sm">
                          <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                          <span>{app}</span>
                        </li>
                      ))}
                    </ul>
                  ) : '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 bg-brand-surface/50 border-r border-brand-surface-dark font-medium text-gray-700 sticky left-0 z-10">Conditionnements</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-r border-brand-surface-dark last:border-r-0 text-gray-600">
                  <div className="flex flex-wrap gap-2">
                    {item.variants?.map((v: import('@/lib/types').ProductVariant) => (
                      <span key={v.id} className="px-2 py-1 bg-brand-surface border border-brand-surface-dark rounded text-xs font-medium">
                        {v.volume}
                      </span>
                    )) || '-'}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
