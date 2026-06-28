'use client'

import { useAuthStore } from '@/lib/store/auth.store'

export default function AccountProfilePage() {
  const { user } = useAuthStore()

  if (!user) return null

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-brand-primary mb-6 border-b border-gray-100 pb-4">
        Informations Personnelles
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Nom complet</label>
            <p className="text-lg font-medium text-brand-primary">{user.firstName} {user.lastName}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</label>
            <p className="text-lg font-medium text-brand-primary">{user.email}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Rôle</label>
            <p className="text-lg font-medium text-brand-primary capitalize">{user.role}</p>
          </div>
        </div>

        <div className="bg-brand-surface rounded-2xl p-6 border border-brand-surface-dark flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <h3 className="font-semibold text-brand-primary">Gérer votre compte</h3>
          <p className="text-sm text-gray-500 mt-2 mb-4">
            Mettez à jour vos informations personnelles et votre mot de passe pour sécuriser votre compte.
          </p>
          <button className="btn-secondary w-full">
            Modifier mon profil
          </button>
        </div>
      </div>
    </div>
  )
}
