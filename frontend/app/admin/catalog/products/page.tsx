"use client";

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import { brandsApi } from '@/lib/api/brands'
import { categoriesApi } from '@/lib/api/categories'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search, Plus, Filter, Edit2, Trash2, Copy, Eye,
  EyeOff, Upload, Download, Star, Package
} from 'lucide-react'

function PriceBadge({ price }: { price: number }) {
  return (
    <span className="font-semibold text-brand-primary whitespace-nowrap">
      {price.toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND
    </span>
  )
}

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">Rupture</span>
  if (qty <= 5)  return <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-600">{qty} restants</span>
  return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-600">{qty} en stock</span>
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [showPublished, setShowPublished] = useState<'all' | 'published' | 'unpublished'>('all')

  const { data: productsData, isLoading } = useQuery<any>({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.getAll({ limit: 50 }),
  })

  const products = productsData?.data ?? []

  const filtered = products.filter((p) => {
    const matchSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    const matchPublished = showPublished === 'all' ? true
      : showPublished === 'published' ? p.isPublished
      : !p.isPublished
    return matchSearch && matchPublished
  })

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Produits</h1>
          <p className="text-sm text-gray-500">{products.length} produits dans le catalogue</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Upload size={15} /> Importer CSV
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Exporter
          </button>
          <Link
            href="/admin/catalog/products/new"
            className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors"
          >
            <Plus size={16} /> Nouveau produit
          </Link>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-brand-primary p-3 text-sm text-white">
          <span className="font-semibold">{selected.length} sélectionné(s)</span>
          <div className="flex flex-wrap gap-2 ml-auto">
            {[
              { label: 'Publier', action: 'publish' },
              { label: 'Dépublier', action: 'unpublish' },
              { label: 'Dupliquer', action: 'duplicate' },
              { label: 'Supprimer', action: 'delete' },
            ].map((a) => (
              <button
                key={a.action}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  a.action === 'delete'
                    ? 'bg-red-500/20 hover:bg-red-500/40 text-red-300'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {a.label}
              </button>
            ))}
            <button onClick={() => setSelected([])} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Search & filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, SKU, marque..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-brand-accent transition-all"
          />
        </div>
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {(['all', 'published', 'unpublished'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setShowPublished(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                showPublished === v ? 'bg-brand-primary text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {v === 'all' ? 'Tous' : v === 'published' ? 'Publiés' : 'Brouillons'}
            </button>
          ))}
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="py-3 pl-4 pr-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    onChange={(e) => setSelected(e.target.checked ? filtered.map(p => p.id) : [])}
                    checked={selected.length === filtered.length && filtered.length > 0}
                  />
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Produit</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">SKU</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Catégorie</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Prix</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Stock</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Statut</th>
                <th className="py-3 pl-2 pr-4 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td colSpan={8} className="py-3 px-4">
                      <div className="h-5 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Package size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-sm text-gray-400">Aucun produit trouvé</p>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pl-4 pr-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selected.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package size={20} className="absolute inset-0 m-auto text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-brand-primary max-w-xs">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <span className="font-mono text-xs text-gray-500">{product.sku ?? '—'}</span>
                    </td>
                    <td className="px-2 py-3 text-xs text-gray-500">{product.category ?? '—'}</td>
                    <td className="px-2 py-3">
                      <PriceBadge price={product.price ?? 0} />
                    </td>
                    <td className="px-2 py-3">
                      <StockBadge qty={product.stock ?? 0} />
                    </td>
                    <td className="px-2 py-3">
                      {product.isPublished
                        ? <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">Publié</span>
                        : <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">Brouillon</span>
                      }
                    </td>
                    <td className="py-3 pl-2 pr-4">
                      <div className="flex gap-1">
                        <Link href={`/produit/${product.slug}`} target="_blank" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors" title="Voir sur le site">
                          <Eye size={15} />
                        </Link>
                        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Modifier">
                          <Edit2 size={15} />
                        </button>
                        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Dupliquer">
                          <Copy size={15} />
                        </button>
                        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Supprimer">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Aucun produit trouvé</div>
        ) : (
          filtered.map((product) => (
            <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                {product.images?.[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                ) : (
                  <Package size={24} className="absolute inset-0 m-auto text-gray-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-primary">{product.name}</p>
                <p className="text-xs text-gray-400">{product.brand}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <PriceBadge price={product.price ?? 0} />
                  <StockBadge qty={product.stock ?? 0} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Edit2 size={16} />
                </button>
                <button className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
