"use client";

import dynamic from 'next/dynamic'

const RegisterPage = dynamic(() => import('@/app/[locale]/(auth)/auth/register/client-page'), { ssr: false })

export default function RegisterWrapper() {
  return <RegisterPage />
}
