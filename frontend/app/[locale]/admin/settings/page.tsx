"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, CreditCard, Mail, Package, Scale, Settings2, Shield, Truck } from 'lucide-react'

export default function AdminSettingsPage() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'

  const sections = [
    { label: 'Informations generales', desc: 'Nom du site, logo, devise', href: `/${locale}/admin/settings`, icon: Settings2 },
    { label: 'SEO', desc: 'Titres, meta descriptions, sitemap', href: `/${locale}/admin/settings`, icon: BarChart2 },
    { label: 'Email transactionnel', desc: 'Templates de confirmation et livraison', href: `/${locale}/admin/settings`, icon: Mail },
    { label: 'Paiements', desc: 'Modes de paiement acceptes', href: `/${locale}/admin/settings`, icon: CreditCard },
    { label: 'Livraison', desc: 'Zones, tarifs, livraison gratuite', href: `/${locale}/admin/shipping`, icon: Truck },
    { label: 'CGV et legal', desc: 'Conditions et politique de confidentialite', href: `/${locale}/admin/settings`, icon: Scale },
    { label: 'Securite', desc: 'Acces administrateur et sessions', href: `/${locale}/admin/settings`, icon: Shield },
    { label: 'Catalogue', desc: 'Produits, categories et inventaire', href: `/${locale}/admin/catalog/products`, icon: Package },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-brand-primary">Paramètres</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.label} href={s.href} className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm hover:border-brand-accent/30 hover:shadow-md transition-all">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 group-hover:bg-brand-accent/10 transition-colors">
              <s.icon size={18} className="text-gray-400 group-hover:text-brand-accent transition-colors" />
            </div>
            <div>
              <p className="font-semibold text-brand-primary">{s.label}</p>
              <p className="mt-0.5 text-xs text-gray-400">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
