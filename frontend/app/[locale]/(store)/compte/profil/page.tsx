"use client";

import { useState } from 'react'
import { useAuthStore } from '@/lib/store/auth.store'
import { authApi } from '@/lib/api/auth'
import { Save, User, Mail, Phone, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

export default function ProfilPage() {
  const t = useTranslations('Account')
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const [form, setForm] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email ?? '',
    phone: (user as any)?.phone ?? '',
    birthday: (user as any)?.birthday ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const [firstName, ...rest] = form.name.trim().split(' ')
      const updatedUser = await authApi.updateProfile({
        firstName,
        lastName: rest.join(' ') || undefined,
        email: form.email,
        ...(form.phone ? { phone: form.phone } : {}),
        ...(form.birthday ? { birthday: form.birthday } : {}),
      })
      updateUser(updatedUser)
      toast.success(t('profileUpdated'))
    } catch {
      toast.error(t('profileUpdateError'))
    } finally {
      setSaving(false)
    }
  }

  const fullName = user?.firstName ? `${user.firstName} ${user.lastName}` : ''
  const initials = fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">{t('myProfile')}</h1>
        <p className="text-sm text-gray-500">{t('myProfileDesc')}</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-2xl font-bold text-white">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-brand-primary">{fullName}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { id: 'name', label: t('fullName'), icon: User, type: 'text', placeholder: '', key: 'name' as const },
          { id: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'your@email.com', key: 'email' as const },
          { id: 'phone', label: t('phone'), icon: Phone, type: 'tel', placeholder: '+216 XX XXX XXX', key: 'phone' as const },
          { id: 'birthday', label: t('birthday'), icon: Calendar, type: 'date', placeholder: '', key: 'birthday' as const },
        ].map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="mb-1.5 block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <div className="relative">
              <field.icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id={field.id}
                type={field.type}
                value={form[field.key]}
                onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-sm outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:bg-brand-primary-light transition-colors disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? t('saving') : t('saveChanges')}
        </button>
      </form>
    </div>
  )
}