"use client";

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { ArrowRight, Mail, Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/lib/store/auth.store'
import { FormInput } from '@/components/common/FormInput'

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const t = useTranslations('Auth')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentLocale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const urlError = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || `/${currentLocale}/compte`
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuthStore((state) => state.login)

  useEffect(() => {
    if (urlError === 'CredentialsSignin') {
      toast.error('Échec de connexion', {
        description: 'Email ou mot de passe incorrect.',
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
      await login(data)

      toast.success(t('loginSuccess'), {
        description: 'Bienvenue sur votre espace.',
      })

      const user = useAuthStore.getState().user
      const adminPath = `/${currentLocale}/admin`
      const accountPath = `/${currentLocale}/compte`
      if (
        user?.role?.toUpperCase() === 'ADMIN' &&
        (callbackUrl === '/compte' || callbackUrl === accountPath || callbackUrl.includes('/auth/login'))
      ) {
        window.location.href = adminPath
      } else {
        window.location.href = callbackUrl
      }
    } catch {
      toast.error('Email ou mot de passe incorrect', {
        description: 'Vérifiez vos identifiants et réessayez.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="section-padding bg-brand-surface flex min-h-[80vh] items-center justify-center py-16">
      <div className="shadow-card border-brand-surface-dark w-full max-w-md rounded-3xl border bg-white p-8">
        <div className="mb-2 text-center">
           <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand-primary transition-colors mb-4">
            <ArrowRight size={14} className="rotate-180" /> Retour au site
          </Link>
          <h1 className="font-display text-brand-primary mb-2 text-3xl font-bold">
            {t('welcomeBack')}
          </h1>
          <p className="text-gray-500">{t('loginSubtitle')}</p>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl })}
          type="button"
          disabled={isLoading}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-4 font-medium transition-all hover:bg-gray-50 hover:shadow-sm active:scale-[0.99] disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="" aria-hidden="true" className="h-5 w-5" />
          {t('googleLogin')}
        </button>

        <div className="relative mb-6 flex items-center">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-4 text-xs font-semibold uppercase text-gray-400">Ou</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            id="email"
            type="email"
            label={t('email')}
            placeholder="votre@email.com"
            autoComplete="email"
            icon={<Mail size={18} />}
            error={errors.email?.message}
            {...register('email')}
          />
          
          <FormInput
            id="password"
            type="password"
            label={t('password')}
            placeholder="••••••••"
            autoComplete="current-password"
            icon={<Lock size={18} />}
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex justify-end">
            <Link
              href="/auth/mot-de-passe-oublie"
              className="text-brand-primary hover:text-brand-accent text-sm font-medium transition-colors"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-2 flex w-full justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 size={18} className="animate-spin" /> Connexion en cours...</>
            ) : (
              <>{t('login')} <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-brand-primary hover:text-brand-accent font-bold transition-colors">
            {t('createAccount')}
          </Link>
        </p>
      </div>
    </div>
  )
}
