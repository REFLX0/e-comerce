"use client";

import dynamic from 'next/dynamic'

const ForgotPasswordPage = dynamic(() => import('@/app/[locale]/(auth)/auth/mot-de-passe-oublie/client-page'), { ssr: false })

export default function ForgotPasswordWrapper() {
  return <ForgotPasswordPage />
}
