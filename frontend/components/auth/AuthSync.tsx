"use client";

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/lib/store/auth.store'

export function AuthSync() {
  const { data: session, status } = useSession()
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setAuth(session.user as any)
    } else if (status === 'unauthenticated') {
      useAuthStore.setState({ user: null, isAuthenticated: false })
    }
  }, [session, status, setAuth])

  return null
}
