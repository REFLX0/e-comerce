"use client";

import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Button } from '@/components/ui/button'
import { apiPost } from '@/lib/api/client'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations } from 'next-intl'

export default function ContactPage() {
  const t = useTranslations('Contact')

  const contactSchema = z.object({
    name: z.string().min(2, t('errors.nameMin')),
    email: z.string().email(t('errors.emailInvalid')),
    phone: z.string().optional(),
    subject: z.string().min(3, t('errors.subjectMin')),
    message: z.string().min(10, t('errors.messageMin')),
    isProfessional: z.boolean().optional(),
  })

  type ContactFormData = z.infer<typeof contactSchema>
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      await apiPost('/contact', data)
      toast.success(t('success'))
      reset()
    } catch (error) {
      toast.error(t('error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="from-brand-primary to-brand-primary-dark bg-gradient-to-br py-16 text-white md:py-24">
        <div className="section-padding text-center">
          <h1 className="font-display mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <div className="section-padding py-12">
        <Breadcrumb items={[{ label: t('title') }]} />

        {/* Contact cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Phone,
              title: t('phone'),
              info: '+216 92 975 959',
              sub: t('phoneSub'),
            },
            { icon: Mail, title: t('email'), info: 'contact@kiosquetn.tn', sub: t('emailSub') },
            {
              icon: MapPin,
              title: t('address'),
              info: t('address1'),
              sub: t('address2'),
            },
            {
              icon: Clock,
              title: t('hours'),
              info: t('hours1'),
              sub: t('hours2'),
            },
          ].map((c) => (
            <div
              key={c.title}
              className="shadow-soft rounded-2xl border border-gray-100 bg-white p-6 text-center"
            >
              <div className="bg-brand-accent/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <c.icon size={24} className="text-brand-accent" />
              </div>
              <h3 className="font-display text-brand-primary mb-1 font-semibold">{c.title}</h3>
              <p className="text-sm font-medium text-gray-800">{c.info}</p>
              <p className="text-xs text-gray-500">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="mx-auto mt-12 max-w-2xl">
          <div className="shadow-soft rounded-2xl border border-gray-100 bg-white p-8">
            <h2 className="font-display text-brand-primary mb-6 text-2xl font-bold">
              {t('formTitle')}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t('fullName')}
                  </label>
                  <input
                    id="contact-name"
                    {...register('name')}
                    className={`focus:ring-brand-accent w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-transparent'
                    }`}
                    placeholder={t('fullNamePlaceholder')}
                  />
                  {errors.name && (
                    <span className="mt-1 block text-xs text-red-500">{errors.name.message}</span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t('emailLabel')}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    {...register('email')}
                    className={`focus:ring-brand-accent w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                      errors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-transparent'
                    }`}
                    placeholder={t('emailPlaceholder')}
                  />
                  {errors.email && (
                    <span className="mt-1 block text-xs text-red-500">{errors.email.message}</span>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="contact-phone"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t('phoneLabel')}
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  {...register('phone')}
                  className={`focus:ring-brand-accent w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-transparent'
                  }`}
                  placeholder={t('phonePlaceholder')}
                />
                {errors.phone && (
                  <span className="mt-1 block text-xs text-red-500">{errors.phone.message}</span>
                )}
              </div>
              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t('subject')}
                </label>
                <input
                  id="contact-subject"
                  {...register('subject')}
                  className={`focus:ring-brand-accent w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                    errors.subject
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-transparent'
                  }`}
                  placeholder={t('subjectPlaceholder')}
                />
                {errors.subject && (
                  <span className="mt-1 block text-xs text-red-500">{errors.subject.message}</span>
                )}
              </div>
              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t('message')}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  {...register('message')}
                  className={`focus:ring-brand-accent w-full resize-none rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                    errors.message
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-transparent'
                  }`}
                  placeholder={t('messagePlaceholder')}
                />
                {errors.message && (
                  <span className="mt-1 block text-xs text-red-500">{errors.message.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('isProfessional')}
                    className="text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{t('isPro')}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-accent hover:bg-brand-accent/90 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-colors disabled:opacity-50"
              >
                <Send size={18} />
                {isSubmitting ? t('sending') : t('send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
