"use client";

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/lib/store/auth.store'

export function AuthSync() {
  const { data: session, status } = useSession()
  const setAuth = useAuthStore((state) => state.setAuth)
  const currentEmail = useAuthStore((state) => state.user?.email)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const sessionEmail = session.user.email
      if (!currentEmail || currentEmail === sessionEmail) {
        setAuth(session.user as any)
      }
    }
  }, [session, status, setAuth, currentEmail])

  return null
}
