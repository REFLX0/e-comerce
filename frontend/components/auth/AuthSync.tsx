"use client";

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/lib/store/auth.store'

export function AuthSync() {
  const { data: session, status } = useSession()
  const { setAuth, logout } = useAuthStore()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Synchronize the NextAuth user session to the Zustand store
      setAuth(session.user as any)
    } else if (status === 'unauthenticated') {
      // Clear store if session is gone
      logout()
    }
  }, [session, status, setAuth, logout])

  return null
}
