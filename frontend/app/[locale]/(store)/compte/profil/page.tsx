"use client";

import { useState, useRef } from 'react'
import { useAuthStore } from '@/lib/store/auth.store'
import { authApi } from '@/lib/api/auth'
import { Save, User, Mail, Phone, Calendar, Camera, Trash2, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { gooeyToast as toast } from 'goey-toast'
import Image from 'next/image'

export default function ProfilPage() {
  const t = useTranslations('Account')
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email ?? '',
    phone: (user as any)?.phone ?? '',
    birthday: (user as any)?.birthday ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo')
      return
    }

    setUploadingPhoto(true)
    const toastId = toast(t('photoUploading'))

    try {
      const updatedUser = await authApi.uploadAvatar(file)
      updateUser(updatedUser)
      toast.success(t('photoUploadSuccess'), { id: toastId })
    } catch (err: any) {
      console.error('Avatar upload error:', err)
      toast.error(err.message || t('photoUploadError'), { id: toastId })
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = async () => {
    if (!user?.image) return
    setUploadingPhoto(true)
    const toastId = toast(t('photoUploading'))

    try {
      const updatedUser = await authApi.deleteAvatar()
      updateUser(updatedUser)
      toast.success(t('photoDeleteSuccess'), { id: toastId })
    } catch (err: any) {
      console.error('Avatar delete error:', err)
      toast.error(t('photoDeleteError'), { id: toastId })
    } finally {
      setUploadingPhoto(false)
    }
  }

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

  const fullName = user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.name || '')
  const initials = fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#16254c]/5 px-3 py-1 text-xs font-semibold text-[#16254c] mb-2">
          <Sparkles size={13} className="text-[#D4A76A]" />
          <span>{t('personalInfo')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#16254c] tracking-tight">{t('myProfile')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">{t('myProfileDesc')}</p>
      </div>

      {/* Avatar Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-lg shadow-slate-900/5 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar circle & action */}
          <div className="relative group shrink-0">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-3xl bg-gradient-to-tr from-[#16254c] to-[#254180] text-3xl sm:text-4xl font-black text-white shadow-xl shadow-[#16254c]/15 ring-4 ring-white border-2 border-slate-100 flex items-center justify-center">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="bg-gradient-to-tr from-[#D4A76A] to-[#F3D7A4] bg-clip-text text-transparent">
                  {initials}
                </span>
              )}

              {/* Uploading overlay */}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-[#16254c]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 text-white z-20">
                  <Loader2 size={24} className="animate-spin text-[#D4A76A]" />
                  <span className="text-[10px] font-bold">{t('photoUploading')}</span>
                </div>
              )}
            </div>

            {/* Quick Camera Trigger overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              aria-label={t('changePhoto')}
              className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#16254c] text-white shadow-md hover:bg-[#223b76] hover:scale-105 active:scale-95 transition-all border-2 border-white cursor-pointer disabled:opacity-50"
            >
              <Camera size={16} className="text-[#D4A76A]" />
            </button>
          </div>

          {/* Avatar details & action buttons */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg sm:text-xl font-bold text-[#16254c]">{fullName || t('dearCustomer')}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={11} />
                  <span>{t('activeAccount')}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">{user?.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#16254c] hover:bg-[#223b76] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                <Camera size={14} className="text-[#D4A76A]" />
                <span>{t('changePhoto')}</span>
              </button>

              {user?.image && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={uploadingPhoto}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2.5 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>{t('removePhoto')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-lg shadow-slate-900/5 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-[#16254c]">{t('accountCoordinates')}</h2>
          <p className="text-xs text-slate-500">{t('accountCoordinatesDesc')}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[
            { id: 'name', label: t('fullName') || 'Nom & Prénom', icon: User, type: 'text', placeholder: 'Ex: Mohamed Ali', key: 'name' as const },
            { id: 'email', label: 'Adresse Email', icon: Mail, type: 'email', placeholder: 'votre@email.com', key: 'email' as const },
            { id: 'phone', label: t('phone') || 'Numéro de téléphone', icon: Phone, type: 'tel', placeholder: '+216 XX XXX XXX', key: 'phone' as const },
            { id: 'birthday', label: t('birthday') || 'Date de naissance', icon: Calendar, type: 'date', placeholder: '', key: 'birthday' as const },
          ].map((field) => (
            <div key={field.id} className={field.id === 'name' || field.id === 'email' ? 'sm:col-span-1' : 'sm:col-span-1'}>
              <label htmlFor={field.id} className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                {field.label}
              </label>
              <div className="relative">
                <field.icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id={field.id}
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pr-4 pl-11 text-sm font-medium text-slate-800 outline-none focus:border-[#16254c] focus:bg-white focus:ring-4 focus:ring-[#16254c]/5 transition-all"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#16254c] hover:bg-[#223b76] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#16254c]/15 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="text-[#D4A76A]" />}
            <span>{saving ? (t('saving') || 'Enregistrement...') : (t('saveChanges') || 'Enregistrer les modifications')}</span>
          </button>
        </div>
      </form>
    </div>
  )
}