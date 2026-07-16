"use client";

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  Search, Plus, Edit2, Trash2, Copy, Eye,
  Upload, Download, Package
} from 'lucide-react'

function PriceBadge({ price }: { price: number }) {
  return <span className="font-semibold text-brand-primary whitespace-nowrap">{price.toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND</span>
}

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">Rupture</span>
  if (qty <= 5)  return <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-600">{qty} restants</span>
  return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-600">{qty} en stock</span>
}

interface Product {
  id: string; name?: string; nameFr?: string; slug: string; sku?: string
  brand?: string | { name?: string }; category?: string | { nameFr?: string; name?: string }
  price?: number; stock?: number; stockQty?: number
  variants?: Array<{ price?: number; stockQty?: number; skuVariant?: string }>
  images?: Array<string | { url?: string; altFr?: string }>
  isPublished?: boolean
}
function productName(p: Product) { return p.nameFr ?? p.name ?? 'Produit sans nom' }
function brandName(p: Product) { return typeof p.brand === 'string' ? p.brand : p.brand?.name }
function categoryName(p: Product) { return typeof p.category === 'string' ? p.category : p.category?.nameFr ?? p.category?.name }
function productSku(p: Product) { return p.variants?.[0]?.skuVariant ?? p.sku }
function productPrice(p: Product) { return p.variants?.[0]?.price ?? p.price ?? 0 }
function productStock(p: Product) {
  if (typeof p.stock === 'number') return p.stock
  if (typeof p.stockQty === 'number') return p.stockQty
  return p.variants?.reduce((sum, v) => sum + (v.stockQty ?? 0), 0) ?? 0
}
function productImage(p: Product) { const f = p.images?.[0]; return typeof f === 'string' ? f : f?.url }

export default function AdminProductsPage() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const localizedHref = (href: string) => `/${locale}${href}`
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [showPublished, setShowPublished] = useState<'all' | 'published' | 'unpublished'>('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: productsData, isLoading } = useQuery<any>({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.getProducts({ limit: 50 }),
  })
  const products: Product[] = (productsData as any)?.data ?? []

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Produit dépublié'); setConfirmDelete(null) },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: string }) => adminApi.bulkProducts(ids, action),
    onSuccess: (_, vars) => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setSelected([]); toast.success(`${vars.ids.length} produit(s) ${vars.action === 'publish' ? 'publiés' : vars.action === 'unpublish' ? 'dépubliés' : vars.action === 'duplicate' ? 'dupliqués' : 'traités'}`) },
    onError: () => toast.error('Erreur'),
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => adminApi.duplicateProduct(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Produit dupliqué') },
    onError: () => toast.error('Erreur lors de la duplication'),
  })

  const filtered = products.filter((p) => {
    const ms = !search || productName(p).toLowerCase().includes(search.toLowerCase()) || productSku(p)?.toLowerCase().includes(search.toLowerCase()) || brandName(p)?.toLowerCase().includes(search.toLowerCase())
    const mp = showPublished === 'all' ? true : showPublished === 'published' ? p.isPublished : !p.isPublished
    return ms && mp
  })

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const exportCsv = async () => {
    try {
      const res = await adminApi.exportProducts(); const csv = (res as any).csv
      const blob = new Blob([csv as any], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `produits-${new Date().toISOString().split('T')[0]}.csv`
      a.click(); URL.revokeObjectURL(url)
      toast.success('Export CSV téléchargé')
    } catch { toast.error("Erreur lors de l'export") }
  }

  const importCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const lines = text.split('\n').filter(Boolean)
      const results = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]; if (!line) continue
        const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim())
        if (cols[0] && cols[1]) {
          try {
            await adminApi.createProduct({ sku: cols[0]!, nameFr: cols[1]!, slug: (cols[2] || cols[1]!.toLowerCase().replace(/[^a-z0-9]+/g, '-'))!, description: cols[3] || '', brandId: null, categoryId: null, isPublished: false, price: parseFloat(cols[6] ?? '0') || 0, stock: parseInt(cols[7] ?? '0') || 0 })
            results.push(`✓ ${cols[1]}`)
          } catch { results.push(`✗ ${cols[1]}`) }
        }
      }
      toast.success(`${results.filter((r) => r.startsWith('✓')).length} importés, ${results.filter((r) => r.startsWith('✗')).length} erreurs`)
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    } catch { toast.error('Erreur de lecture du fichier CSV') }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Produits</h1>
          <p className="text-sm text-gray-500">{products.length} produits dans le catalogue</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={importCsv} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Upload size={15} /> Importer CSV
          </button>
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Exporter
          </button>
          <Link href={localizedHref('/admin/catalog/products/new')}
            className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors">
            <Plus size={16} /> Nouveau produit
          </Link>
        </div>
      </div>

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
              <button key={a.action} onClick={() => bulkMutation.mutate({ ids: selected, action: a.action })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${a.action === 'delete' ? 'bg-red-500/20 hover:bg-red-500/40 text-red-300' : 'bg-white/10 hover:bg-white/20'}`}>
                {a.label}
              </button>
            ))}
            <button onClick={() => setSelected([])} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20 transition-colors">Annuler</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, SKU, marque..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-brand-accent transition-all" />
        </div>
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {(['all', 'published', 'unpublished'] as const).map((v) => (
            <button key={v} onClick={() => setShowPublished(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${showPublished === v ? 'bg-brand-primary text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {v === 'all' ? 'Tous' : v === 'published' ? 'Publiés' : 'Brouillons'}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:block rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="py-3 pl-4 pr-2">
                  <input type="checkbox" className="rounded border-gray-300"
                    onChange={(e) => setSelected(e.target.checked ? filtered.map(p => p.id) : [])}
                    checked={selected.length === filtered.length && filtered.length > 0} />
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
              {isLoading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-gray-50"><td colSpan={8} className="py-3 px-4"><div className="h-5 animate-pulse rounded bg-gray-100" /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <Package size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-400">Aucun produit trouvé</p>
                </td></tr>
              ) : filtered.map((product) => (
                <tr key={product.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 pl-4 pr-2">
                    <input type="checkbox" className="rounded border-gray-300"
                      checked={selected.includes(product.id)} onChange={() => toggleSelect(product.id)} />
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                        {productImage(product) ? <Image src={productImage(product)!} alt={productName(product)} fill className="object-cover" />
                          : <Package size={20} className="absolute inset-0 m-auto text-gray-300" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-brand-primary max-w-xs">{productName(product)}</p>
                        <p className="text-xs text-gray-400">{brandName(product) ?? 'Marque non définie'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3"><span className="font-mono text-xs text-gray-500">{productSku(product) ?? '—'}</span></td>
                  <td className="px-2 py-3 text-xs text-gray-500">{categoryName(product) ?? '—'}</td>
                  <td className="px-2 py-3"><PriceBadge price={productPrice(product)} /></td>
                  <td className="px-2 py-3"><StockBadge qty={productStock(product)} /></td>
                  <td className="px-2 py-3">
                    {product.isPublished
                      ? <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">Publié</span>
                      : <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">Brouillon</span>}
                  </td>
                  <td className="py-3 pl-2 pr-4">
                    <div className="flex gap-1">
                      <Link href={localizedHref(`/produit/${product.slug}`)} target="_blank" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors" title="Voir sur le site"><Eye size={15} /></Link>
                      <Link href={localizedHref(`/admin/catalog/products/${product.id}/edit`)} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Modifier"><Edit2 size={15} /></Link>
                      <button onClick={() => duplicateMutation.mutate(product.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Dupliquer"><Copy size={15} /></button>
                      <button onClick={() => setConfirmDelete(product.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Dépublier"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-brand-primary mb-2">Confirmer la dépublication</h3>
            <p className="text-sm text-gray-500 mb-6">Le produit sera masqué de la boutique. Vous pourrez le republier à tout moment.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
              <button onClick={() => deleteMutation.mutate(confirmDelete)} disabled={deleteMutation.isPending} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                {deleteMutation.isPending ? 'Dépublication...' : 'Dépublier'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden space-y-3">
        {isLoading ? [...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Aucun produit trouvé</div>
        ) : filtered.map((product) => (
          <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50">
              {productImage(product) ? <Image src={productImage(product)!} alt={productName(product)} fill className="object-cover" />
                : <Package size={24} className="absolute inset-0 m-auto text-gray-300" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-primary">{productName(product)}</p>
              <p className="text-xs text-gray-400">{brandName(product) ?? 'Marque non définie'}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <PriceBadge price={productPrice(product)} />
                <StockBadge qty={productStock(product)} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Link href={localizedHref(`/admin/catalog/products/${product.id}/edit`)} className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Edit2 size={16} /></Link>
              <button onClick={() => setConfirmDelete(product.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Dépublier"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
