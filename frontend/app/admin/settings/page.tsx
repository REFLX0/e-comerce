"use client";

import { BarChart2, TrendingUp, ShoppingCart, Users, Package } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-brand-primary">Paramètres</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: 'Informations générales', desc: 'Nom du site, logo, devise', href: '#' },
          { label: 'SEO', desc: 'Titres, méta descriptions, sitemap', href: '#' },
          { label: 'Email transactionnel', desc: 'Templates de confirmation, livraison', href: '#' },
          { label: 'Paiements', desc: 'Modes de paiement acceptés', href: '#' },
          { label: 'Livraison', desc: 'Zones, tarifs, livraison gratuite', href: '#' },
          { label: 'CGV & Légal', desc: 'Conditions, politique de confidentialité', href: '#' },
        ].map((s) => (
          <button key={s.label} className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm hover:border-brand-accent/30 hover:shadow-md transition-all">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 group-hover:bg-brand-accent/10 transition-colors">
              <Package size={18} className="text-gray-400 group-hover:text-brand-accent transition-colors" />
            </div>
            <div>
              <p className="font-semibold text-brand-primary">{s.label}</p>
              <p className="mt-0.5 text-xs text-gray-400">{s.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
