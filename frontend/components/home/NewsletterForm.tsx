"use client"

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { authApi } from '@/lib/api/auth'

export function NewsletterForm() {
  const t = useTranslations('Home')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast.error(t('validEmail'))
      return
    }

    setIsLoading(true)
    
    try {
      await authApi.subscribeNewsletter(email)
      toast.success(t('thankYou'))
      setEmail('')
    } catch (err) {
      toast.error('Erreur lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card border-white/[0.10] bg-white/[0.08] p-4 backdrop-blur md:p-5"
      aria-label="Inscription newsletter"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Adresse email
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletterPlaceholder')}
          autoComplete="email"
          disabled={isLoading}
          className="min-h-12 flex-1 rounded-lg border border-white/[0.18] bg-white/[0.10] px-4 text-brand-surface placeholder:text-brand-surface/50 transition-all duration-200 focus:border-white/40 focus:bg-white/[0.15] focus:ring-2 focus:ring-white/20 disabled:opacity-50"
          aria-label="Adresse email"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="btn-accent shrink-0 disabled:opacity-70 disabled:cursor-wait"
          aria-label="S'inscrire à la newsletter"
        >
          {isLoading ? 'Inscription...' : t('subscribe')}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
      <p className="mt-3 text-xs text-brand-surface/50">
        {t('noSpam')}
      </p>
    </form>
  )
}
