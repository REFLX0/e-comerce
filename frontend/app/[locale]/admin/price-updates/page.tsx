"use client";

import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { gooeyToast as toast } from 'goey-toast'
import {
  UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle,
  Loader2, History, ChevronRight, ArrowLeft,
} from 'lucide-react'
import { priceImportsApi, type PriceImport, type PriceImportItem } from '@/lib/api/price-imports'

const STAGE_KEYS = ['stageUploading', 'stageExtracting', 'stageMatching', 'stagePreparing'] as const

function useStagedProgress(active: boolean) {
  const [stageIndex, setStageIndex] = useState(0)
  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      setStageIndex((i) => (i < STAGE_KEYS.length - 1 ? i + 1 : i))
    }, 1100)
    return () => clearInterval(interval)
  }, [active])
  return { stageKey: STAGE_KEYS[stageIndex]!, resetStage: () => setStageIndex(0) }
}

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

export default function AdminPriceUpdatesPage() {
  const t = useTranslations('PriceUpdates')
  const locale = useLocale()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [tab, setTab] = useState<'upload' | 'history'>('upload')
  const [preview, setPreview] = useState<PriceImport | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [suspiciousAck, setSuspiciousAck] = useState(false)

  const previewMutation = useMutation({
    mutationFn: (file: File) => priceImportsApi.preview(file),
    onSuccess: (data) => {
      setPreview(data)
      const defaultSelected = new Set(
        data.items.filter((i) => i.status === 'MATCHED' && !i.isSuspicious).map((i) => i.id),
      )
      setSelectedIds(defaultSelected)
      setSuspiciousAck(false)
    },
    onError: (err: any) => {
      toast.error(err?.message || t('genericParseError'))
    },
  })

  const applyMutation = useMutation({
    mutationFn: () => priceImportsApi.apply(preview!.id, [...selectedIds]),
    onSuccess: (data) => {
      toast.success(t('applySuccess', { count: data.updatedCount }))
      setPreview(data)
      queryClient.invalidateQueries({ queryKey: ['admin-price-imports'] })
    },
    onError: (err: any) => {
      toast.error(err?.message || t('applyError'))
    },
  })

  const { stageKey, resetStage } = useStagedProgress(previewMutation.isPending)

  const ACCEPTED_EXTENSIONS = /\.(pdf|csv|xlsx?)$/i
  const ACCEPTED_MIMETYPES = new Set([
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ])

  const handleFile = (file: File | null | undefined) => {
    if (!file) return
    if (!ACCEPTED_MIMETYPES.has(file.type) && !ACCEPTED_EXTENSIONS.test(file.name)) {
      toast.error(t('genericParseError'))
      return
    }
    resetStage()
    previewMutation.mutate(file)
  }

  const matchedItems = useMemo(() => preview?.items.filter((i) => i.status === 'MATCHED') ?? [], [preview])
  const notFoundItems = useMemo(() => preview?.items.filter((i) => i.status === 'NOT_FOUND') ?? [], [preview])
  const duplicateItems = useMemo(() => preview?.items.filter((i) => i.status === 'DUPLICATE') ?? [], [preview])
  const invalidItems = useMemo(
    () => preview?.items.filter((i) => i.status === 'INVALID_PRICE' || i.status === 'AMBIGUOUS') ?? [],
    [preview],
  )

  const selectedSuspiciousCount = matchedItems.filter((i) => i.isSuspicious && selectedIds.has(i.id)).length
  const canApply =
    preview?.status === 'PREVIEW' &&
    selectedIds.size > 0 &&
    (selectedSuspiciousCount === 0 || suspiciousAck) &&
    !applyMutation.isPending

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllMatched = () => {
    setSelectedIds((prev) => {
      const allSelected = matchedItems.every((i) => prev.has(i.id))
      if (allSelected) return new Set()
      return new Set(matchedItems.map((i) => i.id))
    })
  }

  const reset = () => {
    setPreview(null)
    setSelectedIds(new Set())
    setSuspiciousAck(false)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">{t('title')}</h1>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('upload')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'upload' ? 'border-brand-accent text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <UploadCloud size={16} /> {t('newImportTab')}
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'history' ? 'border-brand-accent text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <History size={16} /> {t('historyTab')}
        </button>
      </div>

      {tab === 'upload' && (
        <div className="space-y-5">
          {!preview && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                handleFile(e.dataTransfer.files?.[0])
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.csv,.xlsx,.xls,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {previewMutation.isPending ? (
                <>
                  <Loader2 size={36} className="animate-spin text-brand-accent" />
                  <p className="font-semibold text-brand-primary">{t(stageKey)}</p>
                </>
              ) : (
                <>
                  <UploadCloud size={36} className="text-gray-300" />
                  <p className="font-semibold text-brand-primary">{t('dropzoneTitle')}</p>
                  <p className="text-sm text-gray-400">{t('dropzoneHint')}</p>
                  <span className="mt-2 rounded-xl bg-brand-accent px-5 py-2 text-sm font-bold text-black hover:bg-brand-accent-hover transition-colors">
                    {t('chooseFile')}
                  </span>
                </>
              )}
            </div>
          )}

          {preview && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText size={16} />
                  <span className="font-medium text-gray-700">{preview.filename}</span>
                  {preview.supplier && <span className="text-gray-400">· {preview.supplier}</span>}
                </div>
                <button onClick={reset} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-primary">
                  <ArrowLeft size={14} /> {t('backToUpload')}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryCard label={t('summaryDetected')} value={preview.detectedCount} />
                <SummaryCard label={t('summaryMatched')} value={preview.matchedCount} tone="green" />
                <SummaryCard label={t('summaryUnmatched')} value={preview.unmatchedCount} tone="gray" />
                <SummaryCard label={t('summaryDuplicate')} value={preview.duplicateCount} tone="amber" />
              </div>

              {preview.status !== 'PREVIEW' && (
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  <CheckCircle2 size={16} />
                  {t('applySuccess', { count: preview.updatedCount })}
                  <Link href={`/${locale}/admin/price-updates/${preview.id}`} className="ml-auto font-semibold underline">
                    {t('viewInHistory')}
                  </Link>
                </div>
              )}

              {matchedItems.length > 0 && (
                <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-gray-100 p-4">
                    <h2 className="text-sm font-bold text-brand-primary">{t('sectionMatched')}</h2>
                    {preview.status === 'PREVIEW' && (
                      <button onClick={toggleAllMatched} className="text-xs font-semibold text-brand-accent-hover hover:underline">
                        {t('selectAllMatched')}
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                          {preview.status === 'PREVIEW' && <th className="px-4 py-3" />}
                          <th className="px-4 py-3 font-medium">{t('colArticle')}</th>
                          <th className="px-4 py-3 font-medium">{t('colProduct')}</th>
                          <th className="px-4 py-3 font-medium text-right">{t('colOldPrice')}</th>
                          <th className="px-4 py-3 font-medium text-right">{t('colNewPrice')}</th>
                          <th className="px-4 py-3 font-medium text-right">{t('colChange')}</th>
                          <th className="px-4 py-3 font-medium">{t('colWarning')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {matchedItems.map((item) => (
                          <MatchedRow
                            key={item.id}
                            item={item}
                            editable={preview.status === 'PREVIEW'}
                            selected={selectedIds.has(item.id)}
                            onToggle={() => toggleItem(item.id)}
                            suspiciousBadgeLabel={t('suspiciousBadge')}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {duplicateItems.length > 0 && (
                <IssueSection title={t('sectionDuplicate')} items={duplicateItems} icon={<AlertTriangle size={15} className="text-amber-500" />} t={t} />
              )}
              {invalidItems.length > 0 && (
                <IssueSection title={t('sectionInvalid')} items={invalidItems} icon={<AlertTriangle size={15} className="text-red-500" />} t={t} />
              )}
              {notFoundItems.length > 0 && (
                <IssueSection title={t('sectionNotFound')} items={notFoundItems} icon={<XCircle size={15} className="text-gray-400" />} t={t} />
              )}

              {preview.status === 'PREVIEW' && (
                <div className="sticky bottom-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg space-y-3">
                  {selectedSuspiciousCount > 0 && (
                    <label className="flex items-start gap-2 text-sm text-amber-700">
                      <input
                        type="checkbox"
                        checked={suspiciousAck}
                        onChange={(e) => setSuspiciousAck(e.target.checked)}
                        className="mt-0.5"
                      />
                      {t('suspiciousAck')}
                    </label>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{t('itemsSelectedCount', { count: selectedIds.size })}</span>
                    <button
                      disabled={!canApply}
                      onClick={() => applyMutation.mutate()}
                      className="flex items-center gap-2 rounded-xl bg-brand-accent px-6 py-2.5 text-sm font-bold text-black hover:bg-brand-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {applyMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                      {applyMutation.isPending ? t('applyingButton') : t('applyButton')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && <HistoryList t={t} locale={locale} />}
    </div>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone?: 'green' | 'amber' | 'gray' }) {
  const toneClass =
    tone === 'green' ? 'text-green-600' : tone === 'amber' ? 'text-amber-600' : tone === 'gray' ? 'text-gray-500' : 'text-brand-primary'
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase text-gray-400">{label}</p>
      <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  )
}

function MatchedRow({
  item, editable, selected, onToggle, suspiciousBadgeLabel,
}: {
  item: PriceImportItem
  editable: boolean
  selected: boolean
  onToggle: () => void
  suspiciousBadgeLabel: string
}) {
  return (
    <tr className={item.isSuspicious ? 'bg-amber-50/50' : undefined}>
      {editable && (
        <td className="px-4 py-3">
          <input type="checkbox" checked={selected} onChange={onToggle} />
        </td>
      )}
      <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.articleNumber}</td>
      <td className="px-4 py-3 text-gray-800">
        {item.product?.nameFr || '—'}
        <div className="text-xs text-gray-400">{item.description}</div>
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
      <td className="px-4 py-3">
        {item.isSuspicious && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            <AlertTriangle size={11} /> {suspiciousBadgeLabel}
          </span>
        )}
        {item.warning && <p className="mt-0.5 text-xs text-amber-700">{item.warning}</p>}
      </td>
    </tr>
  )
}

function IssueSection({
  title, items, icon, t,
}: {
  title: string
  items: PriceImportItem[]
  icon: React.ReactNode
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-100 p-4">
        {icon}
        <h2 className="text-sm font-bold text-brand-primary">{title}</h2>
        <span className="ml-auto text-xs text-gray-400">{items.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">{t('colArticle')}</th>
              <th className="px-4 py-2.5 font-medium">{t('colProduct')}</th>
              <th className="px-4 py-2.5 font-medium">{t('colWarning')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2.5 font-mono text-xs">{item.articleNumber}</td>
                <td className="px-4 py-2.5">{item.description || '—'}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{item.warning || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function HistoryList({ t, locale }: { t: ReturnType<typeof useTranslations>; locale: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-price-imports'],
    queryFn: () => priceImportsApi.getHistory(1, 50),
  })

  if (isLoading) {
    return <p className="py-12 text-center text-gray-400">{t('loadingHistory')}</p>
  }

  const imports = data?.data ?? []

  if (imports.length === 0) {
    return <p className="py-12 text-center text-gray-400">{t('noImports')}</p>
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">{t('historyDate')}</th>
              <th className="px-6 py-4 font-medium">{t('historyFilename')}</th>
              <th className="px-6 py-4 font-medium">{t('historySupplier')}</th>
              <th className="px-6 py-4 font-medium">{t('historyUploadedBy')}</th>
              <th className="px-6 py-4 font-medium text-center">{t('historyStatus')}</th>
              <th className="px-6 py-4 font-medium text-right">{t('historyMatched')}</th>
              <th className="px-6 py-4 font-medium text-right">{t('historyUpdated')}</th>
              <th className="px-6 py-4 font-medium text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {imports.map((imp) => (
              <tr key={imp.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-gray-500">{new Date(imp.createdAt).toLocaleString(locale)}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{imp.filename}</td>
                <td className="px-6 py-4">{imp.supplier || '—'}</td>
                <td className="px-6 py-4">{imp.uploadedBy?.name || imp.uploadedBy?.email || '—'}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[imp.status] || 'bg-gray-100 text-gray-600'}`}>
                    {imp.status === 'PREVIEW' ? t('statusPreview') : imp.status === 'APPLIED' ? t('statusApplied') : t('statusRolledBack')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">{imp.matchedCount}</td>
                <td className="px-6 py-4 text-right font-semibold">{imp.updatedCount}</td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/${locale}/admin/price-updates/${imp.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-accent-hover hover:underline"
                  >
                    {t('viewDetail')} <ChevronRight size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
