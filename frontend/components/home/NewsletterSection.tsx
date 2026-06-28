'use client'

import { useState } from 'react'
import { newsletterApi } from '@/lib/api/newsletter'
import { toast } from 'sonner'
import { Mail, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const newsletterSchema = z.object({
  email: z.string().email('Email invalide'),
})

type NewsletterFormData = z.infer<typeof newsletterSchema>

export function NewsletterSection() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  })

  const onSubmit = async (data: NewsletterFormData) => {
    setIsLoading(true)
    try {
      await newsletterApi.subscribe(data.email)
      toast.success('Merci pour votre inscription à notre newsletter !')
      reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue.')
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
            <form onSubmit={handleSubmit(onSubmit)} className="relative">
              <input
                type="email"
                {...register('email')}
                placeholder="Votre adresse email..."
                className={`w-full bg-brand-surface border rounded-full py-4 pl-6 pr-32 outline-none transition-colors ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-brand-surface-dark focus:border-brand-primary/50'
                }`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
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
            {errors.email && <p className="text-xs text-red-500 mt-2 px-4 text-center md:text-left">{errors.email.message}</p>}
            <p className="text-xs text-center md:text-left text-gray-400 mt-3 px-4">
              En vous inscrivant, vous acceptez notre politique de confidentialité. Vous pouvez vous désabonner à tout moment.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
