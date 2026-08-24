"use client"

import { usePathname, useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useTransition } from 'react'

interface Props {
  // Offset-mode (used when nextCursor is null — admin, filtered results)
  currentPage?: number
  totalPages?: number
  // Cursor-mode (storefront infinite/load-more)
  nextCursor?: string | null
  // Shared
  isLoading?: boolean
  onLoadMore?: () => void
}

/**
 * Hybrid Pagination component.
 *
 * Behaviour:
 * - If `nextCursor` is provided  → renders a "Voir plus" (Load More) button that
 *   appends `cursor=<nextCursor>` to the URL.  The server renders the next page
 *   and React merges results on the client via the parent component state.
 * - If `totalPages` is provided  → renders traditional numbered page buttons.
 *   This mode is kept for the admin panel and filtered catalogue pages.
 */
export function Pagination({ currentPage = 1, totalPages, nextCursor, isLoading, onLoadMore }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const busy = isLoading || isPending

  // ── "Load More" / cursor mode ────────────────────────────────────────────
  if (nextCursor !== undefined) {
    if (!nextCursor) return null // no more pages

    const handleLoadMore = () => {
      if (onLoadMore) {
        onLoadMore()
        return
      }
      const params = new URLSearchParams(searchParams.toString())
      params.set('cursor', nextCursor)
      params.delete('page')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }

    return (
      <div className="mt-12 flex justify-center border-t border-slate-100 pt-7">
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={busy}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-[#16254c] shadow-sm transition-all hover:border-[#D4A76A] hover:bg-[#16254c] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Voir plus de produits"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : null}
          {busy ? 'Chargement…' : 'Voir plus de produits'}
        </button>
      </div>
    )
  }

  // ── Numbered page mode ────────────────────────────────────────────────────
  if (!totalPages || totalPages <= 1) return null

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages!) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    params.delete('cursor')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const pages: (number | string)[] = []
  for (let page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
      pages.push(page)
    } else if (page === currentPage - 2 || page === currentPage + 2) {
      pages.push('...')
    }
  }

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-2 border-t border-slate-100 pt-7"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || busy}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#16254c] transition-all hover:border-[#D4A76A] hover:bg-[#16254c] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Page précédente"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-sm text-neutral-400">…</span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => handlePageChange(page as number)}
            aria-current={currentPage === page ? 'page' : undefined}
            className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-all ${
              currentPage === page
                ? 'border-[#16254c] bg-[#16254c] text-white shadow-sm'
                : 'border-slate-200 bg-white text-[#16254c] hover:border-[#D4A76A] hover:text-[#D4A76A]'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || busy}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#16254c] transition-all hover:border-[#D4A76A] hover:bg-[#16254c] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Page suivante"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  )
}
