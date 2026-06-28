'use client'

import { Breadcrumb } from '@/components/common/Breadcrumb'
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
      await new Promise((resolve) => setTimeout(resolve, 1000))
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
      <section className="bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white py-16 md:py-24">
        <div className="section-padding text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-4">
            Nous Contacter
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Une question ? Besoin d&apos;un conseil ? Notre équipe est à votre écoute.
          </p>
        </div>
      </section>

      <div className="section-padding py-12">
        <Breadcrumb items={[{ label: 'Contact' }]} />

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {[
            { icon: Phone, title: 'Téléphone', info: '+216 71 123 456', sub: 'Lun-Sam 8h-18h' },
            { icon: Mail, title: 'Email', info: 'contact@bestlub.tn', sub: 'Réponse sous 24h' },
            { icon: MapPin, title: 'Adresse', info: 'Zone Industrielle, Megrine', sub: 'Ben Arous, Tunisie' },
            { icon: Clock, title: 'Horaires', info: 'Lun - Sam: 8h - 18h', sub: 'Dimanche: Fermé' },
          ].map((c) => (
            <div key={c.title} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mx-auto mb-4">
                <c.icon size={24} className="text-brand-accent" />
              </div>
              <h3 className="font-display font-semibold text-brand-primary mb-1">{c.title}</h3>
              <p className="text-sm font-medium text-gray-800">{c.info}</p>
              <p className="text-xs text-gray-500">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100">
            <h2 className="font-display font-bold text-2xl text-brand-primary mb-6">Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input 
                    id="contact-name" 
                    {...register('name')}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-accent outline-none transition-all ${
                      errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                    }`} 
                    placeholder="Votre nom" 
                  />
                  {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    id="contact-email" 
                    type="email" 
                    {...register('email')}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-accent outline-none transition-all ${
                      errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                    }`} 
                    placeholder="votre@email.com" 
                  />
                  {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
                </div>
              </div>
              <div>
                <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input 
                  id="contact-phone" 
                  type="tel" 
                  {...register('phone')}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-accent outline-none transition-all ${
                    errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                  }`} 
                  placeholder="+216 XX XXX XXX" 
                />
                {errors.phone && <span className="text-xs text-red-500 mt-1 block">{errors.phone.message}</span>}
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <input 
                  id="contact-subject" 
                  {...register('subject')}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-accent outline-none transition-all ${
                    errors.subject ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                  }`} 
                  placeholder="Objet de votre message" 
                />
                {errors.subject && <span className="text-xs text-red-500 mt-1 block">{errors.subject.message}</span>}
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  id="contact-message" 
                  rows={5} 
                  {...register('message')}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-accent outline-none transition-all resize-none ${
                    errors.message ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                  }`} 
                  placeholder="Votre message..." 
                />
                {errors.message && <span className="text-xs text-red-500 mt-1 block">{errors.message.message}</span>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-brand-accent text-white py-3 rounded-xl font-semibold hover:bg-brand-accent/90 transition-colors disabled:opacity-50"
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
