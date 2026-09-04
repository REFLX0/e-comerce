"use client";

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { authApi } from '@/lib/api/auth'
import { useParams } from 'next/navigation'
import { gooeyToast as toast } from 'goey-toast'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react'

type ResetFormData = z.infer<ReturnType<typeof buildResetSchema>>

function buildResetSchema(t: (k: string) => string) {
  return z.object({
    password: z.string().min(8, t('passwordMin8')),
    confirmPassword: z.string(),
  }).refine(d => d.password === d.confirmPassword, { message: t('passwordMismatch'), path: ['confirmPassword'] })
}

export default function ResetPasswordClient() {
  const t = useTranslations('Auth')
  const params = useParams()
  const token = params.token as string
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(buildResetSchema(t)),
  })

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true)
    try {
      await authApi.resetPassword(token, data.password)
      setIsSuccess(true)
      toast.success(t('resetSuccess'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('invalidResetLink'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="section-padding bg-brand-surface flex min-h-[80vh] items-center justify-center py-16">
        <div className="shadow-card border-brand-surface-dark w-full max-w-md rounded-3xl border bg-white p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <ShieldCheck size={32} />
          </div>
          <h1 className="font-display text-brand-primary mb-4 text-2xl font-bold">{t('resetPasswordTitle')}</h1>
          <p className="text-gray-500 mb-8">{t('resetPasswordDone')}</p>
          <Link href="/auth/login" className="btn-primary inline-block w-full py-4 text-center text-lg font-semibold rounded-xl bg-brand-primary text-white hover:bg-brand-primary-light transition-colors">{t('signInLink')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="section-padding bg-brand-surface flex min-h-[80vh] items-center justify-center py-16">
      <div className="shadow-card border-brand-surface-dark w-full max-w-md rounded-3xl border bg-white p-8">
        <div className="mb-6">
          <Link href="/auth/login" className="hover:text-brand-primary inline-flex items-center gap-2 text-sm text-gray-500 transition-colors">
            <ArrowLeft size={16} /> {t('backToLogin')}
          </Link>
        </div>
        <div className="mb-8 text-center">
          <h1 className="font-display text-brand-primary mb-2 text-3xl font-bold">{t('newPassword')}</h1>
          <p className="text-gray-500">{t('chooseNewPassword')}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('password')}</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><Lock size={18} /></div>
              <input {...register('password')} type="password" className={`bg-brand-surface w-full rounded-xl border p-4 pl-12 transition-all focus:bg-white focus:ring-2 focus:outline-none ${errors.password ? 'border-red-500 focus:ring-red-200' : 'focus:border-brand-primary focus:ring-brand-primary/20 border-gray-200'}`} placeholder="••••••••" />
            </div>
            {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('confirmPassword')}</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><Lock size={18} /></div>
              <input {...register('confirmPassword')} type="password" className={`bg-brand-surface w-full rounded-xl border p-4 pl-12 transition-all focus:bg-white focus:ring-2 focus:outline-none ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'focus:border-brand-primary focus:ring-brand-primary/20 border-gray-200'}`} placeholder="••••••••" />
            </div>
            {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-lg font-semibold rounded-xl bg-brand-primary text-white hover:bg-brand-primary-light transition-colors disabled:opacity-50">
            {isLoading ? t('resetting') : t('resetPasswordBtn')}
          </button>
        </form>
      </div>
    </div>
  )
}