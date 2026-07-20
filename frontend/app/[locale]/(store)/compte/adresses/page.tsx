"use client";

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addressesApi } from '@/lib/api/addresses'
import { MapPin, Plus, Trash2, Home, Briefcase } from 'lucide-react'
import { toast } from 'sonner'

export default function AddressesPage() {
    const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: 'Domicile',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Tunisie',
    isDefault: false
  })

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
      toast.success('Adresse ajoutée')
      setShowForm(false)
      setFormData({ name: 'Domicile', street: '', city: '', state: '', zipCode: '', country: 'Tunisie', isDefault: false })
    },
    onError: () => toast.error('Erreur lors de l\'ajout'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] })
      toast.success('Adresse supprimée')
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Carnet d'adresses</h1>
          <p className="text-sm text-gray-500">Gérez vos adresses de livraison et facturation</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-light transition-colors"
          >
            <Plus size={16} /> Ajouter une adresse
          </button>
        )}
      </div>

      {showForm ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm max-w-2xl">
          <h2 className="mb-4 text-lg font-bold text-brand-primary">Nouvelle adresse</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nom de l'adresse (ex: Domicile, Bureau)</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:border-brand-primary focus:bg-white transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Adresse complète</label>
              <input
                type="text"
                value={formData.street}
                onChange={e => setFormData({ ...formData, street: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:border-brand-primary focus:bg-white transition-colors"
                placeholder="123 Rue de l'Exemple..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:border-brand-primary focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Code postal</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:border-brand-primary focus:bg-white transition-colors"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/30"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                Définir comme adresse par défaut
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending || !formData.street || !formData.city}
              className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-light transition-colors disabled:opacity-50"
            >
              Enregistrer l'adresse
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-gray-400">Chargement...</div>
          ) : addresses.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center">
              <MapPin size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">Vous n'avez pas encore d'adresse</p>
            </div>
          ) : (
            addresses.map((address: any) => (
              <div key={address.id} className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                {address.isDefault && (
                  <span className="absolute right-4 top-4 rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                    Défaut
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3 text-brand-primary">
                  {address.name.toLowerCase().includes('bureau') ? <Briefcase size={18} /> : <Home size={18} />}
                  <h3 className="font-bold">{address.name}</h3>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{address.street}</p>
                  <p>{address.zipCode} {address.city}</p>
                  {address.state && <p>{address.state}</p>}
                  <p>{address.country}</p>
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

