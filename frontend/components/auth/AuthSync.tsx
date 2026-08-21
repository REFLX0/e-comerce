"use client";

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/lib/store/auth.store'
import { useVehicleStore } from '@/lib/store/vehicle.store'
import { useAccountVehicleSync } from '@/lib/hooks/useAccountVehicleSync'

export function AuthSync() {
  const { data: session, status } = useSession()
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearVehicle = useVehicleStore((state) => state.clearVehicle)

  // Sync account vehicle → vehicle store for logged-in users
  useAccountVehicleSync()

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

    // Clear the active vehicle when the user logs out so the next
    // visitor / anonymous session starts fresh
    if (status === 'unauthenticated') {
      clearVehicle()
    }
  }, [session, status, setAuth, clearVehicle])

  return null
}
