"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { useState, useCallback } from 'react'
import {
  Plus, Edit2, Trash2, FolderOpen, Folder, ChevronRight, GripVertical, X, Check, Loader2
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
import { useTranslations } from 'next-intl'

type Category = { id: string; name: string; slug: string; imageUrl?: string; sortOrder?: number; children?: Category[] }

function SortableCategoryRow({
  cat,
  depth,
  onEdit,
  onDelete,
  onAddChild,
  onToggle,
  expanded,
}: {
  cat: Category
  depth: number
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
  onAddChild: (parent: Category) => void
  onToggle: (id: string) => void
  expanded: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const hasChildren = (cat.children?.length ?? 0) > 0

  return (
    <div ref={setNodeRef} style={style} className={`rounded-xl transition-colors ${isDragging ? 'z-50 opacity-70 shadow-lg ring-2 ring-brand-accent' : ''}`}>
      <div className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors ${depth > 0 ? 'ml-8' : ''}`}>
        <button {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-600 transition-colors touch-none">
          <GripVertical size={14} />
        </button>

        {hasChildren ? (
          <button onClick={() => onToggle(cat.id)} className="text-gray-400 hover:text-gray-700 transition-colors">
            <ChevronRight size={16} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        ) : (
          <div className="w-4" />
        )}

        {hasChildren ? (
          <FolderOpen size={18} className="shrink-0 text-brand-accent" />
        ) : (
          <Folder size={18} className="shrink-0 text-gray-300" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-primary">{cat.name}</p>
          <p className="text-xs text-gray-400">/{cat.slug}</p>
        </div>

        {hasChildren && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {cat.children!.length}
          </span>
        )}

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(cat)} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <Edit2 size={14} />
          </button>
          {depth < 2 && (
            <button onClick={() => onAddChild(cat)} className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors">
              <Plus size={14} />
            </button>
          )}
          <button onClick={() => onDelete(cat)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalForm({
  title,
  initial,
  onSave,
  onClose,
}: {
  title: string
  initial?: { nameFr: string; slug: string }
  onSave: (data: { nameFr: string; slug: string }) => void
  onClose: () => void
}) {
  const [nameFr, setNameFr] = useState(initial?.nameFr ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [saving, setSaving] = useState(false)

  const generateSlug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-primary">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</label>
            <input
              type="text"
              value={nameFr}
              onChange={(e) => { setNameFr(e.target.value); if (!initial) setSlug(generateSlug(e.target.value)) }}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
              placeholder="Nom de la catégorie"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
              placeholder="slug-de-la-categorie"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button
              onClick={async () => { setSaving(true); await onSave({ nameFr, slug }); setSaving(false) }}
              disabled={!nameFr || !slug || saving}
              className="flex-1 rounded-xl bg-brand-accent py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="mx-auto animate-spin" /> : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmDialog({ message, onConfirm, onClose }: { message: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm text-gray-700">{message}</p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const t = useTranslations('Admin')
  const queryClient = useQueryClient()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<{ type: 'create' | 'edit'; cat?: Category; parentId?: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })

  const categories: Category[] = data ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => categoriesApi.reorder(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories-tree'] }),
  })

  const saveMutation = useMutation({
    mutationFn: (data: { nameFr: string; slug: string; parentId?: string }) => categoriesApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories-tree'] }); setModal(null) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nameFr: string; slug: string } }) => categoriesApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories-tree'] }); setModal(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories-tree'] }); setDeleteTarget(null) },
  })

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(categories, oldIndex, newIndex)
    reorderMutation.mutate(reordered.map((c) => c.id))
  }, [categories, reorderMutation])

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">{t('categories')}</h1>
          <p className="text-sm text-gray-500">{categories.length} catégories parentes</p>
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 self-start rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors"
        >
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-50 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Arborescence des catégories — glisser-déposer pour réorganiser
          </p>
        </div>

        <div className="p-3 space-y-0.5">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-50" />
            ))
          ) : categories.length === 0 ? (
            <div className="py-16 text-center">
              <FolderOpen size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-semibold text-gray-400">Aucune catégorie</p>
              <p className="text-xs text-gray-300 mt-1">Créez votre première catégorie pour commencer</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-0.5">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <SortableCategoryRow
                        cat={cat}
                        depth={0}
                        onEdit={(c) => setModal({ type: 'edit', cat: c })}
                        onDelete={(c) => setDeleteTarget(c)}
                        onAddChild={(parent) => setModal({ type: 'create', parentId: parent.id })}
                        onToggle={toggleExpanded}
                        expanded={expandedIds.has(cat.id)}
                      />
                      {expandedIds.has(cat.id) && cat.children && cat.children.length > 0 && (
                        <div className="ml-0 mt-0.5 space-y-0.5 border-l-2 border-gray-100 ml-9">
                          {cat.children.map((child) => (
                            <SortableCategoryRow
                              key={child.id}
                              cat={child}
                              depth={1}
                              onEdit={(c) => setModal({ type: 'edit', cat: c })}
                              onDelete={(c) => setDeleteTarget(c)}
                              onAddChild={(parent) => setModal({ type: 'create', parentId: parent.id })}
                              onToggle={() => {}}
                              expanded={false}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">Astuce</p>
        <p className="text-xs leading-relaxed text-blue-600">
          Faites glisser les catégories pour les réorganiser. Cliquez sur <strong>+</strong> pour ajouter des sous-catégories. Les catégories vides n'apparaissent pas dans le catalogue client.
        </p>
      </div>

      {modal && (
        <ModalForm
          title={modal.type === 'create' ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
          initial={modal.cat ? { nameFr: modal.cat.name, slug: modal.cat.slug } : undefined}
          onSave={(data) => {
            if (modal.type === 'create') saveMutation.mutate({ ...data, parentId: modal.parentId })
            else if (modal.cat) updateMutation.mutate({ id: modal.cat.id, data })
          }}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Supprimer "${deleteTarget.name}" ? Les sous-catégories seront déplacées au niveau supérieur.`}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
