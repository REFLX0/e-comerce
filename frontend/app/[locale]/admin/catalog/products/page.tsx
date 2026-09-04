"use client";

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { gooeyToast as toast } from 'goey-toast'
import {
  Search, Plus, Edit2, Trash2, Copy, Eye,
  Upload, Download, Package, Star, ExternalLink
} from 'lucide-react'

function PriceBadge({ price }: { price: number }) {
  const locale = useLocale()
  return <span className="font-semibold text-brand-primary whitespace-nowrap">{price.toLocaleString(locale, { minimumFractionDigits: 2 })} TND</span>
}

function StockBadge({ qty }: { qty: number }) {
  const t = useTranslations('Admin')
  if (qty === 0) return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">{t('stockOut')}</span>
  if (qty <= 5)  return <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-600">{t('remainingQty', { qty })}</span>
  return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-600">{t('inStockQty', { qty })}</span>
}

interface Product {
  id: string; name?: string; nameFr?: string; slug: string; sku?: string
  brand?: string | { name?: string }; category?: string | { nameFr?: string; name?: string }
  price?: number; stock?: number; stockQty?: number
  variants?: Array<{ price?: number; stockQty?: number; skuVariant?: string }>
  images?: Array<string | { url?: string; altFr?: string }>
  isPublished?: boolean; isFeatured?: boolean
}
function productName(p: Product, t: any) { return p.nameFr ?? p.name ?? t('productNoName') }
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
function parseCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"' && next === '"') {
      current += '"'
      i++
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      cells.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  cells.push(current.trim())
  return cells
}
function normalizeLookup(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
function findByName<T extends { name?: string; nameFr?: string }>(items: T[], value?: string) {
  const normalized = normalizeLookup(value)
  if (!normalized) return null
  return items.find((item) =>
    [item.name, item.nameFr].some((candidate) => normalizeLookup(candidate) === normalized)
  ) ?? null
}

export default function AdminProductsPage() {
  const t = useTranslations('Admin')
  const locale = useLocale()
  const localizedHref = (href: string) => `/${locale}${href}`
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [showPublished, setShowPublished] = useState<'all' | 'published' | 'unpublished'>('all')
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const limit = 50

  const { data: productsData, isLoading } = useQuery<any>({
    queryKey: ['admin-products', page, search, showPublished],
    queryFn: () => adminApi.getProducts({
      page,
      limit,
      search: search.trim() || undefined,
      status: showPublished === 'all' ? undefined : showPublished,
    }),
  })
  const { data: brandsData = [] } = useQuery<any[]>({ queryKey: ['admin-catalog-brands'], queryFn: adminApi.getCatalogBrands })
  const { data: categoriesData = [] } = useQuery<any[]>({ queryKey: ['admin-catalog-categories'], queryFn: adminApi.getCatalogCategories })
  const products: Product[] = (productsData as any)?.data ?? []
  const total = (productsData as any)?.total ?? products.length
  const totalPages = Math.max((productsData as any)?.totalPages ?? 1, 1)

  useEffect(() => {
    setPage(1)
    setSelected([])
  }, [search, showPublished])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: (res: any) => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success(res?.message ?? t('productDeleted')); setConfirmDelete(null) },
    onError: (err) => { console.error('Delete error:', err); toast.error(t('productDeleteError')) },
  })

  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: string }) => adminApi.bulkProducts(ids, action),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setSelected([])
      const actionLabel = vars.action === 'publish' ? t('bulkPublished') : vars.action === 'unpublish' ? t('bulkUnpublished') : vars.action === 'duplicate' ? t('bulkDuplicated') : t('bulkProcessed')
      toast.success(t('bulkResult', { count: vars.ids.length, action: actionLabel }))
    },
    onError: () => toast.error(t('genericError')),
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => adminApi.duplicateProduct(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success(t('productDuplicated')) },
    onError: () => toast.error(t('productDuplicateError')),
  })

  const filtered = products

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const exportCsv = async () => {
    const toastId = toast.loading('Export en cours...')
    try {
      const response = await fetch('/api/admin/products/export')
      if (!response.ok) throw new Error('Export failed')
      const data = await response.json()
      
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      const d = new Date();
      const day = String(d.getDate()).padStart(2, '0');
      const month = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(d);
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      data.files.forEach((file: { category: string, csv: string }) => {
        const safeCat = file.category.replace(/[^a-zA-Z0-9_\-]/g, '_')
        const blob = new Blob(['\ufeff', file.csv], { type: 'application/vnd.ms-excel;charset=utf-8;' })
        zip.folder(safeCat)?.file(`Products_${day}${month}${year}_${hours}${minutes}.xls`, blob)
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a'); a.href = url;
      a.download = `Products_${day}${month}${year}_${hours}${minutes}.zip`;
      a.click(); URL.revokeObjectURL(url)
      
      toast.success(t('csvDownloaded'), { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error(t('exportError'), { id: toastId })
    }
  }

  const importCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    const toastId = toast.loading(t('importing'))
    try {
      const res = await adminApi.importProducts(file)
      const data = res as unknown as { ok: boolean; created: number; updated: number; errors: number; message: string }
      if (data.errors > 0) {
        toast.warning(data.message, { id: toastId })
      } else {
        toast.success(data.message, { id: toastId })
      }
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    } catch {
      toast.error(t('importError'), { id: toastId })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">{t('products')}</h1>

        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx" onChange={importCsv} className="hidden" disabled={isImporting} />
          
          <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
            {isImporting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" /> : <Upload size={15} />}
            {isImporting ? t('importing') : t('importCsvLabel')}
          </button>
          
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={15} /> {t('exportLabel')}
          </button>

          <Link href={localizedHref('/admin/catalog/products/new')}
            className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors">
            <Plus size={16} /> {t('newProduct')}
          </Link>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-brand-primary p-3 text-sm text-white">
          <span className="font-semibold">{t('selectedCount', { count: selected.length })}</span>
          <div className="flex flex-wrap gap-2 ml-auto">
            {[
              { labelKey: 'publishAction', action: 'publish' },
              { labelKey: 'unpublishAction', action: 'unpublish' },
              { labelKey: 'duplicateAction', action: 'duplicate' },
              { labelKey: 'deleteAction', action: 'delete' },
            ].map((a) => (
              <button key={a.action} onClick={() => bulkMutation.mutate({ ids: selected, action: a.action })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${a.action === 'delete' ? 'bg-red-500/20 hover:bg-red-500/40 text-red-300' : 'bg-white/10 hover:bg-white/20'}`}>
                {t(a.labelKey)}
              </button>
            ))}
            <button onClick={() => setSelected([])} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20 transition-colors">{t('cancel')}</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchProductPlaceholder')}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-brand-accent transition-all" />
        </div>
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {(['all', 'published', 'unpublished'] as const).map((v) => (
            <button key={v} onClick={() => setShowPublished(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${showPublished === v ? 'bg-brand-primary text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {v === 'all' ? t('allFilter') : v === 'published' ? t('publishedStatus') : t('draftsStatus')}
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
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('productHeader')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('skuHeader')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('categoryHeader')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('priceHeader')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('stockHeader')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">{t('statusHeader')}</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500 text-center">⭐</th>
                <th className="py-3 pl-2 pr-4 text-xs font-semibold text-gray-500">{t('actionsHeader')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-gray-50"><td colSpan={8} className="py-3 px-4"><div className="h-5 animate-pulse rounded bg-gray-100" /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <Package size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-400">{t('noProductsFound')}</p>
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
                        {productImage(product) ? <Image src={productImage(product)!} alt={productName(product, t)} fill className="object-cover" />
                          : <Package size={20} className="absolute inset-0 m-auto text-gray-300" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-brand-primary max-w-xs">{productName(product, t)}</p>
                        <p className="text-xs text-gray-400">{brandName(product) ?? t('brandUndefined')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3"><span className="font-mono text-xs text-gray-500">{productSku(product) ?? '—'}</span></td>
                  <td className="px-2 py-3 text-xs text-gray-500">{categoryName(product) ?? '—'}</td>
                  <td className="px-2 py-3"><PriceBadge price={productPrice(product)} /></td>
                  <td className="px-2 py-3"><StockBadge qty={productStock(product)} /></td>
                  <td className="px-2 py-3">
                    {product.isPublished
                      ? <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">{t('publishedTag')}</span>
                      : <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">{t('draftTag')}</span>}
                  </td>
                  <td className="px-2 py-3 text-center">
                    {product.isFeatured && (
                      <Star size={14} className="mx-auto text-amber-400" fill="currentColor" />
                    )}
                  </td>
                  <td className="py-3 pl-2 pr-4">
                    <div className="flex gap-1">
                      <Link href={localizedHref(`/produit/${product.slug}`)} target="_blank" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors" title={t('viewOnSite')}><Eye size={15} /></Link>
                      <Link href={localizedHref(`/admin/catalog/products/${product.id}/edit`)} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title={t('editAction')}><Edit2 size={15} /></Link>
                      <button onClick={() => duplicateMutation.mutate(product.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors" title={t('duplicateAction')}><Copy size={15} /></button>
                      <button onClick={() => setConfirmDelete({ id: product.id, name: productName(product, t) })} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title={t('deleteAction')}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-sm">
          <span className="text-gray-500">
            {t('pageOf', { current: page, total: totalPages })}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('previous')}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(value + 1, totalPages))}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('next')}
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-brand-primary mb-2">{t('confirmDeleteTitle')}</h3>
            <p className="text-sm text-gray-700 mb-1 font-medium truncate">« {confirmDelete.name} »</p>
            <p className="text-sm text-gray-500 mb-6">{t('confirmDeleteDesc')}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">{t('cancel')}</button>
              <button onClick={() => deleteMutation.mutate(confirmDelete.id)} disabled={deleteMutation.isPending} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                {deleteMutation.isPending ? t('deleting') : t('deleteAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden space-y-3">
        {isLoading ? [...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />)
        : filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center shadow-sm">
            <Package size={36} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">{t('noProductsFound')}</p>
          </div>
        ) : filtered.map((product) => (
          <div key={product.id} className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            {/* Product image — larger, object-contain for product photos */}
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
              {productImage(product)
                ? <Image src={productImage(product)!} alt={productName(product, t)} fill className="object-contain p-1" />
                : <Package size={28} className="absolute inset-0 m-auto text-gray-300" />
              }
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-primary leading-snug line-clamp-2">
                {productName(product, t)}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">
                {brandName(product) ?? t('brandUndefined')}
                {categoryName(product) ? ` · ${categoryName(product)}` : ''}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <PriceBadge price={productPrice(product)} />
                <StockBadge qty={productStock(product)} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <Link
                href={localizedHref(`/admin/catalog/products/${product.id}/edit`)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title={t('editAction')}
              >
                <Edit2 size={16} />
              </Link>
              <Link
                href={localizedHref(`/produit/${product.slug}`)}
                target="_blank"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors"
                title="Voir le produit"
              >
                <Eye size={16} />
              </Link>
              <button
                onClick={() => setConfirmDelete({ id: product.id, name: productName(product, t) })}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title={t('deleteAction')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}