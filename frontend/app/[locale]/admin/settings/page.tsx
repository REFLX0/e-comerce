"use client";

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { settingsApi } from '@/lib/api/admin'
import Link from 'next/link'
import { BarChart2, CreditCard, Mail, Package, Scale, Settings2, Shield, Truck, ChevronRight, Loader2 } from 'lucide-react'

const SECTION_PANELS: Record<string, { title: string; desc: string }> = {
  'Informations generales': { title: 'Informations générales', desc: 'Configurez le nom du site, la devise et les coordonnées.' },
  'SEO': { title: 'SEO', desc: 'Gérez les titres, meta descriptions et le sitemap.' },
  'Email transactionnel': { title: 'Email transactionnel', desc: 'Configurez les templates d\'emails de confirmation et de livraison.' },
  'Paiements': { title: 'Paiements', desc: 'Gérez les modes de paiement acceptés.' },
  'CGV et legal': { title: 'CGV et légal', desc: 'Gérez les conditions générales et la politique de confidentialité.' },
  'Securite': { title: 'Sécurité', desc: 'Gérez les accès administrateur et les sessions.' },
}

export default function AdminSettingsPage() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
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
      toast.success('Paramètres enregistrés avec succès')
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  })

  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  const sections = [
    { label: 'Informations generales', desc: 'Nom du site, logo, devise', icon: Settings2, href: null },
    { label: 'SEO', desc: 'Titres, meta descriptions, sitemap', icon: BarChart2, href: null },
    { label: 'Email transactionnel', desc: 'Templates de confirmation et livraison', icon: Mail, href: null },
    { label: 'Paiements', desc: 'Modes de paiement acceptés', icon: CreditCard, href: null },
    { label: 'Livraison', desc: 'Zones, tarifs, livraison gratuite', icon: Truck, href: `/${locale}/admin/shipping` },
    { label: 'CGV et legal', desc: 'Conditions et politique de confidentialité', icon: Scale, href: null },
    { label: 'Securite', desc: 'Accès administrateur et sessions', icon: Shield, href: null },
    { label: 'Catalogue', desc: 'Produits, catégories et inventaire', icon: Package, href: `/${locale}/admin/catalog/products` },
  ]

  const activePanel = activeSection ? SECTION_PANELS[activeSection] : null

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-brand-primary">Paramètres</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => {
          if (s.href) {
            return (
              <Link key={s.label} href={s.href} className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm hover:border-brand-accent/30 hover:shadow-md transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 group-hover:bg-brand-accent/10 transition-colors">
                  <s.icon size={18} className="text-gray-400 group-hover:text-brand-accent transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-brand-primary">{s.label}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{s.desc}</p>
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
                <p className="font-semibold text-brand-primary">{s.label}</p>
                <p className="mt-0.5 text-xs text-gray-400">{s.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      {activePanel && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-brand-primary">{activePanel.title}</h2>
            <p className="text-sm text-gray-500">{activePanel.desc}</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 size={24} className="animate-spin mr-2" /> Chargement des paramètres...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              {activeSection === 'Informations generales' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Nom du site</label>
                      <input type="text" value={String(form.SITE_NAME ?? '')} onChange={e => set('SITE_NAME', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Devise par défaut</label>
                      <select value={String(form.SITE_CURRENCY ?? 'TND')} onChange={e => set('SITE_CURRENCY', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent">
                        <option value="TND">TND (Dinar Tunisien)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Email de contact</label>
                    <input type="email" value={String(form.CONTACT_EMAIL ?? '')} onChange={e => set('CONTACT_EMAIL', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Numéro de téléphone</label>
                    <input type="tel" value={String(form.CONTACT_PHONE ?? '')} onChange={e => set('CONTACT_PHONE', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                  </div>
                </>
              )}

              {activeSection === 'SEO' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Titre de la page d'accueil</label>
                    <input type="text" value={String(form.SEO_TITLE ?? '')} onChange={e => set('SEO_TITLE', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Meta Description</label>
                    <textarea value={String(form.SEO_DESCRIPTION ?? '')} onChange={e => set('SEO_DESCRIPTION', e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent resize-none" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="index" checked={Boolean(form.SEO_INDEX ?? true)} onChange={e => set('SEO_INDEX', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                    <label htmlFor="index" className="text-sm text-gray-700">Indexer le site sur les moteurs de recherche (Google, Bing)</label>
                  </div>
                </>
              )}

              {activeSection === 'Email transactionnel' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Email d'expédition (Sender)</label>
                    <input type="email" value={String(form.EMAIL_SENDER ?? '')} onChange={e => set('EMAIL_SENDER', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="orderEmail" checked={Boolean(form.EMAIL_ORDER_CONFIRMATION ?? true)} onChange={e => set('EMAIL_ORDER_CONFIRMATION', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                    <label htmlFor="orderEmail" className="text-sm text-gray-700">Envoyer un email de confirmation de commande automatique</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="shipEmail" checked={Boolean(form.EMAIL_SHIP_CONFIRMATION ?? true)} onChange={e => set('EMAIL_SHIP_CONFIRMATION', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                    <label htmlFor="shipEmail" className="text-sm text-gray-700">Envoyer un email lorsque la commande est expédiée</label>
                  </div>
                </>
              )}

              {activeSection === 'Paiements' && (
                <>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="cod" checked={Boolean(form.PAYMENT_COD_ENABLED ?? true)} onChange={e => set('PAYMENT_COD_ENABLED', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                        <label htmlFor="cod" className="font-semibold text-gray-800">Paiement à la livraison (COD)</label>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${form.PAYMENT_COD_ENABLED ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{form.PAYMENT_COD_ENABLED ? 'Actif' : 'Inactif'}</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">Permet aux clients de payer en espèces lors de la réception du colis.</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="card" checked={Boolean(form.PAYMENT_CARD_ENABLED ?? false)} onChange={e => set('PAYMENT_CARD_ENABLED', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                        <label htmlFor="card" className="font-semibold text-gray-800">Carte Bancaire (Flouci / CMI)</label>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${form.PAYMENT_CARD_ENABLED ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{form.PAYMENT_CARD_ENABLED ? 'Actif' : 'Inactif'}</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">Acceptez les paiements par carte bancaire nationale et internationale.</p>
                  </div>
                </>
              )}

              {activeSection === 'CGV et legal' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Lien vers les CGV</label>
                    <input type="text" value={String(form.CGV_LINK ?? '')} onChange={e => set('CGV_LINK', e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="cgvCheckout" checked={Boolean(form.CGV_REQUIRE_CHECKOUT ?? true)} onChange={e => set('CGV_REQUIRE_CHECKOUT', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                    <label htmlFor="cgvCheckout" className="text-sm text-gray-700">Exiger l'acceptation des CGV lors du paiement</label>
                  </div>
                </>
              )}

              {activeSection === 'Securite' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Expiration de session (jours)</label>
                    <input type="number" value={Number(form.SECURITY_SESSION_DAYS ?? 30)} onChange={e => set('SECURITY_SESSION_DAYS', Number(e.target.value))} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-accent" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="2fa" checked={Boolean(form.SECURITY_2FA_ENABLED ?? false)} onChange={e => set('SECURITY_2FA_ENABLED', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
                    <label htmlFor="2fa" className="text-sm text-gray-700">Activer l'authentification à double facteur (2FA) pour les administrateurs</label>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={saveMutation.isPending} className="flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-black hover:bg-brand-accent-hover transition-colors shadow-sm disabled:opacity-50">
                  {saveMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
