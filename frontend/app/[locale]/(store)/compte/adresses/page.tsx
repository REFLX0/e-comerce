"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addressesApi } from '@/lib/api/addresses'
import { MapPin, Plus, Trash2, Home, Briefcase } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  wilaya: '',
  postalCode: '',
  isDefault: false,
}

export default function AddressesPage() {
  const t = useTranslations('Account')
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)

  const { data, isLoading } = useQuery<any>({
    queryKey: ['my-addresses'],
    queryFn: () => addressesApi.getAll(),
    enabled: true,
  })

  const addresses = (data as any)?.data ?? []

  const createMutation = useMutation({
    mutationFn: (data: any) => addressesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] })
      toast.success(t('addressAdded'))
      setShowForm(false)
      setFormData(EMPTY_FORM)
    },
    onError: () => toast.error(t('addressAddError')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] })
      toast.success(t('addressRemoved'))
    },
    onError: () => toast.error(t('addressRemoveError')),
  })

  const canSubmit = formData.fullName.trim() && formData.phone.trim() && formData.city.trim() && formData.wilaya.trim()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">{t('myAddresses')}</h1>
          <p className="text-sm text-gray-500">{t('myAddressesDesc')}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-light transition-colors"
          >
            <Plus size={16} /> {t('addAddress')}
          </button>
        )}
      </div>

      {showForm ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm max-w-2xl">
          <h2 className="mb-4 text-lg font-bold text-brand-primary">{t('newAddress')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('fullName')} <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:border-brand-primary focus:bg-white transition-colors"
                placeholder="Nom Prénom"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('phone')} <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:border-brand-primary focus:bg-white transition-colors"
                placeholder="+216 XX XXX XXX"
              />
            </div>

            {/* Street Address */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('fullAddress')}</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:border-brand-primary focus:bg-white transition-colors"
                placeholder="N° Rue, Bâtiment..."
              />
            </div>

            {/* City */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('city')} <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:border-brand-primary focus:bg-white transition-colors"
              />
            </div>

            {/* Wilaya / Governorate */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('wilaya')} <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.wilaya}
                onChange={e => setFormData({ ...formData, wilaya: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:border-brand-primary focus:bg-white transition-colors"
                placeholder="Ex: Tunis, Sfax, Sousse..."
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('postalCode')}</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:border-brand-primary focus:bg-white transition-colors"
              />
            </div>

            {/* Default */}
            <div className="sm:col-span-2 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/30"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                {t('setDefaultAddress')}
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending || !canSubmit}
              className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-light transition-colors disabled:opacity-50"
            >
              {t('saveAddress')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-gray-400">{t('loading')}</div>
          ) : addresses.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center">
              <MapPin size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">{t('noAddresses')}</p>
            </div>
          ) : (
            addresses.map((address: any) => (
              <div key={address.id} className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                {address.isDefault && (
                  <span className="absolute right-4 top-4 rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                    {t('default')}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3 text-brand-primary">
                  {(address.fullName ?? address.name ?? '').toLowerCase().includes('bureau') ? <Briefcase size={18} /> : <Home size={18} />}
                  <h3 className="font-bold">{address.fullName ?? address.name}</h3>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {address.phone && <p className="text-gray-500 text-xs">{address.phone}</p>}
                  {address.address && <p>{address.address}</p>}
                  <p>{[address.postalCode, address.city].filter(Boolean).join(' ')}</p>
                  {address.wilaya && <p>{address.wilaya}</p>}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end gap-2">
                  <button
                    onClick={() => deleteMutation.mutate(address.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}