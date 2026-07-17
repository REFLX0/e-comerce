"use client";

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import { adminApi } from '@/lib/api/admin'
import { toast } from 'sonner'
import { Search, AlertTriangle, TrendingDown, Package, Edit2, Download } from 'lucide-react'

function StockBar({ qty, max = 200 }: { qty: number; max?: number }) {
  const pct = Math.min((qty / max) * 100, 100)
  const color = qty === 0 ? 'bg-red-500' : qty <= 5 ? 'bg-yellow-400' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`w-10 text-right text-xs font-bold ${qty === 0 ? 'text-red-500' : qty <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
        {qty}
      </span>
    </div>
  )
}

function StatusTag({ qty }: { qty: number }) {
  if (qty === 0)  return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600"><AlertTriangle size={10} /> Rupture</span>
  if (qty <= 5)   return <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-600"><TrendingDown size={10} /> Critique</span>
  if (qty <= 20)  return <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-600">Faible</span>
  return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-600">Normal</span>
}

// Inline editable qty cell
function QtyCell({ productId, qty }: { productId: string; qty: number }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(qty)
  const [saving, setSaving] = useState(false)

  return editing ? (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (val === qty) { setEditing(false); return }
        setSaving(true)
        try {
          await adminApi.updateProduct(productId, { stock: val })
          setEditing(false)
        } catch {
          setVal(qty)
          toast.error('Erreur lors de la mise à jour du stock')
        } finally {
          setSaving(false)
        }
      }}
      className="flex items-center gap-1"
    >
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        className="w-16 rounded-lg border border-brand-accent bg-white px-2 py-1 text-sm font-semibold text-brand-primary outline-none text-center"
        autoFocus
        min={0}
        disabled={saving}
      />
      <button type="submit" disabled={saving} className="rounded-lg bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-100">{saving ? '...' : '✓'}</button>
      <button type="button" onClick={() => { setVal(qty); setEditing(false) }} disabled={saving} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
    </form>
  ) : (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors"
      title="Cliquer pour modifier"
    >
      <span className="text-sm font-semibold text-brand-primary">{val}</span>
      <Edit2 size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
    </button>
  )
}

interface InventoryItem {
  productId: string
  productName: string
  sku: string
  volume?: string
  price?: number
  qty: number
}

export default function AdminInventoryPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'critical' | 'rupture'>('all')

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: ['admin-products-inventory'],
    queryFn: () => productsApi.getAll({ limit: 50 }),
  })

  const products = (data as any)?.data ?? []

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-red-400" />
          <p className="text-sm font-semibold text-red-700">Erreur de chargement des stocks</p>
          <button onClick={() => refetch()} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Réessayer</button>
        </div>
      </div>
    )
  }

  // Flatten to variants
  const items = products.flatMap((p) =>
    (p.variants ?? [{ id: p.id, volume: 'Standard', priceHT: p.price, stock: p.stock, sku: p.sku }]).map((v: any) => ({
      productId: p.id,
      productName: p.name,
      sku: v.sku ?? p.sku,
      volume: v.volume,
      price: v.priceHT ?? v.price ?? p.price,
      qty: v.stock ?? v.stockQty ?? p.stock ?? 0,
    }))
  )

  const filtered = items.filter((item: any) => {
    const matchSearch = !search ||
      item.productName?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'rupture' ? item.qty === 0 :
      item.qty > 0 && item.qty <= 5
    return matchSearch && matchFilter
  })

  const summary = {
    total: items.length,
    rupture: items.filter((i: any) => i.qty === 0).length,
    critical: items.filter((i: any) => i.qty > 0 && i.qty <= 5).length,
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Inventaire</h1>
          <p className="text-sm text-gray-500">Gérez les niveaux de stock en temps réel</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            const header = 'Produit,SKU,Volume,Prix TND,Stock,Statut\n'
            const rows = filtered.map((item: any) =>
              [item.productName, item.sku, item.volume, (item.price ?? 0).toFixed(2), item.qty,
                item.qty === 0 ? 'Rupture' : item.qty <= 5 ? 'Critique' : 'Normal'
              ].join(',')
            ).join('\n')
            const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `inventaire-${new Date().toISOString().split('T')[0]}.csv`
            a.click(); URL.revokeObjectURL(url)
          }} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Exporter CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Variantes totales', value: summary.total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Rupture de stock', value: summary.rupture, color: 'bg-red-50 text-red-700' },
          { label: 'Stock critique (≤5)', value: summary.critical, color: 'bg-yellow-50 text-yellow-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl ${s.color} p-4 text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="mt-0.5 text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Produit, SKU..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-brand-accent transition-all"
          />
        </div>
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {([
            { key: 'all', label: 'Tous' },
            { key: 'rupture', label: 'Rupture' },
            { key: 'critical', label: 'Critique' },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === f.key ? 'bg-brand-primary text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tip - inline editing */}
      <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm text-blue-600">
        <Edit2 size={14} className="shrink-0" />
        <span>Cliquez sur un chiffre de stock pour le modifier directement sans changer de page.</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="py-3 pl-4 pr-2 text-xs font-semibold text-gray-500">Produit / SKU</th>
                <th className="hidden px-2 py-3 text-xs font-semibold text-gray-500 sm:table-cell">Volume</th>
                <th className="hidden px-2 py-3 text-xs font-semibold text-gray-500 md:table-cell">Prix</th>
                <th className="px-2 py-3 text-xs font-semibold text-gray-500">Stock (clic pour éditer)</th>
                <th className="py-3 pl-2 pr-4 text-xs font-semibold text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td colSpan={5} className="py-3 px-4">
                      <div className="h-5 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Package size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-sm text-gray-400">Aucun produit trouvé</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item: any) => (
                  <tr key={item.sku} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pl-4 pr-2">
                      <p className="text-sm font-medium text-brand-primary">{item.productName}</p>
                      <p className="font-mono text-xs text-gray-400">{item.sku}</p>
                    </td>
                    <td className="hidden px-2 py-3 text-xs text-gray-500 sm:table-cell">{item.volume}</td>
                    <td className="hidden px-2 py-3 text-sm font-medium text-gray-700 md:table-cell whitespace-nowrap">
                      {(item.price ?? 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND
                    </td>
                    <td className="px-2 py-3">
                      <div className="max-w-xs space-y-1">
                        <StockBar qty={item.qty} />
                        <QtyCell productId={item.productId} qty={item.qty} />
                      </div>
                    </td>
                    <td className="py-3 pl-2 pr-4">
                      <StatusTag qty={item.qty} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
