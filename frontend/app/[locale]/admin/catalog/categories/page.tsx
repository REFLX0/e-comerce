"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { useState, useCallback, useMemo } from 'react'
import {
  Plus, Edit2, Trash2, FolderOpen, Folder, ChevronRight, GripVertical,
  X, Check, Loader2, AlertTriangle, Car, Wrench, Bike, ShipWheel,
  Layers, Package, Search, ChevronDown, ChevronsUpDown, Sparkles
} from 'lucide-react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Category = {
  id: string
  name: string
  slug: string
  imageUrl?: string
  sortOrder?: number
  productCount?: number
  children?: Category[]
}

const ROOT_ICONS: Record<string, React.ElementType> = {
  automobile: Car,
  'auto-pieces-rechange': Wrench,
  'moto-karting': Bike,
  marine: ShipWheel,
}

const ROOT_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  automobile: { bg: 'bg-blue-50 text-blue-600', text: 'text-blue-600', ring: 'ring-blue-100' },
  'auto-pieces-rechange': { bg: 'bg-amber-50 text-amber-600', text: 'text-amber-600', ring: 'ring-amber-100' },
  'moto-karting': { bg: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  marine: { bg: 'bg-cyan-50 text-cyan-600', text: 'text-cyan-600', ring: 'ring-cyan-100' },
}

/* ─────────────────────────────────────────────────────────────────────────────
   Recursive Category Node
───────────────────────────────────────────────────────────────────────────── */
function RecursiveCategoryRow({
  cat,
  depth,
  expandedIds,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
  searchQuery,
}: {
  cat: Category
  depth: number
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
  onAddChild: (parent: Category) => void
  searchQuery: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cat.id,
    disabled: depth > 0,
  })

  const style = { transform: CSS.Transform.toString(transform), transition }
  const hasChildren = (cat.children?.length ?? 0) > 0
  const isExpanded = expandedIds.has(cat.id)

  const isRoot = depth === 0
  const RootIcon = isRoot ? ROOT_ICONS[cat.slug] ?? Package : null
  const rootColor = isRoot ? ROOT_COLORS[cat.slug] ?? { bg: 'bg-gray-50 text-gray-700', text: 'text-gray-700', ring: 'ring-gray-100' } : null

  const isMatchingSearch = searchQuery && (
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div ref={setNodeRef} style={style} className={`transition-all ${isDragging ? 'z-50 opacity-70 shadow-xl ring-2 ring-brand-accent' : ''}`}>
      <div
        className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all ${
          isRoot
            ? 'bg-white border border-gray-100 shadow-sm hover:border-gray-200 hover:shadow'
            : 'hover:bg-gray-50/80 border border-transparent'
        } ${isMatchingSearch ? 'ring-2 ring-amber-400/50 bg-amber-50/40' : ''}`}
        style={{ marginLeft: `${depth * 28}px` }}
      >
        {/* Drag Handle (Root only) */}
        {isRoot ? (
          <button
            {...attributes}
            {...listeners}
            title="Glisser pour réorganiser"
            className="cursor-grab text-gray-300 hover:text-gray-600 transition-colors touch-none shrink-0 p-1"
          >
            <GripVertical size={16} />
          </button>
        ) : (
          <div className="w-2" />
        )}

        {/* Expand / Collapse Button */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(cat.id)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all shrink-0"
            title={isExpanded ? 'Replier' : 'Déplier'}
          >
            <ChevronRight size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-brand-primary' : ''}`} />
          </button>
        ) : (
          <div className="w-6 shrink-0" />
        )}

        {/* Category Icon */}
        {isRoot && RootIcon ? (
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${rootColor?.bg} ${rootColor?.ring} ring-1 font-medium shadow-2xs`}>
            <RootIcon size={18} />
          </div>
        ) : hasChildren ? (
          <FolderOpen size={18} className={`shrink-0 ${isExpanded ? 'text-brand-accent' : 'text-gray-400'}`} />
        ) : (
          <Folder size={17} className="shrink-0 text-gray-300" />
        )}

        {/* Title and Slug */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold truncate ${isRoot ? 'text-gray-900 font-bold' : 'text-gray-800'}`}>
              {cat.name}
            </span>
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-mono text-gray-500">
              /{cat.slug}
            </span>
          </div>
        </div>

        {/* Subcategories count badge */}
        {hasChildren && (
          <span
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shrink-0"
            title={`${cat.children!.length} sous-catégorie(s)`}
          >
            {cat.children!.length} {cat.children!.length === 1 ? 'sous-catégorie' : 'sous-catégories'}
          </span>
        )}

        {/* Total Products count badge */}
        {typeof cat.productCount === 'number' && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${
              cat.productCount > 0
                ? 'bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold'
                : 'bg-gray-50 text-gray-400 border border-gray-100'
            }`}
            title={`${cat.productCount.toLocaleString('fr-FR')} produit(s)`}
          >
            {cat.productCount.toLocaleString('fr-FR')} {cat.productCount > 1 ? 'produits' : 'produit'}
          </span>
        )}

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onAddChild(cat)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            title="Ajouter une sous-catégorie"
          >
            <Plus size={15} />
          </button>
          <button
            onClick={() => onEdit(cat)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Modifier la catégorie"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(cat)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Supprimer la catégorie"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Recursive Children Rows */}
      {isExpanded && hasChildren && (
        <div className="mt-1 space-y-1 relative before:absolute before:left-[17px] before:top-0 before:bottom-3 before:w-[2px] before:bg-gray-100 ml-4">
          {cat.children!.map((child) => (
            <RecursiveCategoryRow
              key={child.id}
              cat={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Modal Dialog (Create / Edit)
───────────────────────────────────────────────────────────────────────────── */
function ModalForm({
  title,
  parentName,
  initial,
  onSave,
  onClose,
}: {
  title: string
  parentName?: string
  initial?: { name: string; slug: string }
  onSave: (data: { name: string; slug: string }) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [saving, setSaving] = useState(false)

  const generateSlug = (v: string) =>
    v
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {parentName && (
              <p className="text-xs text-gray-500 mt-0.5">
                Sous-catégorie rattachée à : <span className="font-semibold text-brand-primary">{parentName}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Nom de la catégorie (FR)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!initial) setSlug(generateSlug(e.target.value))
              }}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
              placeholder="Ex: Huiles moteur"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Identifiant URL (Slug)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 font-mono px-4 py-2.5 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
              placeholder="Ex: huiles-moteur"
            />
            <p className="text-[11px] text-gray-400 mt-1">Sera utilisé dans l'URL : /categorie/{slug || '...'}</p>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={async () => {
                setSaving(true)
                await onSave({ name, slug })
                setSaving(false)
              }}
              disabled={!name || !slug || saving}
              className="flex-1 rounded-xl bg-brand-accent py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Confirm Dialog
───────────────────────────────────────────────────────────────────────────── */
function ConfirmDialog({
  message,
  onConfirm,
  onClose,
}: {
  message: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3 text-red-600">
          <AlertTriangle size={24} />
          <h3 className="text-base font-bold text-gray-900">Confirmation</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Admin Categories Page
───────────────────────────────────────────────────────────────────────────── */
export default function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [modal, setModal] = useState<{ type: 'create' | 'edit'; cat?: Category; parentId?: string; parentName?: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })

  const categories: Category[] = useMemo(() => data ?? [], [data])

  // Collect all category IDs for Expand All
  const allCategoryIds = useMemo(() => {
    const ids: string[] = []
    function collect(list: Category[]) {
      for (const item of list) {
        if (item.children && item.children.length > 0) {
          ids.push(item.id)
          collect(item.children)
        }
      }
    }
    collect(categories)
    return ids
  }, [categories])

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(allCategoryIds))
  }, [allCategoryIds])

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set())
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => categoriesApi.reorder(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['categories-tree'] })
      const previousCategories = queryClient.getQueryData<Category[]>(['categories-tree'])

      queryClient.setQueryData<Category[]>(['categories-tree'], (current = []) => {
        const categoriesById = new Map(current.map((category) => [category.id, category]))
        return ids.map((id) => categoriesById.get(id)).filter((category): category is Category => Boolean(category))
      })

      return { previousCategories }
    },
    onError: (_error, _ids, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories-tree'], context.previousCategories)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories-tree'] }),
  })

  const saveMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; parentId?: string }) =>
      categoriesApi.create({ ...data, nameFr: data.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] })
      setModal(null)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; slug: string } }) =>
      categoriesApi.update(id, { ...data, nameFr: data.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] })
      setModal(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-tree'] })
      setDeleteTarget(null)
    },
  })

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id || reorderMutation.isPending) return
      const activeId = String(active.id)
      const overId = String(over.id)
      const oldIndex = categories.findIndex((c) => c.id === activeId)
      const newIndex = categories.findIndex((c) => c.id === overId)
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(categories, oldIndex, newIndex)
      reorderMutation.mutate(reordered.map((c) => c.id))
    },
    [categories, reorderMutation.isPending, reorderMutation.mutate]
  )

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-red-400" />
          <p className="text-sm font-semibold text-red-700">Erreur lors du chargement des catégories</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount ?? 0), 0)

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Catégories</h1>
            <span className="rounded-full bg-brand-accent/20 px-3 py-0.5 text-xs font-bold text-brand-primary">
              {categories.length} catégories principales
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Arborescence synchronisée avec le catalogue storefront • {totalProducts.toLocaleString('fr-FR')} produits au total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModal({ type: 'create' })}
            className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors shadow-sm"
          >
            <Plus size={16} /> Nouvelle catégorie racine
          </button>
        </div>
      </div>

      {/* ── Toolbar: Search & Expand Controls ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une catégorie ou un slug..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2 text-xs outline-none focus:border-brand-accent focus:bg-white focus:ring-2 focus:ring-brand-accent/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={expandAll}
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Tout déplier
          </button>
          <button
            onClick={collapseAll}
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Tout replier
          </button>
        </div>
      </div>

      {/* ── Category Tree Panel ── */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-white px-5 py-3.5 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Layers size={14} className="text-brand-accent" />
            Arborescence des catégories (Glisser-déposer pour réordonner les racines)
          </p>
          <span className="text-[11px] text-gray-400">
            {allCategoryIds.length} nœuds avec sous-catégories
          </span>
        </div>

        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="space-y-3 p-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-white border border-gray-100" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl">
              <FolderOpen size={44} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-semibold text-gray-500">Aucune catégorie trouvée</p>
              <p className="text-xs text-gray-400 mt-1">Cliquez sur « Nouvelle catégorie racine » pour commencer.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2.5">
                  {categories.map((cat) => (
                    <RecursiveCategoryRow
                      key={cat.id}
                      cat={cat}
                      depth={0}
                      expandedIds={expandedIds}
                      onToggle={toggleExpanded}
                      onEdit={(c) => setModal({ type: 'edit', cat: c })}
                      onDelete={(c) => setDeleteTarget(c)}
                      onAddChild={(parent) =>
                        setModal({ type: 'create', parentId: parent.id, parentName: parent.name })
                      }
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* ── Informational Tip ── */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-800 flex items-start gap-3">
        <Sparkles size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-blue-900 mb-0.5">Organisation du catalogue</p>
          <p>
            Les 4 catégories parentes (<strong>Automobile</strong>, <strong>Pièces de Rechange / D'origine</strong>, <strong>Moto & Karting</strong>, <strong>Marine</strong>) structurent directement la barre de navigation du site et la recherche par véhicule. Vous pouvez déplier chaque niveau avec la flèche pour gérer les sous-catégories et additifs.
          </p>
        </div>
      </div>

      {/* ── Modals ── */}
      {modal && (
        <ModalForm
          title={modal.type === 'create' ? (modal.parentId ? 'Nouvelle sous-catégorie' : 'Nouvelle catégorie racine') : 'Modifier la catégorie'}
          parentName={modal.parentName}
          initial={modal.cat ? { name: modal.cat.name, slug: modal.cat.slug } : undefined}
          onSave={(data) => {
            if (modal.type === 'create') saveMutation.mutate({ ...data, parentId: modal.parentId })
            else if (modal.cat) updateMutation.mutate({ id: modal.cat.id, data })
          }}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Voulez-vous vraiment supprimer la catégorie « ${deleteTarget.name} » ? Ses sous-catégories et produits seront rattachés au niveau supérieur.`}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
