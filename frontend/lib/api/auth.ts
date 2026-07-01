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

  logout: () => apiPost<void>('/auth/logout', { refreshToken: token }),

  me: () =>
    apiGet<User>('/users/me', undefined, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateProfile: (payload: Partial<User>, ) =>
    apiPatch<User>('/users/me', payload),

  addAddress: (address: Omit<Address, 'id'>, ) =>
    apiPost<Address>('/users/me/addresses', address),

  removeAddress: (id: string, ) =>
    apiDelete<void>(`/users/me/addresses/${id}`),

  forgotPassword: (email: string) => apiPost<void>('/auth/forgot-password', { email }),
}

