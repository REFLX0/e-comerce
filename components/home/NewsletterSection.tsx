'use client'

import { useState } from 'react'
import { newsletterApi } from '@/lib/api/newsletter'
import { toast } from 'sonner'
import { Mail, Send } from 'lucide-react'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      await newsletterApi.subscribe(email)
      toast.success('Merci pour votre inscription à notre newsletter !')
      setEmail('')
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="bg-brand-surface py-16 border-t border-brand-surface-dark">
      <div className="section-padding">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-soft p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center mx-auto md:mx-0 mb-6">
              <Mail size={32} className="text-brand-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-primary mb-3">
              Restez informé de nos offres
            </h2>
            <p className="text-gray-500">
              Abonnez-vous à notre newsletter pour recevoir nos promotions exclusives, nos nouveautés et nos conseils d'entretien auto.
            </p>
          </div>
          
          <div className="w-full md:w-[400px] shrink-0">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email..."
                required
                className="w-full bg-brand-surface border border-brand-surface-dark focus:border-brand-primary/50 rounded-full py-4 pl-6 pr-32 outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !email}
                className="absolute right-2 top-2 bottom-2 bg-brand-primary hover:bg-brand-primary-light text-white rounded-full px-6 font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '...' : (
                  <>
                    <span className="hidden sm:inline">S'abonner</span>
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>
            <p className="text-xs text-center md:text-left text-gray-400 mt-3 px-4">
              En vous inscrivant, vous acceptez notre politique de confidentialité. Vous pouvez vous désabonner à tout moment.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
