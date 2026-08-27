"use client";

import { useState, useEffect } from 'react'
import { Lock, Smartphone, Monitor, LogOut, Eye, EyeOff, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { authApi } from '@/lib/api/auth'

export default function SecuritePage() {
  const t = useTranslations('Security')

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [currentDevice, setCurrentDevice] = useState('Navigateur web')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent
      let device = 'Navigateur Web'
      if (/windows/i.test(ua)) device = 'Chrome · Windows'
      else if (/macintosh|mac os x/i.test(ua)) device = 'Safari · macOS'
      else if (/iphone|ipad|ipod/i.test(ua)) device = 'Safari · iOS'
      else if (/android/i.test(ua)) device = 'Chrome · Android'
      else if (/linux/i.test(ua)) device = 'Firefox · Linux'
      
      setCurrentDevice(device)
      setIsMobile(/iphone|ipad|ipod|android/i.test(ua))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.error(t('passwordsMismatch'))
      return
    }
    setSaving(true)
    try {
      await authApi.changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      toast.success(t('success'))
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      toast.error(err.message || t('updateError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">{t('title')}</h1>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 font-semibold text-brand-primary">
          <Lock size={18} className="text-brand-muted" />
          {t('changePassword')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('oldPassword')}</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                required
                value={form.oldPassword}
                onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-brand-primary focus:bg-white focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('newPassword')}</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                minLength={8}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-brand-primary focus:bg-white focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('confirmPassword')}</label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-brand-primary focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? t('saving') : t('updatePassword')}
          </button>
        </form>
      </div>

      <div className="border-t border-gray-100" />

      {/* Active sessions */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-brand-primary">
          <Monitor size={18} className="text-brand-muted" />
          {t('activeSessions')}
        </h2>
        <div className="space-y-3">
          <div className="flex flex-col gap-3 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white">
                {isMobile ? <Smartphone size={18} /> : <Monitor size={18} />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-primary">{currentDevice}</p>
                <p className="text-xs text-gray-500">Tunisie · Actif maintenant</p>
              </div>
            </div>
            <span className="self-start rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 sm:self-auto">
              {t('currentSession')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
