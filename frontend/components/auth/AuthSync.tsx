"use client";

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/lib/store/auth.store'

export function AuthSync() {
  const { data: session, status } = useSession()
  const setAuth = useAuthStore((state) => state.setAuth)

  // Synchronously set cookie during render if available to prevent race conditions
  if (typeof document !== 'undefined' && status === 'authenticated') {
    const nextSession = session as any
    if (nextSession?.accessToken && !document.cookie.includes('access_token=')) {
      document.cookie = `access_token=${nextSession.accessToken}; path=/; max-age=604800; samesite=lax`
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setAuth(session.user as any)
    }
  }, [session, status, setAuth])

  return null
}
