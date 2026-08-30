'use client'

import { useState, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Plus, Trash2, FileDown, ShoppingBag,
  User, Package, ChevronDown, Loader2, X
} from 'lucide-react'
import { backendClient } from '@/lib/api/client'

// ─── Types ────────────────────────────────────────────────────────────────
interface LineItem {
  id: string
  name: string
  volume: string
  quantity: number
  unitPriceHT: number
}

interface ProductHit {
  id: string
  name: string
  slug: string
  brand?: { name: string }
  variants: { id: string; volume: string; priceHT: number }[]
}

const TVA = 0.19

// ─── Helpers ──────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2)
}

function fmt(n: number) {
  return n.toFixed(3)
}

// ─── Product search dropdown ───────────────────────────────────────────────
function ProductSearch({ onSelect }: { onSelect: (p: ProductHit) => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const { data, isFetching } = useQuery({
    queryKey: ['pos-search', query],
    queryFn: () =>
      backendClient.get<any>('admin/products', {
        params: { search: query, limit: 8, page: 1 },
      }),
    enabled: query.length >= 2,
    staleTime: 10_000,
  })

  const products: ProductHit[] = data?.data ?? []

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50">
        <Search size={15} className="shrink-0 text-gray-400" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un produit par nom, SKU ou marque…"
          className="flex-1 text-sm outline-none placeholder:text-gray-400"
        />
        {isFetching && <Loader2 size={14} className="animate-spin text-blue-400" />}
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false) }}>
            <X size={14} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {open && products.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onSelect(p); setQuery(''); setOpen(false) }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors"
            >
              <Package size={14} className="shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{p.name}</p>
                {p.brand?.name && (
                  <p className="text-xs text-gray-400">{p.brand.name}</p>
                )}
              </div>
              <ChevronDown size={12} className="shrink-0 text-gray-300" />
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && products.length === 0 && !isFetching && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-gray-100 bg-white p-4 text-center text-sm text-gray-400 shadow-xl">
          Aucun produit trouvé
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────
export default function POSInvoicePage() {
  const [clientName, setClientName] = useState('')
  const [items, setItems] = useState<LineItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Totals ──
  const totalHT = items.reduce((s, i) => s + i.unitPriceHT * i.quantity, 0)
  const tvaAmount = totalHT * TVA
  const totalTTC = totalHT + tvaAmount

  // ── Add product from search ──
  const handleProductSelect = (p: ProductHit) => {
    const firstVariant = p.variants?.[0]
    setItems((prev) => [
      ...prev,
      {
        id: uid(),
        name: p.name,
        volume: firstVariant?.volume ?? '',
        quantity: 1,
        unitPriceHT: firstVariant?.priceHT ?? 0,
      },
    ])
  }

  // ── Add blank row ──
  const addBlankRow = () => {
    setItems((prev) => [
      ...prev,
      { id: uid(), name: '', volume: '', quantity: 1, unitPriceHT: 0 },
    ])
  }

  // ── Update a line ──
  const update = (id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  // ── Remove a line ──
  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id))

  // ── Generate PDF ──
  const generate = async () => {
    if (items.length === 0) { setError('Ajoutez au moins un produit.'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await backendClient.post('admin/pos/invoice', {
        clientName: clientName.trim() || 'Client comptoir',
        items: items.map((i) => ({
          name: i.name,
          volume: i.volume,
          quantity: i.quantity,
          unitPriceHT: i.unitPriceHT,
        })),
      }, { responseType: 'blob' })
      const blob = res.data
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      a.href = url
      a.download = `FAC-${date}-${clientName.replace(/\s+/g, '-') || 'comptoir'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e.message ?? 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ── Page Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1D3A] text-white shadow">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vente en boutique</h1>
            <p className="text-sm text-gray-500">Créez une facture pour un client comptoir</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left: Builder ── */}
        <div className="space-y-5 lg:col-span-2">

          {/* Client name */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              <User size={13} /> Client
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nom du client (optionnel — Client comptoir par défaut)"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50"
            />
          </div>

          {/* Product search */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
              Ajouter un produit
            </p>
            <ProductSearch onSelect={handleProductSelect} />
            <div className="mt-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs text-gray-400">ou</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <button
              type="button"
              onClick={addBlankRow}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-2.5 text-sm text-gray-500 transition hover:border-blue-400 hover:text-blue-600"
            >
              <Plus size={15} /> Ajouter une ligne manuelle
            </button>
          </div>

          {/* Line items table */}
          {items.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <div className="col-span-4">Désignation</div>
                <div className="col-span-2">Volume</div>
                <div className="col-span-1 text-center">Qté</div>
                <div className="col-span-2 text-right">Prix HT (DT)</div>
                <div className="col-span-2 text-right">Total HT</div>
                <div className="col-span-1" />
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50">
                {items.map((item) => {
                  const rowTotal = item.unitPriceHT * item.quantity
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 items-center gap-2 px-4 py-3"
                    >
                      {/* Name */}
                      <div className="col-span-4">
                        <input
                          value={item.name}
                          onChange={(e) => update(item.id, 'name', e.target.value)}
                          placeholder="Nom du produit"
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
                        />
                      </div>

                      {/* Volume */}
                      <div className="col-span-2">
                        <input
                          value={item.volume}
                          onChange={(e) => update(item.id, 'volume', e.target.value)}
                          placeholder="1L, 5L…"
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="col-span-1">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            update(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-center text-sm outline-none focus:border-blue-400 focus:bg-white"
                        />
                      </div>

                      {/* Unit Price HT */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          step={0.001}
                          value={item.unitPriceHT}
                          onChange={(e) =>
                            update(item.id, 'unitPriceHT', parseFloat(e.target.value) || 0)
                          }
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-right text-sm outline-none focus:border-blue-400 focus:bg-white"
                        />
                      </div>

                      {/* Total HT */}
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-semibold text-gray-800">
                          {fmt(rowTotal)} DT
                        </span>
                      </div>

                      {/* Remove */}
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Summary ── */}
        <div className="space-y-4">
          <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-gray-500">
              Récapitulatif
            </h2>

            {items.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                <ShoppingBag size={28} className="mx-auto mb-2 opacity-30" />
                Aucun article ajouté
              </div>
            ) : (
              <div className="space-y-3">
                {/* Item count */}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{items.length} article{items.length > 1 ? 's' : ''}</span>
                  <span>{items.reduce((s, i) => s + i.quantity, 0)} unité{items.reduce((s, i) => s + i.quantity, 0) > 1 ? 's' : ''}</span>
                </div>

                <div className="my-3 border-t border-gray-100" />

                {/* HT */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total HT</span>
                  <span className="font-medium text-gray-800">{fmt(totalHT)} DT</span>
                </div>

                {/* TVA */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA (19%)</span>
                  <span className="font-medium text-gray-800">{fmt(tvaAmount)} DT</span>
                </div>

                <div className="my-3 border-t border-gray-100" />

                {/* TTC */}
                <div className="flex items-center justify-between rounded-xl bg-[#0B1D3A] px-4 py-3">
                  <span className="text-sm font-bold text-white">TOTAL TTC</span>
                  <span className="text-lg font-black text-white">{fmt(totalTTC)} DT</span>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={generate}
              disabled={loading || items.length === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E10600] px-4 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(225,6,0,0.3)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Génération…</>
              ) : (
                <><FileDown size={16} /> Générer la Facture PDF</>
              )}
            </button>

            {/* Reset */}
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => { setItems([]); setClientName(''); setError(null) }}
                className="mt-2 w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
              >
                Nouvelle facture
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
