import { apiPost, apiGet, apiPut } from './client'
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
  token: string
}

export const authApi = {
  login: (payload: LoginPayload) => apiPost<LoginResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    apiPost<LoginResponse>('/auth/register', payload),

  logout: (token: string) => apiPost<void>('/auth/logout', {}, token),

  me: (token: string) =>
    apiGet<User>('/auth/me', undefined, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateProfile: (payload: Partial<User>, token: string) =>
    apiPut<User>('/auth/profile', payload, token),

  changePassword: (
    payload: { currentPassword: string; newPassword: string },
    token: string
  ) => apiPut<void>('/auth/password', payload, token),

  addAddress: (address: Omit<Address, 'id'>, token: string) =>
    apiPost<Address>('/auth/addresses', address, token),

  updateAddress: (id: string, address: Partial<Address>, token: string) =>
    apiPut<Address>(`/auth/addresses/${id}`, address, token),

  forgotPassword: (email: string) =>
    apiPost<void>('/auth/forgot-password', { email }),
}
