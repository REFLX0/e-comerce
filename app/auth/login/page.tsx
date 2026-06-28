'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { useAuthStore } from '@/lib/store/auth.store'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({ email: data.email, password: data.password })
      toast.success('Connexion réussie')
      router.push('/compte')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Email ou mot de passe incorrect')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center section-padding py-16 bg-brand-surface">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-card border border-brand-surface-dark">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-brand-primary mb-2">
            Bon retour
          </h1>
          <p className="text-gray-500">
            Connectez-vous pour accéder à votre espace
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

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Mot de passe</label>
              <Link href="/auth/mot-de-passe-oublie" className="text-xs text-brand-accent hover:underline font-medium">
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                {...register('password')}
                type="password"
                className={`w-full p-4 pl-12 rounded-xl border bg-brand-surface focus:bg-white focus:ring-2 focus:outline-none transition-all ${
                  errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-brand-primary font-bold hover:text-brand-accent transition-colors">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  )
}
