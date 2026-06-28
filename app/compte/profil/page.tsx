'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store/auth.store'
import { authApi } from '@/lib/api/auth'
import { toast } from 'sonner'
import { User as UserIcon, Mail, Phone, Shield } from 'lucide-react'

const profileSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  phone: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function AccountProfilePage() {
  const { user, token, updateUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    if (!token) return

    setIsLoading(true)
    try {
      const updatedUser = await authApi.updateProfile(data, token)
      updateUser(updatedUser)
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-brand-primary mb-6 border-b border-gray-100 pb-4">
        Mon Profil
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-brand-surface-dark p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-brand-primary mb-6">Informations personnelles</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Prénom</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <UserIcon size={18} />
                    </div>
                    <input
                      {...register('firstName')}
                      className={`w-full p-3 pl-12 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                        errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20'
                      }`}
                    />
                  </div>
                  {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nom</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <UserIcon size={18} />
                    </div>
                    <input
                      {...register('lastName')}
                      className={`w-full p-3 pl-12 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                        errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20'
                      }`}
                    />
                  </div>
                  {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Téléphone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Phone size={18} />
                    </div>
                    <input
                      {...register('phone')}
                      className={`w-full p-3 pl-12 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                        errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20'
                      }`}
                    />
                  </div>
                  {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary py-2.5 px-6 disabled:opacity-50"
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-surface rounded-2xl p-6 border border-brand-surface-dark shadow-sm">
            <h3 className="font-bold text-brand-primary mb-4 flex items-center gap-2">
              <Mail size={18} className="text-brand-accent" />
              Adresse Email
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Votre adresse email est utilisée pour vous connecter et recevoir les notifications de vos commandes.
            </p>
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-700 font-medium">
              {user?.email}
            </div>
            <button className="text-sm text-brand-accent hover:underline font-medium mt-3">
              Modifier mon email
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brand-surface-dark shadow-sm">
            <h3 className="font-bold text-brand-primary mb-4 flex items-center gap-2">
              <Shield size={18} className="text-green-500" />
              Sécurité
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Sécurisez votre compte en utilisant un mot de passe fort.
            </p>
            <button className="w-full btn-secondary py-2 text-sm">
              Changer le mot de passe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
