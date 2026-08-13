'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, User, Mail, Search, CheckCircle } from 'lucide-react'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'intro' | 'form' | 'success'>('intro')
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    part: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.contact.includes('@') ? formData.contact : 'no-email@chat.com',
          phone: !formData.contact.includes('@') ? formData.contact : '',
          subject: 'Demande de pièce via Chatbot',
          message: `Recherche de pièce : ${formData.part}`,
          isProfessional: false
        })
      })

      if (response.ok) {
        setStep('success')
      }
    } catch (error) {
      console.error('Failed to submit form', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[340px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-in slide-in-from-bottom-4 sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-brand-primary p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <MessageCircle size={20} className="text-white" />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-brand-primary bg-green-500"></span>
              </div>
              <div>
                <h3 className="font-display font-semibold">Assistance Specpart</h3>
                <p className="text-xs text-white/80">En ligne</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="h-[380px] overflow-y-auto bg-gray-50 p-4">
            {step === 'intro' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white">
                    <MessageCircle size={16} />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-white p-3 shadow-sm text-sm text-gray-700">
                    Bonjour ! 👋
                    <br /><br />
                    Vous cherchez une pièce spécifique qui ne se trouve pas sur notre site ?
                  </div>
                </div>

                <div className="flex flex-col gap-2 pl-11 pt-2">
                  <button
                    onClick={() => setStep('form')}
                    className="rounded-xl border border-brand-primary bg-brand-primary/5 px-4 py-2.5 text-sm font-medium text-brand-primary hover:bg-brand-primary hover:text-white transition-colors text-left"
                  >
                    Oui, je veux commander une pièce
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors text-left"
                  >
                    Non, je regarde juste
                  </button>
                </div>
              </div>
            )}

            {step === 'form' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white">
                    <MessageCircle size={16} />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-white p-3 shadow-sm text-sm text-gray-700">
                    Parfait ! Décrivez la pièce dont vous avez besoin ci-dessous.
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="ml-11 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Votre nom</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        placeholder="Jean Dupont"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Email ou Téléphone</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        required
                        type="text"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        placeholder="jean@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Pièce recherchée (Véhicule, référence...)</label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                      <textarea
                        required
                        value={formData.part}
                        onChange={(e) => setFormData({ ...formData, part: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary min-h-[60px]"
                        placeholder="Filtre à huile pour Golf 7 1.6 TDI..."
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary py-2.5 text-sm font-bold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-70"
                  >
                    {isLoading ? 'Envoi...' : 'Envoyer la demande'}
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}

            {step === 'success' && (
              <div className="flex h-full flex-col items-center justify-center text-center space-y-4 px-4 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold text-gray-900">Demande envoyée !</h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Merci ! Notre équipe va rechercher votre pièce et vous contacter très rapidement avec un devis.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setTimeout(() => setStep('intro'), 300)
                  }}
                  className="mt-4 rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'bg-gray-900 rotate-90 scale-90' : 'bg-brand-primary hover:-translate-y-1 hover:shadow-lg'
        } flex h-14 w-14 items-center justify-center rounded-full text-white shadow-md transition-all duration-300`}
        aria-label="Ouvrir le chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  )
}
