"use client";

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { ArrowRight, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/compte'
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (urlError === 'CredentialsSignin') {
      toast.error('Email ou mot de passe incorrect', {
        description: 'Vérifiez vos identifiants et réessayez.',
      })
    } else if (urlError === 'OAuthAccountNotLinked') {
      toast.error('Compte déjà existant', {
        description: 'Connectez-vous avec email/mot de passe puis liez votre compte Google.',
      })
    } else if (urlError) {
      toast.error('Erreur de connexion', {
        description: 'Une erreur inattendue est survenue. Réessayez dans un instant.',
      })
    }
  }, [urlError])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (res?.error) {
        toast.error('Email ou mot de passe incorrect', {
          description: 'Vérifiez vos identifiants et réessayez.',
        })
      } else if (res?.ok) {
        toast.success('Connexion réussie !', {
          description: 'Bienvenue sur votre espace.',
        })
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      toast.error('Erreur inattendue', {
        description: 'Impossible de vous connecter pour l\'instant. Réessayez dans un instant.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="section-padding bg-brand-surface flex min-h-[80vh] items-center justify-center py-16">
      <div className="shadow-card border-brand-surface-dark w-full max-w-md rounded-3xl border bg-white p-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-brand-primary mb-2 text-3xl font-bold">
            Bon retour
          </h1>
          <p className="text-gray-500">Connectez-vous pour accéder à votre espace</p>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl })}
          type="button"
          disabled={isLoading}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-4 font-medium transition-all hover:bg-gray-50 hover:shadow-sm active:scale-[0.99] disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="" aria-hidden="true" className="h-5 w-5" />
          Continuer avec Google
        </button>

        <div className="mb-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">ou avec email</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Mail size={18} />
              </div>
              <input
                id="login-email"
                {...register('email')}
                type="email"
                autoComplete="email"
                className={`bg-brand-surface w-full rounded-xl border p-4 pl-12 transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                  errors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
                }`}
                placeholder="votre@email.com"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500">⚠ {errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <Link href="/auth/mot-de-passe-oublie" className="text-brand-accent text-xs font-medium hover:underline">
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="login-password"
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`bg-brand-surface w-full rounded-xl border p-4 pl-12 pr-12 transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                  errors.password ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">⚠ {errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <><Loader2 size={18} className="animate-spin" /> Connexion en cours...</>
            ) : (
              <>Se connecter <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-brand-primary hover:text-brand-accent font-bold transition-colors">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
