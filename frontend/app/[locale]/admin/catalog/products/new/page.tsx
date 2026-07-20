"use client";

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { Save, ArrowLeft, Upload, X, Plus, Trash2, Image as ImageIcon, Info } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function NewProductPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const localizedHref = (href: string) => `/${locale}${href}`

  const [nameFr, setNameFr] = useState('')
  const [slug, setSlug] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [brandId, setBrandId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [isPublished, setIsPublished] = useState(true)

  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<{ volume: string; price: string; stockQty: string; imageFile: File | null; imagePreview: string | null }[]>([{ volume: '1L', price: '', stockQty: '', imageFile: null, imagePreview: null }])

  const { data: brandsData } = useQuery<any>({ queryKey: ['brands'], queryFn: () => fetch('/api/brands').then(r => r.json()) })
  const { data: categoriesData } = useQuery<any>({ queryKey: ['categories'], queryFn: () => fetch('/api/categories').then(r => r.json()) })

  const createMutation = useMutation({
    mutationFn: (body: any) => adminApi.createProduct(body),
    onSuccess: () => {
      toast.success('Produit créé avec succès')
      router.push(localizedHref('/admin/catalog/products'))
    },
    onError: (err: any) => toast.error(err?.message || 'Erreur lors de la création'),
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      setImagePreview(URL.createObjectURL(selectedFile))
    }
  }

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setFile(null)
    setImagePreview(null)
  }

  const addVariant = () => setVariants([...variants, { volume: '', price: '', stockQty: '', imageFile: null, imagePreview: null }])
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index))
  const updateVariant = (index: number, field: string, value: string) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }
  const handleVariantImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVariants(prev => {
      if (prev[index]?.imagePreview) URL.revokeObjectURL(prev[index].imagePreview!)
      return prev.map((v, i) => i === index ? { ...v, imageFile: file, imagePreview: URL.createObjectURL(file) } : v)
    })
  }
  const removeVariantImage = (index: number) => {
    setVariants(prev => {
      if (prev[index]?.imagePreview) URL.revokeObjectURL(prev[index].imagePreview!)
      return prev.map((v, i) => i === index ? { ...v, imageFile: null, imagePreview: null } : v)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameFr || !slug || !sku || !brandId || !categoryId) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsUploading(true)
    let imageUrl = null

    try {
      if (file) {
        const res = await adminApi.uploadImage(file)
        imageUrl = (res as any).url || (res as any).data?.url
      }
      
      const payload: any = {
        nameFr, slug, sku, description,
        brandId, categoryId,
        isPublished,
      }

      if (imageUrl) {
        payload.images = [imageUrl]
      }

      if (hasVariants) {
        const variantImageUrls: (string | null)[] = await Promise.all(
          variants.map(async (v) => {
            if (v.imageFile) {
              const res = await adminApi.uploadImage(v.imageFile)
              return (res as any).url || (res as any).data?.url || null
            }
            return null
          })
        )
        payload.variants = variants.map((v, idx) => ({
          volume: v.volume,
          price: parseFloat(v.price) || 0,
          stockQty: parseInt(v.stockQty, 10) || 0,
          imageUrl: variantImageUrls[idx],
        }))
      } else {
        payload.price = price ? parseFloat(price) : undefined
        payload.stock = stock ? parseInt(stock, 10) : undefined
      }

      createMutation.mutate(payload)
    } catch (err: any) {
      toast.error("Erreur lors de l'upload de l'image")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={localizedHref('/admin/catalog/products')} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Nouveau produit</h1>
            <p className="text-sm text-gray-500">Créez un nouveau produit dans le catalogue</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Nom du produit *</label>
            <input type="text" value={nameFr} onChange={e => setNameFr(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" placeholder="Huile Moteur 15W-40" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Slug *</label>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" placeholder="huile-moteur-15w40" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">SKU *</label>
            <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" placeholder="HUILE-15W40-001" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all resize-none" placeholder="Description du produit..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Marque *</label>
              <select value={brandId} onChange={e => setBrandId(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" required>
                <option value="">Sélectionner une marque</option>
                {Array.isArray(brandsData) && brandsData.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name || b.nameFr}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Catégorie *</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" required>
                <option value="">Sélectionner une catégorie</option>
                {Array.isArray(categoriesData) && categoriesData.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nameFr || c.name}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Image Upload Section */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Photo du produit</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <Image src={imagePreview} alt="Preview" fill className="object-contain p-2" />
                  <button type="button" onClick={removeImage} className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-red-500 shadow-sm hover:bg-white hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="flex-1">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors w-max">
                  <Upload size={16} /> Sélectionner une photo
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <p className="mt-2 text-xs text-gray-500">Formats supportés : JPG, PNG, WEBP. Taille max : 5Mo.</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Variants / Pricing Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Prix et Stock</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hasVariants} onChange={e => setHasVariants(e.target.checked)} className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                <span className="text-sm font-medium text-gray-600">Produit avec plusieurs conditionnements (ex: 1L, 4L, 5L)</span>
              </label>
            </div>

            {hasVariants ? (
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 mb-2 px-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Conditionnement</span>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Prix (TND)</span>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Stock initial</span>
                  <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1" title="Photo optionnelle propre à ce conditionnement. Remplace l'image principale sur la page produit quand cette variante est sélectionnée.">
                    Photo
                    <Info size={11} className="text-gray-300" />
                  </span>
                  <span className="w-8"></span>
                </div>
                {variants.map((v, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-center">
                    <input type="text" value={v.volume} onChange={e => updateVariant(idx, 'volume', e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-accent" placeholder="Ex: 5L" required />
                    <input type="number" value={v.price} onChange={e => updateVariant(idx, 'price', e.target.value)} min={0} step={0.01} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-accent" placeholder="0.00" required />
                    <input type="number" value={v.stockQty} onChange={e => updateVariant(idx, 'stockQty', e.target.value)} min={0} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-accent" placeholder="0" required />
                    <div className="flex items-center gap-2">
                      {v.imagePreview ? (
                        <div className="relative h-9 w-9 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                          <Image src={v.imagePreview} alt="" fill className="object-cover" />
                          <button type="button" onClick={() => removeVariantImage(idx)} className="absolute top-0 right-0 rounded-full bg-black/60 p-0.5 text-white leading-none text-[10px]" style={{ width: 14, height: 14 }}>×</button>
                        </div>
                      ) : null}
                      <label className="cursor-pointer rounded-lg border border-gray-200 bg-white p-1.5 text-gray-400 hover:border-brand-accent hover:text-brand-accent transition-colors">
                        <Upload size={14} />
                        <input type="file" accept="image/*" onChange={e => handleVariantImage(idx, e)} className="hidden" />
                      </label>
                    </div>
                    <button type="button" onClick={() => removeVariant(idx)} disabled={variants.length === 1} className="flex h-9 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-red-500 disabled:opacity-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addVariant} className="flex items-center gap-2 mt-2 text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors">
                  <Plus size={16} /> Ajouter un conditionnement
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Prix unitaire (TND)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} min={0} step={0.01} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Stock initial</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} min={0} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" placeholder="0" />
                </div>
              </div>
            )}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="rounded border-gray-300" />
            <span className="text-sm font-medium text-gray-700">Publier immédiatement</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Link href={localizedHref('/admin/catalog/products')} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </Link>
          <button type="submit" disabled={createMutation.isPending || isUploading} className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors disabled:opacity-50">
            <Save size={16} /> {isUploading ? 'Upload...' : createMutation.isPending ? 'Création...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
