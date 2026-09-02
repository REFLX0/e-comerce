"use client";

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Info,
  Star,
  ArrowLeftRight,
  MoveLeft,
  MoveRight,
  Link2,
  Wrench,
  Droplets,
  Package,
  Layers,
  Sparkles,
  Loader2,
  Check
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'

interface ImageItem {
  id: string
  url?: string
  file?: File
  preview: string
  isPrimary: boolean
}

interface VariantItem {
  id?: string
  volume: string
  price: string
  stockQty: string
  imageFile: File | null
  imagePreview: string | null
  imageUrl?: string | null
}

function categoryLabel(category: any) {
  const name = category.nameFr ?? category.name ?? 'Category'
  return category.parent?.nameFr ? `${category.parent.nameFr} / ${name}` : name
}

export default function NewProductPage() {
  const t = useTranslations('Admin')
  const router = useRouter()
  const locale = useLocale()
  const localizedHref = (href: string) => `/${locale}${href}`

  // Basic Information
  const [nameFr, setNameFr] = useState('')
  const [slug, setSlug] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [brandId, setBrandId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)

  // Product Nature: "piece" (Single auto part) vs "oil" (Multi-packaging lubricant)
  const [productType, setProductType] = useState<'piece' | 'oil'>('piece')

  // For Single Piece
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('10')
  const [packageUnit, setPackageUnit] = useState('1 Pièce')

  // For Lubricants & Oils (Technical specs & variants)
  const [variants, setVariants] = useState<VariantItem[]>([
    { volume: '1L', price: '', stockQty: '10', imageFile: null, imagePreview: null },
    { volume: '5L', price: '', stockQty: '10', imageFile: null, imagePreview: null },
  ])
  // Specifications & Compatibility
  const [viscosity, setViscosity] = useState('')
  const [apiStandard, setApiStandard] = useState('')
  const [aeceaStandard, setAeceaStandard] = useState('')
  const [jasoStandard, setJasoStandard] = useState('')
  const [OEMApprovals, setOEMApprovals] = useState('')
  const [oilType, setOilType] = useState<'full_synth' | 'semi_synth' | 'mineral' | 'none'>('none')
  const [DPFCompatible, setDPFCompatible] = useState(false)
  const [TurboCompatible, setTurboCompatible] = useState(false)
  const [HybridCompatible, setHybridCompatible] = useState(false)

  // Images Management
  const [images, setImages] = useState<ImageItem[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const { data: brandsData = [] } = useQuery<any[]>({
    queryKey: ['admin-catalog-brands'],
    queryFn: adminApi.getCatalogBrands,
  })
  const { data: categoriesData = [] } = useQuery<any[]>({
    queryKey: ['admin-catalog-categories'],
    queryFn: adminApi.getCatalogCategories,
  })

  // Auto-slug generator when typing product name
  const handleNameChange = (val: string) => {
    setNameFr(val)
    if (!slug || slug === generateSlug(nameFr)) {
      setSlug(generateSlug(val))
    }
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  // Multi-File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const newFiles = Array.from(e.target.files)
    const newItems: ImageItem[] = newFiles.map((file, idx) => ({
      id: `local-${Date.now()}-${idx}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      isPrimary: images.length === 0 && idx === 0,
    }))
    setImages((prev) => [...prev, ...newItems])
    e.target.value = ''
  }

  // Add Direct Image URL
  const handleAddUrl = () => {
    if (!urlInput.trim()) return
    const item: ImageItem = {
      id: `url-${Date.now()}`,
      url: urlInput.trim(),
      preview: urlInput.trim(),
      isPrimary: images.length === 0,
    }
    setImages((prev) => [...prev, item])
    setUrlInput('')
    setShowUrlInput(false)
  }

  // Remove image
  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id)
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary) && filtered[0]) {
        filtered[0].isPrimary = true
      }
      return filtered
    })
  }

  // Set as primary image
  const setPrimaryImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
    )
  }

  // Move image order
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length) return
    setImages((prev) => {
      const copy = [...prev]
      const current = copy[index]
      const target = copy[targetIndex]
      if (current && target) {
        copy[index] = target
        copy[targetIndex] = current
      }
      return copy
    })
  }

  // Variant operations
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { volume: '', price: '', stockQty: '10', imageFile: null, imagePreview: null },
    ])
  }

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: keyof VariantItem, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    )
  }

  const handleVariantImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index
          ? {
              ...v,
              imageFile: file,
              imagePreview: URL.createObjectURL(file),
            }
          : v
      )
    )
  }

  const removeVariantImage = (index: number) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index ? { ...v, imageFile: null, imagePreview: null, imageUrl: null } : v
      )
    )
  }

  const createMutation = useMutation({
    mutationFn: (body: any) => adminApi.createProduct(body),
    onSuccess: () => {
      toast.success(t('productCreated') || 'Produit créé avec succès !')
      router.push(localizedHref('/admin/catalog/products'))
    },
    onError: (err: any) => toast.error(err?.message || t('productCreateError')),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameFr.trim() || !slug.trim() || !brandId || !categoryId) {
      toast.error(t('requiredFields') || 'Veuillez remplir tous les champs obligatoires (*)')
      return
    }

    if (productType === 'piece' && (!price || parseFloat(price) <= 0)) {
      toast.error('Veuillez saisir un prix valide pour cette pièce.')
      return
    }

    if (productType === 'oil' && variants.length === 0) {
      toast.error('Veuillez ajouter au moins un conditionnement pour ce lubrifiant.')
      return
    }

    setIsUploading(true)

    try {
      // 1. Upload all local product images in order
      const primaryItem = images.find((img) => img.isPrimary) || images[0]
      const orderedImages = primaryItem
        ? [primaryItem, ...images.filter((img) => img.id !== primaryItem.id)]
        : images

      const uploadedImageUrls: string[] = await Promise.all(
        orderedImages.map(async (img) => {
          if (img.file) {
            const res = await adminApi.uploadImage(img.file)
            return (res as any).url || (res as any).data?.url || ''
          }
          return img.url || ''
        })
      )
      const finalImages = uploadedImageUrls.filter(Boolean)

      // 2. Upload variant images if present
      let finalVariants: any = undefined
      if (productType === 'oil') {
        const variantImageUrls: (string | null)[] = await Promise.all(
          variants.map(async (v) => {
            if (v.imageFile) {
              const res = await adminApi.uploadImage(v.imageFile)
              return (res as any).url || (res as any).data?.url || null
            }
            return v.imageUrl || null
          })
        )

        finalVariants = variants.map((v, idx) => ({
          volume: v.volume.trim() || '1L',
          price: parseFloat(v.price) || 0,
          stockQty: parseInt(v.stockQty, 10) || 0,
          imageUrl: variantImageUrls[idx],
        }))
      }

      // 3. Assemble full product payload
      const payload: any = {
        nameFr: nameFr.trim(),
        slug: slug.trim(),
        sku: sku.trim() || `SKU-${slug.toUpperCase()}-${Date.now().toString().slice(-4)}`,
        description: description.trim() || nameFr.trim(),
        shortDescription: shortDescription.trim() || undefined,
        brandId,
        categoryId,
        isPublished,
        isFeatured,
        images: finalImages,
      }

      if (productType === 'piece') {
        payload.price = parseFloat(price) || 0
        payload.stock = parseInt(stock, 10) || 0
        payload.packageUnit = packageUnit.trim() || '1 Pièce'
      } else {
        payload.variants = finalVariants
      }

      payload.specs = {
        viscosity: viscosity.trim() || undefined,
        apiStandard: apiStandard.trim() || undefined,
        aeceaStandard: aeceaStandard.trim() || undefined,
        jasoStandard: jasoStandard.trim() || undefined,
        OEMApprovals: OEMApprovals.trim() || undefined,
        isFullySynth: oilType === 'full_synth',
        isSemiSynth: oilType === 'semi_synth',
        isMinerale: oilType === 'mineral',
        DPFCompatible,
        TurboCompatible,
        HybridCompatible,
      }

      createMutation.mutate(payload)
    } catch {
      toast.error(t('uploadError') || "Erreur lors de l'upload des images.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href={localizedHref('/admin/catalog/products')}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D4A76A]" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catalogue Pièces & Huiles</span>
            </div>
            <h1 className="text-2xl font-black text-[#16254c] tracking-tight">{t('newProduct') || 'Ajouter un Produit'}</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Type Switcher Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type de produit & Tarification</span>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setProductType('piece')}
              className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                productType === 'piece'
                  ? 'border-[#16254c] bg-[#16254c]/5 ring-2 ring-[#16254c]/10 shadow-sm'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                productType === 'piece' ? 'bg-[#16254c] text-white shadow-md' : 'bg-slate-200 text-slate-600'
              }`}>
                <Wrench size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Pièce Détachée / Filtre / Accessoire</p>
                <p className="text-xs text-slate-500 mt-0.5">Produit standard avec prix unique et gestion directe du stock.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setProductType('oil')}
              className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                productType === 'oil'
                  ? 'border-[#16254c] bg-[#16254c]/5 ring-2 ring-[#16254c]/10 shadow-sm'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                productType === 'oil' ? 'bg-[#16254c] text-white shadow-md' : 'bg-slate-200 text-slate-600'
              }`}>
                <Droplets size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Huile Moteur / Lubrifiant / Fluide</p>
                <p className="text-xs text-slate-500 mt-0.5">Produit avec volumes multiples (1L, 4L, 5L...) et spécifications techniques.</p>
              </div>
            </button>
          </div>
        </div>

        {/* General Information Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Package size={17} className="text-[#16254c]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Informations Générales</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nom du produit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nameFr}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="ex: Plaquettes de frein avant Brembo P85020 ou Huile Castrol EDGE 5W-30 LL"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Slug URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ex: plaquettes-de-frein-brembo-p85020"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-mono text-slate-800 outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Référence SKU / Code Article
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="ex: BREM-P85020"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-mono text-slate-800 outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Marque Fabricant <span className="text-rose-500">*</span>
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
                required
              >
                <option value="">-- Sélectionner une marque --</option>
                {brandsData.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name || b.nameFr}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Catégorie Catalogue <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
                required
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {categoriesData.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {categoryLabel(c)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description courte / Résumé d&apos;en-tête
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Apparaît en haut sous le stock et le prix (fiche client)
                </span>
              </div>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Ex: Shampoing-cire auto-séchant pour le nettoyage de la carrosserie..."
                rows={4}
                className="w-full min-h-[110px] rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 leading-relaxed outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10 resize-y"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description détaillée (Onglet complet)
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Apparaît dans l&apos;onglet Description en bas de page
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={12}
                placeholder="Spécifications, compatibilités, caractéristiques techniques du produit..."
                className="w-full min-h-[280px] rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 leading-relaxed outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10 resize-y"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock Card */}
        {productType === 'piece' ? (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Wrench size={17} className="text-[#16254c]" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Prix & Stock de la Pièce</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Prix de Vente (TND) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.000"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-base font-bold font-mono text-slate-900 outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">TND</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantité en Stock</label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-base font-bold font-mono text-slate-900 outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Conditionnement / Unité</label>
                <input
                  type="text"
                  value={packageUnit}
                  onChange={(e) => setPackageUnit(e.target.value)}
                  placeholder="ex: 1 Pièce, Jeu de 4, Kit..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-[#16254c] focus:bg-white focus:ring-2 focus:ring-[#16254c]/10"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Droplets size={17} className="text-[#16254c]" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Conditionnements & Volumes d&apos;Huile</h2>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
              >
                <Plus size={14} />
                <span>Ajouter un volume</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50"
                >
                  <div className="w-full sm:w-32">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Volume</span>
                    <input
                      type="text"
                      value={v.volume}
                      onChange={(e) => updateVariant(idx, 'volume', e.target.value)}
                      placeholder="ex: 1L, 5L"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#16254c]"
                      required
                    />
                  </div>

                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Prix (TND)</span>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={v.price}
                      onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                      placeholder="0.000"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none focus:border-[#16254c]"
                      required
                    />
                  </div>

                  <div className="w-full sm:w-28">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Stock</span>
                    <input
                      type="number"
                      min="0"
                      value={v.stockQty}
                      onChange={(e) => updateVariant(idx, 'stockQty', e.target.value)}
                      placeholder="10"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none focus:border-[#16254c]"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center mt-2 sm:mt-4">
                    {v.imagePreview ? (
                      <div className="relative h-9 w-9 shrink-0 rounded-xl overflow-hidden border border-slate-300">
                        <Image src={v.imagePreview} alt="" fill className="object-contain p-0.5" />
                        <button
                          type="button"
                          onClick={() => removeVariantImage(idx)}
                          className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-400 transition-colors" title="Photo spécifique du bidon (optionnel)">
                        <Upload size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleVariantImage(idx, e)}
                          className="hidden"
                        />
                      </label>
                    )}

                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Specifications & Compatibility Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Droplets size={17} className="text-[#16254c]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Spécifications Techniques, Normes & Homologations Constructeurs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Viscosité SAE</label>
              <input
                type="text"
                value={viscosity}
                onChange={(e) => setViscosity(e.target.value)}
                placeholder="ex: 5W-30, 5W-40, 10W-40, 75W-80..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#16254c] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Norme ACEA</label>
              <input
                type="text"
                value={aeceaStandard}
                onChange={(e) => setAeceaStandard(e.target.value)}
                placeholder="ex: C3, A3/B4, C2, E7..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#16254c] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Norme API</label>
              <input
                type="text"
                value={apiStandard}
                onChange={(e) => setApiStandard(e.target.value)}
                placeholder="ex: SP, SN/CF, SL, GL-4, GL-5..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#16254c] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Norme JASO (Motos/2-Roues)</label>
              <input
                type="text"
                value={jasoStandard}
                onChange={(e) => setJasoStandard(e.target.value)}
                placeholder="ex: MA2, MB, FD, FC..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#16254c] focus:bg-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2 lg:col-span-4">
              <label className="text-xs font-semibold text-slate-700">
                Homologations & Approbations Constructeurs (OEM) / Compatibilité
              </label>
              <input
                type="text"
                value={OEMApprovals}
                onChange={(e) => setOEMApprovals(e.target.value)}
                placeholder="ex: VW 504.00/507.00, MB 229.51, BMW LL-04, Porsche C30, RN0720, Ford WSS-M2C913-D..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#16254c] focus:bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Ces homologations apparaîtront avec des badges officiels dans l&apos;onglet Compatibilité de la page produit.
              </p>
            </div>

            {/* Technology Base */}
            <div className="space-y-1 sm:col-span-2 lg:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Technologie / Base d&apos;huile</label>
              <select
                value={oilType}
                onChange={(e) => setOilType(e.target.value as any)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#16254c] focus:bg-white"
              >
                <option value="none">-- Vide (Non spécifié) --</option>
                <option value="full_synth">100% Synthèse (Full Synthetic)</option>
                <option value="semi_synth">Semi-Synthèse (Technosynthese)</option>
                <option value="mineral">Minérale</option>
              </select>
            </div>

            {/* Compatibility Flags */}
            <div className="sm:col-span-2 lg:col-span-2 flex flex-wrap gap-4 items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={DPFCompatible}
                  onChange={(e) => setDPFCompatible(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#16254c] focus:ring-[#16254c]"
                />
                Compatible FAP / DPF
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={TurboCompatible}
                  onChange={(e) => setTurboCompatible(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#16254c] focus:ring-[#16254c]"
                />
                Compatible Turbo
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={HybridCompatible}
                  onChange={(e) => setHybridCompatible(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#16254c] focus:ring-[#16254c]"
                />
                Compatible Hybride
              </label>
            </div>
          </div>
        </div>

        {/* Multi-Images Management Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon size={17} className="text-[#16254c]" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Galerie Photos du Produit</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Link2 size={13} />
                <span>Coller un lien URL</span>
              </button>
            </div>
          </div>

          {showUrlInput && (
            <div className="flex gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/... ou lien photo fabricant"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-[#16254c]"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="rounded-xl bg-[#16254c] px-4 py-2 text-xs font-bold text-white hover:bg-[#1f3469]"
              >
                Ajouter
              </button>
            </div>
          )}

          {/* Image Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className={`group relative flex flex-col rounded-2xl border bg-white p-2 shadow-sm transition-all ${
                  img.isPrimary ? 'border-[#D4A76A] ring-2 ring-[#D4A76A]/20' : 'border-slate-200'
                }`}
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50">
                  <Image src={img.preview} alt="" fill className="object-contain p-1" />
                  {img.isPrimary && (
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-[#16254c] px-2 py-0.5 text-[9px] font-black text-[#D4A76A] shadow-md flex items-center gap-1">
                      <Star size={9} fill="#D4A76A" /> Principale
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors shadow-sm"
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-0.5">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'left')}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title="Déplacer vers la gauche"
                      >
                        <MoveLeft size={13} />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'right')}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title="Déplacer vers la droite"
                      >
                        <MoveRight size={13} />
                      </button>
                    )}
                  </div>
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(img.id)}
                      className="text-[10px] font-bold text-slate-500 hover:text-[#16254c] hover:underline"
                    >
                      Définir principale
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Upload Zone */}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-400 transition-all text-center p-3">
              <Upload size={22} className="text-slate-400 group-hover:text-slate-600" />
              <span className="mt-2 text-xs font-bold text-slate-700">Ajouter photos</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Sélection multiple</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Publication & Visibility */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#16254c] focus:ring-[#16254c]"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">Publier immédiatement dans le catalogue</p>
                <p className="text-xs text-slate-500">Le produit sera visible et commandable en ligne par les clients.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#16254c] focus:ring-[#16254c]"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">Mettre en avant sur la page d&apos;accueil</p>
                <p className="text-xs text-slate-500">Ajoute un badge VIP et affiche le produit dans les sélections vedettes.</p>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Link
              href={localizedHref('/admin/catalog/products')}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending || isUploading}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#16254c] px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-[#16254c]/15 transition-all hover:bg-[#1f3469] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isUploading || createMutation.isPending ? (
                <Loader2 size={16} className="animate-spin text-[#D4A76A]" />
              ) : (
                <Save size={16} className="text-[#D4A76A]" />
              )}
              <span>{isUploading ? 'Téléversement photos...' : createMutation.isPending ? 'Enregistrement...' : 'Enregistrer le produit'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}