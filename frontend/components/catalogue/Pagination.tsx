'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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
  for (let i = 1; i <= totalPages; i++) {
    // Simple logic to show limited pages
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i)
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('...')
    }
  }

  // Remove duplicate '...'
  const uniquePages = pages.filter((item, index) => {
    if (item === '...' && pages[index - 1] === '...') return false
    return true
  })

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-full flex items-center justify-center border border-brand-surface-dark text-gray-500 hover:bg-brand-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      {uniquePages.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => handlePageChange(page as number)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              currentPage === page
                ? 'bg-brand-primary text-white border border-brand-primary'
                : 'border border-brand-surface-dark text-gray-600 hover:bg-brand-surface'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-full flex items-center justify-center border border-brand-surface-dark text-gray-500 hover:bg-brand-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
