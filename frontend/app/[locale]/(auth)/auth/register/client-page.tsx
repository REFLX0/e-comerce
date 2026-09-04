"use client";

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { useAuthStore } from '@/lib/store/auth.store'
import { gooeyToast as toast } from 'goey-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react'

type RegisterFormData = z.infer<ReturnType<typeof buildRegisterSchema>>

function buildRegisterSchema(t: (k: string) => string) {
  return z
    .object({
      firstName: z.string().min(2, t('firstNameMin')),
      lastName: z.string().min(2, t('lastNameMin')),
      email: z.string().email(t('emailInvalid')),
      phone: z.string().optional(),
      password: z.string()
        .min(8, t('passwordMinMsg'))
        .regex(/[A-Z]/, t('passwordUpperMsg'))
        .regex(/[0-9]/, t('passwordDigitMsg')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordMismatch'),
      path: ['confirmPassword'],
    })
}

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null
  return (
    <p role="alert" className="flex items-center gap-1 text-xs text-red-500">
      <span aria-hidden="true">⚠</span> {message}
    </p>
  )
}

function PasswordStrength({ value, t }: { value: string; t: (k: string) => string }) {
  const rules = [
    { label: t('passwordMin'), test: (v: string) => v.length >= 8 },
    { label: t('passwordUpper'), test: (v: string) => /[A-Z]/.test(v) },
    { label: t('passwordDigit'), test: (v: string) => /[0-9]/.test(v) },
  ]
  if (!value) return null
  return (
    <ul className="mt-2 space-y-1" aria-label={t('passwordCriteriaAria')}>
      {rules.map((rule) => {
        const passed = rule.test(value)
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              passed ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            {passed ? (
              <CheckCircle2 size={12} aria-hidden="true" />
            ) : (
              <XCircle size={12} aria-hidden="true" />
            )}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

export default function RegisterPage() {
  const t = useTranslations('Auth')
  const router = useRouter()
  const registerUser = useAuthStore((s) => s.register)
  const isLoading = useAuthStore((s) => s.isLoading)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(buildRegisterSchema(t)),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        ...(data.phone ? { phone: data.phone } : {}),
      })
      toast.success(t('accountCreated'), {
        description: t('accountCreatedDesc'),
      })
      router.push('/compte')
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined
      if (message?.toLowerCase().includes('email')) {
        toast.error(t('emailAlreadyUsed'), {
          description: t('emailAlreadyUsedDesc'),
        })
      } else {
        toast.error(t('registerError'), {
          description: message || t('tryAgainLater'),
        })
      }
    }
  }

  const inputClass = (hasError: boolean) =>
    `bg-brand-surface w-full rounded-xl border p-4 pl-12 transition-all focus:bg-white focus:ring-2 focus:outline-none ${
      hasError
        ? 'border-red-400 focus:ring-red-200'
        : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
    }`

  return (
    <div className="section-padding bg-brand-surface flex min-h-screen items-center justify-center py-16">
      <div className="shadow-card border-brand-surface-dark w-full max-w-xl rounded-3xl border bg-white p-8 md:p-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-brand-primary mb-2 text-3xl font-bold">
            {t('createAccountTitle')}
          </h1>
          <p className="text-gray-500">
            {t('createAccountSubtitle')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
          aria-label={t('registerFormAria')}
        >
          {/* Name row */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* First name */}
            <div className="space-y-1.5">
              <label htmlFor="reg-firstName" className="text-sm font-medium text-gray-700">
                {t('firstName')} <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <User size={18} aria-hidden="true" />
                </div>
                <input
                  id="reg-firstName"
                  {...register('firstName')}
                  autoComplete="given-name"
                  autoFocus
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  className={inputClass(!!errors.firstName)}
                  placeholder={t('firstName')}
                />
              </div>
              <FieldError message={errors.firstName?.message ?? undefined} />
            </div>

            {/* Last name */}
            <div className="space-y-1.5">
              <label htmlFor="reg-lastName" className="text-sm font-medium text-gray-700">
                {t('lastName')} <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <User size={18} aria-hidden="true" />
                </div>
                <input
                  id="reg-lastName"
                  {...register('lastName')}
                  autoComplete="family-name"
                  aria-invalid={!!errors.lastName}
                  className={inputClass(!!errors.lastName)}
                  placeholder={t('lastName')}
                />
              </div>
              <FieldError message={errors.lastName?.message ?? undefined} />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-sm font-medium text-gray-700">
              {t('email')} <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Mail size={18} aria-hidden="true" />
              </div>
              <input
                id="reg-email"
                {...register('email')}
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                className={inputClass(!!errors.email)}
                placeholder="votre@email.com"
              />
            </div>
            <FieldError message={errors.email?.message ?? undefined} />
          </div>

          {/* Phone (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="reg-phone" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              {t('phone')}
              <span className="text-xs font-normal text-gray-400">({t('optional')})</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Phone size={18} aria-hidden="true" />
              </div>
              <input
                id="reg-phone"
                {...register('phone')}
                type="tel"
                autoComplete="tel"
                className={inputClass(!!errors.phone)}
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <FieldError message={errors.phone?.message ?? undefined} />
          </div>

          {/* Password row */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-sm font-medium text-gray-700">
                {t('password')} <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <Lock size={18} aria-hidden="true" />
                </div>
                <input
                  id="reg-password"
                  {...register('password', {
                    onChange: (e) => setPasswordValue(e.target.value),
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  className={`${inputClass(!!errors.password)} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldError message={errors.password?.message ?? undefined} />
              <PasswordStrength value={passwordValue} t={t} />
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-confirmPassword" className="text-sm font-medium text-gray-700">
                {t('confirm')} <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <Lock size={18} aria-hidden="true" />
                </div>
                <input
                  id="reg-confirmPassword"
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  className={`${inputClass(!!errors.confirmPassword)} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirm ? t('hideConfirm') : t('showConfirm')}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldError message={errors.confirmPassword?.message ?? undefined} />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                {t('creating')}
              </>
            ) : (
              <>
                {t('createMyAccount')}
                <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
          {t('alreadyHaveAccount')}{' '}
          <Link
            href="/auth/login"
            className="text-brand-primary hover:text-brand-primary/70 font-bold transition-colors"
          >
            {t('signInLink')}
          </Link>
        </div>
      </div>
    </div>
  )
}