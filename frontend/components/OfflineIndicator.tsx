"use client";

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { WifiOff, Wifi, ServerCrash } from 'lucide-react'
import { useTranslations } from 'next-intl'

const HEALTH_CHECK_URL = '/api/health'
const HEALTH_CHECK_INTERVAL = 30_000 // 30 seconds
const OFFLINE_TOAST_ID = 'offline-indicator'
const SERVER_DOWN_TOAST_ID = 'server-down-indicator'

export function OfflineIndicator() {
  const serverDownRef = useRef(false)
  const offlineRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const t = useTranslations('Common')

  const checkServerHealth = async () => {
    // Don't check server if we know we're offline
    if (!navigator.onLine) return

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(HEALTH_CHECK_URL, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok && !serverDownRef.current) {
        serverDownRef.current = true
        // Try to get Request ID from the response for tracing
        const reqId = response.headers.get('x-request-id')

        toast.error(t('offlineServerTitle'), {
          id: SERVER_DOWN_TOAST_ID,
          description: reqId
            ? t('offlineServerDesc', { ref: reqId.slice(0, 8) })
            : t('offlineDesc'),
          duration: Infinity,
          icon: <ServerCrash size={18} />,
          action: {
            label: t('retry'),
            onClick: () => {
              serverDownRef.current = false
              toast.dismiss(SERVER_DOWN_TOAST_ID)
              checkServerHealth()
            },
          },
        })
      } else if (response.ok && serverDownRef.current) {
        serverDownRef.current = false
        toast.dismiss(SERVER_DOWN_TOAST_ID)
        toast.success(t('serverBackTitle'), {
          description: t('serverBackDesc'),
          duration: 4000,
          icon: <Wifi size={18} />,
        })
      }
    } catch {
      // Network error or aborted (timeout) — treat as server down
      if (!serverDownRef.current && navigator.onLine) {
        serverDownRef.current = true
        toast.error(t('offlineServerTitle'), {
          id: SERVER_DOWN_TOAST_ID,
          description: t('serverUnreachableDesc'),
          duration: Infinity,
          icon: <ServerCrash size={18} />,
          action: {
            label: t('retry'),
            onClick: () => {
              serverDownRef.current = false
              toast.dismiss(SERVER_DOWN_TOAST_ID)
              checkServerHealth()
            },
          },
        })
      }
    }
  }

  useEffect(() => {
    const handleOffline = () => {
      if (offlineRef.current) return
      offlineRef.current = true

      // Clear any server-down toast when we know the real issue is offline
      toast.dismiss(SERVER_DOWN_TOAST_ID)

      toast.error(t('offlineTitle'), {
        id: OFFLINE_TOAST_ID,
        description: t('offlineDesc2'),
        duration: Infinity,
        icon: <WifiOff size={18} />,
      })

      // Stop health checks while offline
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const handleOnline = () => {
      if (!offlineRef.current) return
      offlineRef.current = false

      toast.dismiss(OFFLINE_TOAST_ID)
      toast.success(t('connectionRestored'), {
        description: t('connectionActiveDesc'),
        duration: 4000,
        icon: <Wifi size={18} />,
      })

      // Resume health checks and do an immediate check
      intervalRef.current = setInterval(
        checkServerHealth,
        HEALTH_CHECK_INTERVAL,
      )
      checkServerHealth()
    }

    // Initialize state
    if (!navigator.onLine) {
      handleOffline()
    } else {
      // Start periodic server health checks
      checkServerHealth()
      intervalRef.current = setInterval(
        checkServerHealth,
        HEALTH_CHECK_INTERVAL,
      )
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // This component renders nothing — it only manages toasts
  return null
}
