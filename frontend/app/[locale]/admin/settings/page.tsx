"use client";

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, CreditCard, Mail, Package, Scale, Settings2, Shield, Truck, ChevronRight } from 'lucide-react'

const SECTION_PANELS: Record<string, { title: string; desc: string }> = {
  'Informations generales': { title: 'Informations générales', desc: 'Configurez le nom du site, le logo, la devise et les coordonnées.' },
  'SEO': { title: 'SEO', desc: 'Gérez les titres, meta descriptions et le sitemap.' },
  'Email transactionnel': { title: 'Email transactionnel', desc: 'Configurez les templates d\'emails de confirmation et de livraison.' },
  'Paiements': { title: 'Paiements', desc: 'Gérez les modes de paiement acceptés.' },
  'CGV et legal': { title: 'CGV et légal', desc: 'Gérez les conditions générales et la politique de confidentialité.' },
  'Securite': { title: 'Sécurité', desc: 'Gérez les accès administrateur et les sessions.' },
}

export default function AdminSettingsPage() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    { label: 'Informations generales', desc: 'Nom du site, logo, devise', icon: Settings2, href: null },
    { label: 'SEO', desc: 'Titres, meta descriptions, sitemap', icon: BarChart2, href: null },
    { label: 'Email transactionnel', desc: 'Templates de confirmation et livraison', icon: Mail, href: null },
    { label: 'Paiements', desc: 'Modes de paiement acceptes', icon: CreditCard, href: null },
    { label: 'Livraison', desc: 'Zones, tarifs, livraison gratuite', icon: Truck, href: `/${locale}/admin/shipping` },
    { label: 'CGV et legal', desc: 'Conditions et politique de confidentialite', icon: Scale, href: null },
    { label: 'Securite', desc: 'Acces administrateur et sessions', icon: Shield, href: null },
    { label: 'Catalogue', desc: 'Produits, categories et inventaire', icon: Package, href: `/${locale}/admin/catalog/products` },
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
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-brand-primary">{activePanel.title}</h2>
            <p className="text-sm text-gray-500">{activePanel.desc}</p>
          </div>
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-400">Configuration à venir</p>
            <p className="mt-1 text-xs text-gray-300">Cette section sera disponible dans une prochaine mise à jour.</p>
          </div>
        </div>
      )}
    </div>
  )
}
