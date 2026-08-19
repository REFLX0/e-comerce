import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import LoginFormWrapper from '@/components/auth/LoginFormWrapper'
import { LoginSkeleton } from '@/components/auth/LoginSkeleton'

export async function generateMetadata() {
  const t = await getTranslations('Auth')
  return {
    title: `${t('login')} | specpart`,
    description: t('loginMetaDesc'),
  }
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginFormWrapper />
    </Suspense>
  )
}