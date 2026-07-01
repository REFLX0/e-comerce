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

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Sujet trop court'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
  isProfessional: z.boolean().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
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
      // Simulate API call
      await apiPost('/contact', data)
      toast.success('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.')
      reset()
    } catch (error) {
      toast.error('Une erreur est survenue.')
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
            Nous Contacter
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            Une question ? Besoin d&apos;un conseil ? Notre équipe est à votre écoute.
          </p>
        </div>
      </section>

      <div className="section-padding py-12">
        <Breadcrumb items={[{ label: 'Contact' }]} />

        {/* Contact cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Phone,
              title: 'Téléphone',
              info: '+216 92 975 959',
              sub: 'Lun-Ven 8h-18h | Sam 8h-14h',
            },
            { icon: Mail, title: 'Email', info: 'contact@kiosquetn.tn', sub: 'Réponse sous 24h' },
            {
              icon: MapPin,
              title: 'Adresse',
              info: 'Route Manzel Chaker Km 1',
              sub: 'Rue Kerbala, 3072 Sfax',
            },
            {
              icon: Clock,
              title: 'Horaires',
              info: 'Lun-Ven: 8h-18h',
              sub: 'Sam: 8h-14h | Dim: Fermé',
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
              Envoyez-nous un message
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Nom complet
                  </label>
                  <input
                    id="contact-name"
                    {...register('name')}
                    className={`focus:ring-brand-accent w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-transparent'
                    }`}
                    placeholder="Votre nom"
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
                    Email
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
                    placeholder="votre@email.com"
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
                  Téléphone
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
                  placeholder="+216 XX XXX XXX"
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
                  Sujet
                </label>
                <input
                  id="contact-subject"
                  {...register('subject')}
                  className={`focus:ring-brand-accent w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                    errors.subject
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-transparent'
                  }`}
                  placeholder="Objet de votre message"
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
                  Message
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
                  placeholder="Votre message..."
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
                  <span className="text-sm text-gray-700">Je suis un professionnel</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-accent hover:bg-brand-accent/90 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-colors disabled:opacity-50"
              >
                <Send size={18} />
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
