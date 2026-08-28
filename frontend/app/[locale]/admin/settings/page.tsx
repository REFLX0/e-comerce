"use client";

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { settingsApi } from '@/lib/api/admin'
import Link from 'next/link'
import Image from 'next/image'
import { adminApi } from '@/lib/api/admin'
import { BarChart2, CreditCard, Mail, Package, Scale, Settings2, Shield, Truck, ChevronRight, Loader2, Upload, FileText, Stamp, QrCode } from 'lucide-react'

const SECTION_PANELS: Record<string, { titleKey: string; descKey: string }> = {
  'Informations generales': { titleKey: 'infoGeneral', descKey: 'infoGeneralDesc' },
  'Facturation & Facture': { titleKey: 'invoicingTitle', descKey: 'invoicingDesc' },
  'SEO': { titleKey: 'seoTitle', descKey: 'seoDesc' },
  'Email transactionnel': { titleKey: 'emailTransactional', descKey: 'emailTransactionalDesc' },
  'Paiements': { titleKey: 'payments', descKey: 'paymentsDesc' },
  'CGV et legal': { titleKey: 'cgvLegal', descKey: 'cgvLegalDesc' },
  'Securite': { titleKey: 'securityTitle', descKey: 'securityDesc' },
}

export default function AdminSettingsPage() {
  const locale = useLocale()
  const t = useTranslations('Admin')
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Local form state — initialised from DB values
  const [form, setForm] = useState<Record<string, unknown>>({})

  const { data: settings, isLoading } = useQuery<Record<string, unknown>>({
    queryKey: ['admin-settings'],
    queryFn: () => settingsApi.getAll() as Promise<Record<string, unknown>>,
  })

  // Seed form when settings load
  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: (updates: Record<string, unknown>) => settingsApi.batchUpdate(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success(t('settingsSaved'))
    },
    onError: () => toast.error(t('settingsSaveError')),
  })

  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  const sections = [
    { label: 'Informations generales', labelKey: 'infoGeneral', descKey: 'sectDescGeneral', icon: Settings2, href: null },
    { label: 'Facturation & Facture', labelKey: 'invoicingTitle', descKey: 'sectDescInvoicing', icon: FileText, href: null },
    { label: 'SEO', labelKey: 'seoTitle', descKey: 'sectDescSeo', icon: BarChart2, href: null },
    { label: 'Email transactionnel', labelKey: 'emailTransactional', descKey: 'sectDescEmail', icon: Mail, href: null },
    { label: 'Paiements', labelKey: 'payments', descKey: 'sectDescPayments', icon: CreditCard, href: null },
    { label: 'Livraison', labelKey: 'deliveryTitle', descKey: 'sectDescShipping', icon: Truck, href: `/${locale}/admin/shipping` },
    { label: 'CGV et legal', labelKey: 'cgvLegal', descKey: 'sectDescLegal', icon: Scale, href: null },
    { label: 'Securite', labelKey: 'securityTitle', descKey: 'sectDescSecurity', icon: Shield, href: null },
    { label: 'Catalogue', labelKey: 'catalog', descKey: 'sectDescCatalog', icon: Package, href: `/${locale}/admin/catalog/products` },
  ]

  const activePanel = activeSection ? SECTION_PANELS[activeSection] : null

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-brand-primary">{t('settingsTitle')}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => {
          if (s.href) {
            return (
              <Link key={s.label} href={s.href} className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm hover:border-brand-accent/30 hover:shadow-md transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 group-hover:bg-brand-accent/10 transition-colors">
                  <s.icon size={18} className="text-gray-400 group-hover:text-brand-accent transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-brand-primary">{t(s.labelKey)}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{t(s.descKey)}</p>
                </div>
                <ChevronRight size={16} className="mt-1 text-gray-300 group-hover:text-brand-accent transition-colors" />
              </Link>
            )
          }
          return (
            <button key={s.label} onClick={() => setActiveSection(activeSection === s.label ? null : s.label)} className={`group flex items-start gap-4 rounded-2xl border p-5 text-left transition-all ${activeSection === s.label ? 'border-brand-accent bg-brand-accent/5 shadow-md' : 'border-gray-100 bg-white shadow-sm hover:border-brand-accent/30 hover:shadow-md'}`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${activeSection === s.label ? 'bg-brand-accent/20' : 'bg-gray-50 group-hover:bg-brand-accent/10'}`}>
                <s.icon size={18} className={`transition-colors ${activeSection === s.label ? 'text-brand-accent' : 'text-gray-400 group-hover:text-brand-accent'}`} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-brand-primary">{t(s.labelKey)}</p>
                <p className="mt-0.5 text-xs text-gray-400">{t(s.descKey)}</p>
              </div>
            </button>
          )
        })}
      </div>

      {activePanel && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-brand-primary">{t(activePanel.titleKey)}</h2>
            <p className="text-sm text-gray-500">{t(activePanel.descKey)}</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 size={24} className="animate-spin mr-2" /> {t('settingsLoading')}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              {activeSection === 'Informations generales' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{t('siteName')}</label>
                      <input type="text" value={String(form.SITE_NAME ?? '')} onChange={e => set('SITE_NAME', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{t('defaultCurrency')}</label>
                      <select value={String(form.SITE_CURRENCY ?? 'TND')} onChange={e => set('SITE_CURRENCY', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent">
                        <option value="TND">{t('tndLabel')}</option>
                        <option value="EUR">{t('eurLabel')}</option>
                        <option value="USD">{t('usdLabel')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{t('contactEmail')}</label>
                    <input type="email" value={String(form.CONTACT_EMAIL ?? '')} onChange={e => set('CONTACT_EMAIL', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{t('phoneNumber')}</label>
                    <input type="tel" value={String(form.CONTACT_PHONE ?? '')} onChange={e => set('CONTACT_PHONE', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{t('siteLogo')}</label>
                    <div className="flex items-center gap-4">
                      {form.SITE_LOGO ? (
                        <div className="relative h-16 w-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                          <Image src={String(form.SITE_LOGO)} alt="Logo" fill className="object-contain p-2" />
                        </div>
                      ) : (
                        <div className="flex h-16 w-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">{t('noLogo')}</div>
                      )}
                      <label className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        <Upload size={14} className="inline mr-1" />{t('chooseFile')}
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            try {
                              const res = await adminApi.uploadImage(e.target.files[0]);
                              const url = (res as any).url || (res as any).data?.url;
                              if (url) set('SITE_LOGO', url);
                              toast.success(t('logoUploaded'));
                            } catch { toast.error(t('logoUploadError')); }
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'Facturation & Facture' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Logo Facture */}
                    <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                      <label className="text-sm font-semibold text-gray-700">{t('invoiceLogo')}</label>
                      <p className="text-xs text-gray-400">Logo imprimé en haut à gauche de la facture</p>
                      <div className="flex items-center gap-3 pt-2">
                        {form.FACTURE_LOGO ? (
                          <div className="relative h-16 w-32 rounded-lg overflow-hidden border border-gray-200 bg-white">
                            <Image src={String(form.FACTURE_LOGO)} alt="Logo Facture" fill className="object-contain p-1.5" />
                          </div>
                        ) : (
                          <div className="flex h-16 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white text-xs text-gray-400">Logo par défaut</div>
                        )}
                        <label className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                          <Upload size={13} className="inline mr-1" />{t('chooseFile')}
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              try {
                                const res = await adminApi.uploadImage(e.target.files[0]);
                                const url = (res as any).url || (res as any).data?.url;
                                if (url) set('FACTURE_LOGO', url);
                                toast.success(t('logoUploaded'));
                              } catch { toast.error(t('logoUploadError')); }
                            }
                          }} />
                        </label>
                      </div>
                    </div>

                    {/* Cachet Bleu / Taba3 */}
                    <div className="space-y-1.5 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                      <label className="text-sm font-semibold text-blue-950 flex items-center gap-1.5">
                        <Stamp size={16} className="text-blue-600" />
                        {t('invoiceTaba3')}
                      </label>
                      <p className="text-xs text-blue-800/70">{t('invoiceTaba3Desc')}</p>
                      <div className="flex items-center gap-3 pt-2">
                        {form.FACTURE_TABA3 ? (
                          <div className="relative h-16 w-32 rounded-lg overflow-hidden border border-blue-200 bg-white">
                            <Image src={String(form.FACTURE_TABA3)} alt="Taba3" fill className="object-contain p-1" />
                          </div>
                        ) : (
                          <div className="flex h-16 w-32 items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-white text-[11px] text-blue-400 text-center px-1">Aucun cachet</div>
                        )}
                        <label className="cursor-pointer rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors shadow-sm">
                          <Upload size={13} className="inline mr-1" />{t('chooseFile')}
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              try {
                                const res = await adminApi.uploadImage(e.target.files[0]);
                                const url = (res as any).url || (res as any).data?.url;
                                if (url) set('FACTURE_TABA3', url);
                                toast.success(t('taba3Uploaded'));
                              } catch { toast.error(t('logoUploadError')); }
                            }
                          }} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* QR Code / Barcode / Auth Code Upload */}
                  <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <QrCode size={16} className="text-brand-primary" />
                      {t('invoiceCodeImg')}
                    </label>
                    <p className="text-xs text-gray-400">{t('invoiceCodeImgDesc')}</p>
                    <div className="flex items-center gap-3 pt-2">
                      {form.FACTURE_CODE_IMG ? (
                        <div className="relative h-16 w-20 rounded-lg overflow-hidden border border-gray-200 bg-white">
                          <Image src={String(form.FACTURE_CODE_IMG)} alt="Code Facture" fill className="object-contain p-1" />
                        </div>
                      ) : (
                        <div className="flex h-16 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white text-[11px] text-gray-400">Optionnel</div>
                      )}
                      <label className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Upload size={13} className="inline mr-1" />{t('chooseFile')}
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            try {
                              const res = await adminApi.uploadImage(e.target.files[0]);
                              const url = (res as any).url || (res as any).data?.url;
                              if (url) set('FACTURE_CODE_IMG', url);
                              toast.success(t('codeImgUploaded'));
                            } catch { toast.error(t('logoUploadError')); }
                          }
                        }} />
                      </label>
                    </div>
                  </div>

                  {/* Fiscal mentions and legal details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{t('matriculeFiscale')}</label>
                      <input type="text" placeholder="1823940/A/P/000" value={String(form.FACTURE_MATRICULE_FISCALE ?? '1823940/A/P/000')} onChange={e => set('FACTURE_MATRICULE_FISCALE', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{t('registreCommerce')}</label>
                      <input type="text" placeholder="B0123452026" value={String(form.FACTURE_REGISTRE_COMMERCE ?? '')} onChange={e => set('FACTURE_REGISTRE_COMMERCE', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{t('invoiceAddress')}</label>
                      <input type="text" placeholder="Jardins De Carthage 1090, Tunis" value={String(form.FACTURE_ADDRESS ?? 'Jardins De Carthage 1090, Tunis')} onChange={e => set('FACTURE_ADDRESS', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{t('invoicePhone')}</label>
                      <input type="text" placeholder="29294195" value={String(form.FACTURE_PHONE ?? '29294195')} onChange={e => set('FACTURE_PHONE', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{t('invoiceEmail')}</label>
                      <input type="email" placeholder="specpart@hotmail.com" value={String(form.FACTURE_EMAIL ?? 'specpart@hotmail.com')} onChange={e => set('FACTURE_EMAIL', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{t('invoiceTvaRate')}</label>
                      <select value={String(form.FACTURE_TVA_RATE ?? '19')} onChange={e => set('FACTURE_TVA_RATE', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent">
                        <option value="19">19% (TVA Pièces & Lubrifiants)</option>
                        <option value="7">7% (Taux Réduit)</option>
                        <option value="0">0% (Exonéré)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'SEO' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{t('homePageTitle')}</label>
                    <input type="text" value={String(form.SEO_TITLE ?? '')} onChange={e => set('SEO_TITLE', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{t('metaDescription')}</label>
                    <textarea value={String(form.SEO_DESCRIPTION ?? '')} onChange={e => set('SEO_DESCRIPTION', e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent resize-none" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="index" checked={Boolean(form.SEO_INDEX ?? true)} onChange={e => set('SEO_INDEX', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                    <label htmlFor="index" className="text-sm text-gray-700">{t('indexSite')}</label>
                  </div>
                </>
              )}

              {activeSection === 'Email transactionnel' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{t('senderEmail')}</label>
                    <input type="email" value={String(form.EMAIL_SENDER ?? '')} onChange={e => set('EMAIL_SENDER', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="orderEmail" checked={Boolean(form.EMAIL_ORDER_CONFIRMATION ?? true)} onChange={e => set('EMAIL_ORDER_CONFIRMATION', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                    <label htmlFor="orderEmail" className="text-sm text-gray-700">{t('autoOrderConfirm')}</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="shipEmail" checked={Boolean(form.EMAIL_SHIP_CONFIRMATION ?? true)} onChange={e => set('EMAIL_SHIP_CONFIRMATION', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                    <label htmlFor="shipEmail" className="text-sm text-gray-700">{t('emailWhenShipped')}</label>
                  </div>
                </>
              )}

              {activeSection === 'Paiements' && (
                <>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="cod" checked={Boolean(form.PAYMENT_COD_ENABLED ?? true)} onChange={e => set('PAYMENT_COD_ENABLED', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                        <label htmlFor="cod" className="font-semibold text-gray-800">{t('codPayment')}</label>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${form.PAYMENT_COD_ENABLED ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{form.PAYMENT_COD_ENABLED ? t('activeTag') : t('inactiveTag')}</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">{t('codDesc')}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="card" checked={Boolean(form.PAYMENT_CARD_ENABLED ?? false)} onChange={e => set('PAYMENT_CARD_ENABLED', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                        <label htmlFor="card" className="font-semibold text-gray-800">{t('cardPayment')}</label>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${form.PAYMENT_CARD_ENABLED ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{form.PAYMENT_CARD_ENABLED ? t('activeTag') : t('inactiveTag')}</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">{t('cardDesc')}</p>
                  </div>
                </>
              )}

              {activeSection === 'CGV et legal' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{t('cgvLink')}</label>
                    <input type="text" value={String(form.CGV_LINK ?? '')} onChange={e => set('CGV_LINK', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="cgvCheckout" checked={Boolean(form.CGV_REQUIRE_CHECKOUT ?? true)} onChange={e => set('CGV_REQUIRE_CHECKOUT', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                    <label htmlFor="cgvCheckout" className="text-sm text-gray-700">{t('requireCgv')}</label>
                  </div>
                </>
              )}

              {activeSection === 'Securite' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{t('sessionExpiry')}</label>
                    <input type="number" value={Number(form.SECURITY_SESSION_DAYS ?? 30)} onChange={e => set('SECURITY_SESSION_DAYS', Number(e.target.value))} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="2fa" checked={Boolean(form.SECURITY_2FA_ENABLED ?? false)} onChange={e => set('SECURITY_2FA_ENABLED', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                    <label htmlFor="2fa" className="text-sm text-gray-700">{t('enable2fa')}</label>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={saveMutation.isPending} className="flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-black hover:bg-brand-accent-hover transition-colors shadow-sm disabled:opacity-50">
                  {saveMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  {t('saveChanges')}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
