"use client";

import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { gooeyToast as toast } from 'goey-toast'
import { ArrowLeft, Download, RotateCcw, FileText } from 'lucide-react'
import { priceImportsApi, type PriceImportItemStatus } from '@/lib/api/price-imports'

function money(n: number | null | undefined) {
  if (n == null) return '—'
  return `${n.toFixed(3)} DT`
}

const STATUS_BADGE: Record<string, string> = {
  MATCHED: 'bg-green-100 text-green-700',
  NOT_FOUND: 'bg-gray-100 text-gray-600',
  DUPLICATE: 'bg-amber-100 text-amber-700',
  INVALID_PRICE: 'bg-red-100 text-red-700',
  AMBIGUOUS: 'bg-amber-100 text-amber-700',
  APPLIED: 'bg-blue-100 text-blue-700',
  SKIPPED: 'bg-gray-100 text-gray-500',
  ROLLED_BACK: 'bg-slate-200 text-slate-500',
}

export default function PriceImportDetailPage() {
  const t = useTranslations('PriceUpdates')
  const locale = useLocale()
  const params = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: priceImport, isLoading } = useQuery({
    queryKey: ['admin-price-import', params.id],
    queryFn: () => priceImportsApi.getOne(params.id),
  })

  const rollbackMutation = useMutation({
    mutationFn: () => priceImportsApi.rollback(params.id),
    onSuccess: () => {
      toast.success(t('rollbackSuccess'))
      queryClient.invalidateQueries({ queryKey: ['admin-price-import', params.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-price-imports'] })
    },
    onError: (err: any) => toast.error(err?.message || t('rollbackError')),
  })

  const itemStatusLabel = (status: PriceImportItemStatus) => {
    const map: Record<PriceImportItemStatus, string> = {
      MATCHED: t('itemStatusMatched'),
      NOT_FOUND: t('itemStatusNotFound'),
      DUPLICATE: t('itemStatusDuplicate'),
      INVALID_PRICE: t('itemStatusInvalidPrice'),
      AMBIGUOUS: t('itemStatusAmbiguous'),
      APPLIED: t('itemStatusApplied'),
      SKIPPED: t('itemStatusSkipped'),
      ROLLED_BACK: t('itemStatusRolledBack'),
    }
    return map[status] || status
  }

  if (isLoading) {
    return <p className="p-6 text-center text-gray-400">{t('loading')}</p>
  }

  if (!priceImport) {
    return <p className="p-6 text-center text-gray-400">{t('noImports')}</p>
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <Link href={`/${locale}/admin/price-updates`} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-primary w-fit">
        <ArrowLeft size={14} /> {t('detailBack')}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-primary">
            <FileText size={22} /> {priceImport.filename}
          </h1>
          <p className="text-sm text-gray-500">
            {priceImport.supplier} · {new Date(priceImport.createdAt).toLocaleString(locale)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[priceImport.status] || 'bg-gray-100 text-gray-600'}`}>
            {priceImport.status === 'PREVIEW' ? t('statusPreview') : priceImport.status === 'APPLIED' ? t('statusApplied') : t('statusRolledBack')}
          </span>
          {priceImport.fileUrl && (
            <a
              href={priceImport.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-gray-300"
            >
              <Download size={13} /> {t('detailFileDownload')}
            </a>
          )}
          {priceImport.status === 'APPLIED' && (
            <button
              onClick={() => {
                if (confirm(t('rollbackConfirm'))) rollbackMutation.mutate()
              }}
              disabled={rollbackMutation.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={13} /> {t('rollbackAction')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label={t('summaryDetected')} value={priceImport.detectedCount} />
        <SummaryCard label={t('summaryMatched')} value={priceImport.matchedCount} />
        <SummaryCard label={t('summaryUnmatched')} value={priceImport.unmatchedCount} />
        <SummaryCard label={t('historyUpdated')} value={priceImport.updatedCount} />
      </div>

      {priceImport.appliedBy && (
        <p className="text-sm text-gray-500">
          {t('detailAppliedBy')}: <span className="font-medium text-gray-700">{priceImport.appliedBy.name || priceImport.appliedBy.email}</span>
          {priceImport.appliedAt && ` · ${new Date(priceImport.appliedAt).toLocaleString(locale)}`}
        </p>
      )}
      {priceImport.rolledBackBy && (
        <p className="text-sm text-gray-500">
          {t('detailRolledBackBy')}: <span className="font-medium text-gray-700">{priceImport.rolledBackBy.name || priceImport.rolledBackBy.email}</span>
          {priceImport.rolledBackAt && ` · ${new Date(priceImport.rolledBackAt).toLocaleString(locale)}`}
        </p>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t('colArticle')}</th>
                <th className="px-4 py-3 font-medium">{t('colProduct')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('colOldPrice')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('colNewPrice')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('colChange')}</th>
                <th className="px-4 py-3 font-medium text-center">{t('colStatus')}</th>
                <th className="px-4 py-3 font-medium">{t('colWarning')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {priceImport.items.map((item) => (
                <tr key={item.id} className={item.isSuspicious ? 'bg-amber-50/40' : undefined}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.articleNumber}</td>
                  <td className="px-4 py-3">
                    {item.product?.nameFr || item.description || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">{money(item.oldSellingPrice)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-primary">{money(item.newSellingPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    {item.changePercent != null ? (
                      <span className={item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.changePercent >= 0 ? '+' : ''}
                        {item.changePercent.toFixed(1)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[item.status] || 'bg-gray-100 text-gray-600'}`}>
                      {itemStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{item.warning || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-brand-primary">{value}</p>
    </div>
  )
}
