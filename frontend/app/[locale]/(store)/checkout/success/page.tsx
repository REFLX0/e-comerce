"use client";

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
    <div className="section-padding bg-brand-surface flex min-h-[70vh] items-center justify-center py-16">
      <div className="shadow-soft border-brand-surface-dark w-full max-w-2xl rounded-3xl border bg-white p-8 text-center md:p-16">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-500">
          <CheckCircle size={48} />
        </div>

        <h1 className="font-display text-brand-primary mb-4 text-3xl font-bold md:text-4xl">
          Commande Validée !
        </h1>

        <p className="mx-auto mb-8 max-w-lg text-lg text-gray-600">
          Merci pour votre confiance. Votre commande a été enregistrée avec succès et sera traitée
          dans les plus brefs délais.
        </p>

        <div className="bg-brand-surface mx-auto mb-10 flex max-w-sm items-center justify-center gap-4 rounded-xl p-6">
          <Package className="text-brand-primary" size={24} />
          <div className="text-left">
            <p className="text-sm text-gray-500">Numéro de commande</p>
            <p className="text-brand-primary text-lg font-bold">
              {orderId || 'En cours de génération'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/compte/commandes" className="btn-secondary w-full sm:w-auto">
            Suivre ma commande
          </Link>
          <Link
            href="/catalogue"
            className="btn-primary flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            Continuer mes achats
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
