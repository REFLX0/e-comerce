import { apiPost, apiGet, apiPut, apiPatch, apiDelete } from './client'
import type { User, Address } from '@/lib/types'

interface LoginPayload {
  email: string
  password: string
}
interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}
interface LoginResponse {
  user: User
  
}

export const authApi = {
  login: (payload: LoginPayload) => apiPost<LoginResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) => apiPost<LoginResponse>('/auth/register', payload),

  logout: () => apiPost<void>('/auth/logout', {}),

  me: () =>
    apiGet<User>('/users/me', undefined),

  updateProfile: (payload: Partial<User>, ) =>
    apiPatch<User>('/users/me', payload),

  uploadAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/users/me/avatar', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erreur lors du téléchargement de la photo' }))
      throw new Error(err.message || 'Erreur lors du téléchargement')
    }
    return res.json() as Promise<User>
  },

  deleteAvatar: () =>
    apiDelete<User>('/users/me/avatar'),

  addAddress: (address: Omit<Address, 'id'>, ) =>
    apiPost<Address>('/users/me/addresses', address),

  removeAddress: (id: string, ) =>
    apiDelete<void>(`/users/me/addresses/${id}`),

  forgotPassword: (email: string) => apiPost<void>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) => apiPost<void>('/auth/reset-password', { token, password }),

  changePassword: (payload: any) => apiPost<void>('/users/me/change-password', payload),

  subscribeNewsletter: (email: string) => apiPost<void>('/auth/newsletter', { email }),
}
