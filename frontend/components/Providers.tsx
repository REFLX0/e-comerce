"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { SessionProvider } from 'next-auth/react'
import { AuthSync } from '@/components/auth/AuthSync'
import { GooeyToaster } from 'goey-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthSync />
        <OfflineIndicator />
        {children}
        <GooeyToaster position="bottom-right" closeButton preset="bouncy" />
      </QueryClientProvider>
    </SessionProvider>
  )
}

