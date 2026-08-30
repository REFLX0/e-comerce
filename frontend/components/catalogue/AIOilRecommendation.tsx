'use client'

import { useQuery } from '@tanstack/react-query'
import { Sparkles, MessageCircleWarning } from 'lucide-react'
import { productsApi } from '@/lib/api/products'

import { useTranslations } from 'next-intl'

interface AIOilRecommendationProps {
  make: string
  model: string
  engineCode?: string
}

export function AIOilRecommendation({ make, model, engineCode }: AIOilRecommendationProps) {
  const t = useTranslations('Catalogue')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ai-recommendation', make, model, engineCode],
    queryFn: () => productsApi.getAIRecommendation({ make, model, engineCode }),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

  if (isLoading) {
    return (
      <div className="mb-8 mt-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-[#16254c] animate-pulse">
          <Sparkles className="h-5 w-5" />
          <p className="text-sm font-semibold">{t('aiSearching')}</p>
        </div>
      </div>
    )
  }

  if (isError || !data?.recommendation) {
    return (
      <div className="mb-8 mt-4 rounded-xl border border-red-100 bg-red-50 p-6 shadow-sm">
        <div className="flex items-center gap-3 text-red-800">
          <MessageCircleWarning className="h-5 w-5" />
          <p className="text-sm font-medium">{t('aiUnavailable')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8 mt-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="h-24 w-24 text-blue-600" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 text-blue-800">
          <Sparkles className="h-5 w-5" />
          <h3 className="text-lg font-bold">{t('aiAssistantTitle')}</h3>
        </div>
        <div className="text-sm text-blue-900/80 leading-relaxed space-y-2 whitespace-pre-wrap">
          {data.recommendation}
        </div>
      </div>
    </div>
  )
}
