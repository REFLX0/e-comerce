"use client";

import dynamic from 'next/dynamic'
import { LoginSkeleton } from './LoginSkeleton'

const LoginForm = dynamic(() => import('./LoginForm'), { 
  ssr: false,
  loading: () => <LoginSkeleton />
})

export default function LoginFormWrapper() {
  return <LoginForm />
}
