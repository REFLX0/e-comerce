"use client";

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const toggleLanguage = () => {
    const nextLocale = locale === 'fr' ? 'en' : 'fr'
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <button
      onClick={toggleLanguage}
      className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-brand-primary transition-colors px-2"
      aria-label="Changer de langue"
    >
      {locale === 'fr' ? 'EN' : 'FR'}
    </button>
  )
}
