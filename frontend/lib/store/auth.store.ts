import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/types'
import { authApi } from '@/lib/api/auth'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isHydrated: boolean
  isLoading: boolean
  setAuth: (user: User) => void
  logout: () => void
  updateUser: (user: User) => void
  login: (payload: { email: string; password: string }) => Promise<void>
  register: (payload: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    password: string
  }) => Promise<void>
}

function normalizeUser(user: User | Record<string, any>): User {
  const name = typeof user.name === 'string' ? user.name : ''
  const [derivedFirstName = '', ...derivedLastName] = name.trim().split(/\s+/).filter(Boolean)

  return {
    ...(user as User),
    firstName: (user as Partial<User>).firstName ?? derivedFirstName,
    lastName: (user as Partial<User>).lastName ?? derivedLastName.join(' '),
    role: ((user as Partial<User>).role ?? 'CUSTOMER') as User['role'],
    addresses: (user as Partial<User>).addresses ?? [],
    createdAt:
      typeof (user as Partial<User>).createdAt === 'string'
        ? ((user as Partial<User>).createdAt as string)
        : new Date((user as Record<string, any>).createdAt ?? Date.now()).toISOString(),
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,
      setAuth: (user) => set({ user: normalizeUser(user), isAuthenticated: true }),
      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          console.error(error)
        }
        set({ user: null, isAuthenticated: false })
      },
      updateUser: (user) => set({ user }),
      login: async (payload) => {
        set({ isLoading: true })
        try {
          const res = await authApi.login(payload)
          // The API route handles the HttpOnly cookie for the token now.
          set({ user: normalizeUser(res.user), isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      register: async (payload) => {
        set({ isLoading: true })
        try {
          const res = await authApi.register(payload)
          set({ user: normalizeUser(res.user), isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      // SECURE: We partialize state to only save user data, NEVER a token!
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

if (typeof window !== 'undefined') {
  useAuthStore.setState({ isHydrated: true })
}
