"use client";

import { useState } from 'react'
import { ShieldCheck, Lock, Smartphone, Monitor, LogOut, Eye, EyeOff, Save } from 'lucide-react'
import { toast } from 'sonner'

const MOCK_SESSIONS = [
  { id: '1', device: 'Chrome · Windows', location: 'Tunis, Tunisie', date: "Aujourd'hui 13:42", current: true },
  { id: '2', device: 'Safari · iPhone',  location: 'Sfax, Tunisie',  date: '30 juin 2026',   current: false },
]

export default function SecuritePage() {
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    toast.success('Mot de passe modifié avec succès !')
    setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Sécurité</h1>
        <p className="text-sm text-gray-500">Gérez votre mot de passe et vos sessions actives</p>
      </div>

      {/* Change password */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-brand-primary">
          <Lock size={18} className="text-brand-accent" />
          Changer de mot de passe
        </h2>
        <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
          {[
            { id: 'old', label: 'Mot de passe actuel', key: 'oldPassword' as const, show: showOld, toggle: () => setShowOld((p) => !p) },
            { id: 'new', label: 'Nouveau mot de passe', key: 'newPassword' as const, show: showNew, toggle: () => setShowNew((p) => !p) },
            { id: 'confirm', label: 'Confirmer le nouveau mot de passe', key: 'confirmPassword' as const, show: showNew, toggle: () => setShowNew((p) => !p) },
          ].map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="mb-1.5 block text-sm font-medium text-gray-700">{field.label}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id={field.id}
                  type={field.show ? 'text' : 'password'}
                  value={form[field.key]}
                  onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-10 pl-10 text-sm outline-none focus:border-brand-accent focus:bg-white transition-all"
                  required
                />
                <button type="button" onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-light transition-colors disabled:opacity-60"
          >
            <Save size={15} />
            {saving ? 'Enregistrement…' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>

      <div className="border-t border-gray-100" />

      {/* Active sessions */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-brand-primary">
          <Monitor size={18} className="text-brand-accent" />
          Sessions actives
        </h2>
        <div className="space-y-3">
          {MOCK_SESSIONS.map((session) => (
            <div
              key={session.id}
              className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${
                session.current ? 'border-brand-accent/30 bg-brand-accent/5' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  session.current ? 'bg-brand-accent text-black' : 'bg-gray-100 text-gray-500'
                }`}>
                  {session.device.includes('iPhone') ? <Smartphone size={18} /> : <Monitor size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-primary">{session.device}</p>
                  <p className="text-xs text-gray-400">{session.location} · {session.date}</p>
                </div>
              </div>
              {session.current ? (
                <span className="self-start rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 sm:self-auto">
                  Session actuelle
                </span>
              ) : (
                <button className="self-start flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors sm:self-auto">
                  <LogOut size={12} /> Déconnecter
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
