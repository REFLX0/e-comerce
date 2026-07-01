"use client";

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { useState } from 'react'
import { Plus, Edit2, Trash2, FolderOpen, Folder, ChevronRight, GripVertical, Package } from 'lucide-react'

type Category = { id: string; name: string; slug: string; imageUrl?: string; children?: Category[] }

function CategoryNode({ cat, depth = 0 }: { cat: Category; depth?: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = (cat.children?.length ?? 0) > 0

  return (
    <div>
      <div
        className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors ${
          depth > 0 ? 'ml-6' : ''
        }`}
      >
        <GripVertical size={14} className="text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />

        {hasChildren ? (
          <button onClick={() => setExpanded((p) => !p)} className="text-gray-400 hover:text-gray-700 transition-colors">
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
            {cat.children!.length} sous-catégorie(s)
          </span>
        )}

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Modifier">
            <Edit2 size={14} />
          </button>
          <button className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Supprimer">
            <Trash2 size={14} />
          </button>
          {depth === 0 && (
            <button className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors" title="Ajouter une sous-catégorie">
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="mt-0.5 space-y-0.5 border-l-2 border-gray-100 ml-9">
          {cat.children!.map((child) => (
            <CategoryNode key={child.id} cat={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminCategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })

  const categories: Category[] = data ?? []

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Catégories</h1>
          <p className="text-sm text-gray-500">{categories.length} catégories parentes</p>
        </div>
        <button className="flex items-center gap-2 self-start rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors">
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-50 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Arborescence des catégories — glisser-déposer pour réorganiser
          </p>
        </div>

        {/* Tree */}
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
            categories.map((cat) => (
              <CategoryNode key={cat.id} cat={cat} />
            ))
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">💡 Astuce</p>
        <p className="text-xs leading-relaxed text-blue-600">
          Faites glisser les catégories pour les réorganiser. Cliquez sur <strong>+</strong> pour ajouter des sous-catégories. Les catégories vides n'apparaissent pas dans le catalogue client.
        </p>
      </div>
    </div>
  )
}
