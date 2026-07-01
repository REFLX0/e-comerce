"use client";

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
    <div className="section-padding bg-brand-surface flex min-h-[80vh] items-center justify-center py-16">
      <div className="shadow-card border-brand-surface-dark w-full max-w-md rounded-3xl border bg-white p-8">
        <div className="mb-6">
          <Link
            href="/auth/login"
            className="hover:text-brand-primary inline-flex items-center gap-2 text-sm text-gray-500 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour à la connexion
          </Link>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle size={32} />
            </div>
            <h1 className="font-display text-brand-primary mb-4 text-2xl font-bold">
              Vérifiez votre boîte mail
            </h1>
            <p className="mb-8 text-gray-500">
              Nous avons envoyé un lien de réinitialisation de mot de passe à votre adresse email.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="text-brand-accent text-sm font-medium hover:underline"
            >
              Je n'ai pas reçu l'email, réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="font-display text-brand-primary mb-2 text-3xl font-bold">
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
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className={`bg-brand-surface w-full rounded-xl border p-4 pl-12 transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-200'
                        : 'focus:border-brand-primary focus:ring-brand-primary/20 border-gray-200'
                    }`}
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && (
                  <span className="text-xs text-red-500">{errors.email.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-4 text-lg disabled:opacity-50"
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
