'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { authApi } from '@/lib/api/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

const forgotSchema = z.object({
  email: z.string().email('Email invalide'),
})

type ForgotFormData = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true)
    try {
      await authApi.forgotPassword(data.email)
      setIsSuccess(true)
      toast.success('Email de réinitialisation envoyé')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center section-padding py-16 bg-brand-surface">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-card border border-brand-surface-dark">
        <div className="mb-6">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary transition-colors">
            <ArrowLeft size={16} />
            Retour à la connexion
          </Link>
        </div>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h1 className="text-2xl font-display font-bold text-brand-primary mb-4">
              Vérifiez votre boîte mail
            </h1>
            <p className="text-gray-500 mb-8">
              Nous avons envoyé un lien de réinitialisation de mot de passe à votre adresse email.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="text-brand-accent hover:underline font-medium text-sm"
            >
              Je n'ai pas reçu l'email, réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-brand-primary mb-2">
                Mot de passe oublié
              </h1>
              <p className="text-gray-500">
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full p-4 pl-12 rounded-xl border bg-brand-surface focus:bg-white focus:ring-2 focus:outline-none transition-all ${
                      errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
                    }`}
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg mt-2 disabled:opacity-50"
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
