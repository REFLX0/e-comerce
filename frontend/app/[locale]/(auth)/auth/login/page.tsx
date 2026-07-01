import { Suspense } from 'react'
import LoginFormWrapper from '@/components/auth/LoginFormWrapper'

export const metadata = {
  title: 'Connexion | KiosqueTN',
  description: 'Connectez-vous pour accéder à votre espace KiosqueTN',
}

export default function LoginPage() {
  return (
    <LoginFormWrapper />
  )
}

