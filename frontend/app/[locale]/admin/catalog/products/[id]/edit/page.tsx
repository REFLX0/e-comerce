"use client";

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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

  const { data: product, isLoading } = useQuery<any>({
    queryKey: ['admin-product', id],
    queryFn: () => adminApi.getProduct(id),
    enabled: !!id,
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameFr || !slug || !brandId || !categoryId) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    updateMutation.mutate({
      nameFr, slug, sku, description,
      brandId, categoryId,
      price: price ? parseFloat(price) : undefined,
      stock: stock ? parseInt(stock, 10) : undefined,
      isPublished,
    })
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
              <label className="text-sm font-semibold text-gray-700">ID Marque *</label>
              <input type="text" value={brandId} onChange={e => setBrandId(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">ID Catégorie *</label>
              <input type="text" value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-accent transition-all" required />
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
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="rounded border-gray-300" />
            <span className="text-sm font-medium text-gray-700">Publié</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Link href={localizedHref('/admin/catalog/products')} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </Link>
          <button type="submit" disabled={updateMutation.isPending} className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors disabled:opacity-50">
            <Save size={16} /> {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
