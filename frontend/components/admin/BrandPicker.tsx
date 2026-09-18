'use client'

import type { CatalogBrand } from '@/lib/api/admin'

/** Sentinel value of the "type a new brand" option in the select. */
export const NEW_BRAND = '__new__'

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10'

interface BrandPickerProps {
  brands: CatalogBrand[]
  brandId: string
  onBrandIdChange: (id: string) => void
  newBrandName: string
  onNewBrandNameChange: (name: string) => void
}

/**
 * Brand select for the product forms, with a way out when the manufacturer is
 * not in the list yet: picking "Autre marque" reveals a text field, and the
 * form creates the brand on submit (see resolveBrandId).
 */
export function BrandPicker({
  brands,
  brandId,
  onBrandIdChange,
  newBrandName,
  onNewBrandNameChange,
}: BrandPickerProps) {
  const isNew = brandId === NEW_BRAND
  const typed = newBrandName.trim().toLowerCase()
  const existingMatch = typed
    ? brands.find((b) => b.name.trim().toLowerCase() === typed)
    : undefined

  return (
    <div className="space-y-2">
      <select
        value={brandId}
        onChange={(e) => onBrandIdChange(e.target.value)}
        className={inputClass}
        required
      >
        <option value="">-- Sélectionner une marque --</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
        <option value={NEW_BRAND}>+ Autre marque (saisir manuellement)</option>
      </select>

      {isNew && (
        <div className="space-y-1">
          <input
            type="text"
            value={newBrandName}
            onChange={(e) => onNewBrandNameChange(e.target.value)}
            placeholder="Nom de la marque (ex: Bardahl)"
            maxLength={80}
            autoFocus
            required
            className={inputClass}
          />
          <p className="text-xs text-slate-500">
            {existingMatch
              ? `« ${existingMatch.name} » existe déjà — elle sera utilisée.`
              : 'La marque sera ajoutée à la liste lors de l’enregistrement.'}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Turns the picker's state into a real brand id, creating the brand if the
 * admin typed a new one. Returns null when nothing usable was entered.
 */
export async function resolveBrandId(
  brandId: string,
  newBrandName: string,
  createBrand: (name: string) => Promise<CatalogBrand>
): Promise<string | null> {
  if (brandId !== NEW_BRAND) return brandId || null
  const name = newBrandName.trim()
  if (!name) return null
  const brand = await createBrand(name)
  return brand.id
}
