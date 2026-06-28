'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { useAuthStore } from '@/lib/store/auth.store'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Mail, Lock, User, Phone } from 'lucide-react'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Mot de passe trop court'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      toast.success('Compte créé avec succès !')
      router.push('/compte')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center section-padding py-16 bg-brand-surface">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-card border border-brand-surface-dark">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-brand-primary mb-2">
            Créer un compte
          </h1>
          <p className="text-gray-500">
            Rejoignez BestLub et profitez d'une expérience d'achat simplifiée.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Prénom</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  {...register('firstName')}
                  className={`w-full p-4 pl-12 rounded-xl border bg-brand-surface focus:bg-white focus:ring-2 focus:outline-none transition-all ${
                    errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
                  }`}
                  placeholder="Prénom"
                />
              </div>
              {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nom</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  {...register('lastName')}
                  className={`w-full p-4 pl-12 rounded-xl border bg-brand-surface focus:bg-white focus:ring-2 focus:outline-none transition-all ${
                    errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
                  }`}
                  placeholder="Nom"
                />
              </div>
              {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
            </div>
          </div>

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
            <label className="text-sm font-medium text-gray-700">Téléphone (Optionnel)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input
                {...register('phone')}
                className={`w-full p-4 pl-12 rounded-xl border bg-brand-surface focus:bg-white focus:ring-2 focus:outline-none transition-all ${
                  errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
                }`}
                placeholder="Votre numéro"
              />
            </div>
            {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mot de passe</label>
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirmer</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  className={`w-full p-4 pl-12 rounded-xl border bg-brand-surface focus:bg-white focus:ring-2 focus:outline-none transition-all ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg mt-6 disabled:opacity-50"
          >
            {isLoading ? 'Création...' : 'Créer mon compte'}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-brand-primary font-bold hover:text-brand-accent transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
