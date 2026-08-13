"use client"

import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/catalogue?${params.toString()}`)
  }

  const pages: (number | string)[] = []
  for (let page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) pages.push(page)
    else if (page === currentPage - 2 || page === currentPage + 2) pages.push('...')
  }

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5 border-t border-black/10 pt-7" aria-label="Pagination">
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center border border-black/15 text-[#111] transition-colors hover:border-[#E10600] hover:bg-[#E10600] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Previous page"
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
            className={`flex h-10 min-w-10 items-center justify-center border px-2 text-sm font-black transition-colors ${
              currentPage === page
                ? 'border-[#E10600] bg-[#E10600] text-white'
                : 'border-black/15 text-[#111] hover:border-[#E10600] hover:text-[#E10600]'
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center border border-black/15 text-[#111] transition-colors hover:border-[#E10600] hover:bg-[#E10600] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  )
}
