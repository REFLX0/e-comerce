import { Suspense } from 'react'
import LoginFormWrapper from '@/components/auth/LoginFormWrapper'
import { LoginSkeleton } from '@/components/auth/LoginSkeleton'

export const metadata = {
  title: 'Connexion | specpart',
  description: 'Connectez-vous pour accéder à votre espace specpart',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginFormWrapper />
    </Suspense>
  )
}
