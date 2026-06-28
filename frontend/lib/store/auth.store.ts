import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/types'
import { authApi } from '@/lib/api/auth'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: User) => void
  login: (payload: { email: string; password: string }) => Promise<void>
  register: (payload: { firstName: string; lastName: string; email: string; phone?: string; password: string }) => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        const token = get().token
        if (token) {
          authApi.logout(token).catch(console.error)
        }
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (user) => set({ user }),
      login: async (payload) => {
        set({ isLoading: true })
        try {
          const res = await authApi.login(payload)
          set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      register: async (payload) => {
        set({ isLoading: true })
        try {
          const res = await authApi.register(payload)
          set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true
        }
      },
    }
  )
)
