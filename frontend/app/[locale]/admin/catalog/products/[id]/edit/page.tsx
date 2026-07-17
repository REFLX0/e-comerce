"use client";

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { Save, ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const id = params.id as string
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
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const { data: product, isLoading } = useQuery<any>({
    queryKey: ['admin-product', id],
    queryFn: () => adminApi.getProduct(id),
    enabled: !!id,
  })
  const { data: brandsData } = useQuery<any>({ queryKey: ['brands'], queryFn: () => fetch('/api/brands').then(r => r.json()) })
  const { data: categoriesData } = useQuery<any>({ queryKey: ['categories'], queryFn: () => fetch('/api/categories').then(r => r.json()) })

  useEffect(() => {
    if (product) {
      setNameFr(product.nameFr ?? '')
      setSlug(product.slug ?? '')
      setSku(product.sku ?? '')
      setDescription(product.description ?? '')
      setBrandId(product.brandId ?? '')
      setCategoryId(product.categoryId ?? '')
      setPrice(product.variants?.[0]?.price?.toString() ?? '')
      setStock(product.variants?.[0]?.stockQty?.toString() ?? product.stock?.toString() ?? '')
      setIsPublished(product.isPublished ?? true)
      setExistingImages((product.images ?? []).map((img: any) => img.url))
    }
  }, [product])

  const updateMutation = useMutation({
    mutationFn: (body: any) => adminApi.updateProduct(id, body),
    onSuccess: () => {
      toast.success('Produit mis à jour avec succès')
      router.push(localizedHref('/admin/catalog/products'))
    },
    onError: (err: any) => toast.error(err?.message || 'Erreur lors de la mise à jour'),
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      setImagePreview(URL.createObjectURL(selectedFile))
    }
  }

  const removeNewImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameFr || !slug || !brandId || !categoryId) {
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
        price: price ? parseFloat(price) : undefined,
        stock: stock ? parseInt(stock, 10) : undefined,
        isPublished,
      }

      if (imageUrl) {
        payload.images = [imageUrl]
      }

      updateMutation.mutate(payload)
    } catch {
      toast.error("Erreur lors de l'upload de l'image")
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-5">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-4 sm:p-6 text-center py-16">
        <h2 className="text-xl font-bold text-brand-primary mb-2">Produit introuvable</h2>
        <Link href={localizedHref('/admin/catalog/products')} className="text-sm text-brand-accent hover:underline">Retour à la liste</Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={localizedHref('/admin/catalog/products')} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-primary transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Modifier le produit</h1>
            <p className="text-sm text-gray-500">{product.nameFr}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Nom du produit *</label>
            <input type="text" value={nameFr} onChange={e => setNameFr(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Slug *</label>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">SKU</label>
            <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all resize-none" />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Prix (TND)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} min={0} step={0.01} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Stock</label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} min={0} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" />
            </div>
          </div>

          {/* Image upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Images</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((url, i) => (
                <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={url} alt="" fill className="object-cover" />
                </div>
              ))}
              {imagePreview ? (
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-brand-accent">
                  <Image src={imagePreview} alt="" fill className="object-cover" />
                  <button type="button" onClick={removeNewImage} className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white"><X size={12} /></button>
                </div>
              ) : (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-brand-accent hover:bg-brand-accent/5 transition-colors">
                  <Upload size={16} className="text-gray-400" />
                  <span className="mt-1 text-[10px] text-gray-400">Ajouter</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="rounded border-gray-300" />
            <span className="text-sm font-medium text-gray-700">Publié</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Link href={localizedHref('/admin/catalog/products')} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </Link>
          <button type="submit" disabled={updateMutation.isPending || isUploading} className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors disabled:opacity-50">
            <Save size={16} /> {isUploading ? 'Upload...' : updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
