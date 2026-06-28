'use client'

import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-[70vh] flex items-center justify-center section-padding py-16 bg-brand-surface">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-8 md:p-16 text-center shadow-soft border border-brand-surface-dark">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
          <CheckCircle size={48} />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-primary mb-4">
          Commande Validée !
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
          Merci pour votre confiance. Votre commande a été enregistrée avec succès et sera traitée dans les plus brefs délais.
        </p>
        
        <div className="bg-brand-surface rounded-xl p-6 mb-10 max-w-sm mx-auto flex items-center justify-center gap-4">
          <Package className="text-brand-primary" size={24} />
          <div className="text-left">
            <p className="text-sm text-gray-500">Numéro de commande</p>
            <p className="font-bold text-brand-primary text-lg">{orderId || 'En cours de génération'}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/compte/commandes" className="btn-secondary w-full sm:w-auto">
            Suivre ma commande
          </Link>
          <Link href="/catalogue" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
            Continuer mes achats
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
