"use client";

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/lib/store/auth.store'

export function AuthSync() {
  const { data: session, status } = useSession()
  const setAuth = useAuthStore((state) => state.setAuth)
  const currentUser = useAuthStore((state) => state.user)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const sessionEmail = session.user.email
      if (!currentUser || currentUser.email === sessionEmail) {
        // Synchronize the NextAuth user session to the Zustand store.
        // Do not overwrite an active backend login for a different account.
        setAuth(session.user as any)
      }
    }
  }, [session, status, setAuth, currentUser])

  return null
}
