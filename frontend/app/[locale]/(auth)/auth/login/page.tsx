import { Suspense } from 'react'
import LoginFormWrapper from '@/components/auth/LoginFormWrapper'
import { LoginSkeleton } from '@/components/auth/LoginSkeleton'

export const metadata = {
  title: 'Connexion | KiosqueTN',
  description: 'Connectez-vous pour accéder à votre espace KiosqueTN',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginFormWrapper />
    </Suspense>
  )
}
