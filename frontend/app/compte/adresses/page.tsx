'use client'

import { useAuthStore } from '@/lib/store/auth.store'
import { MapPin, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react'

export default function AccountAddressesPage() {
  const user = useAuthStore(state => state.user)

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-display font-bold text-brand-primary">
          Mes Adresses
        </h1>
        <button className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
          <Plus size={16} />
          <span className="hidden sm:inline">Ajouter une adresse</span>
        </button>
      </div>

      {!user?.addresses || user.addresses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-brand-surface-dark">
          <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <MapPin size={32} />
          </div>
          <h3 className="text-lg font-bold text-brand-primary mb-2">Aucune adresse</h3>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore enregistré d'adresse de livraison.</p>
          <button className="btn-secondary">Ajouter une adresse</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user.addresses.map((address, index) => (
            <div key={address.id || index} className="bg-white rounded-2xl border border-brand-surface-dark p-6 shadow-sm relative group">
              {address.isDefault && (
                <div className="absolute top-0 right-0 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl flex items-center gap-1">
                  <CheckCircle size={12} />
                  Par défaut
                </div>
              )}
              
              <h3 className="font-bold text-brand-primary mb-1 pr-24">{address.fullName}</h3>
              <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
              <p className="text-sm text-gray-600">{address.address}</p>
              <p className="text-sm text-gray-600 mb-6">{address.city}, {address.wilaya} {address.postalCode}</p>
              
              <div className="flex gap-2">
                <button className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-2">
                  <Edit2 size={14} />
                  Modifier
                </button>
                <button className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
