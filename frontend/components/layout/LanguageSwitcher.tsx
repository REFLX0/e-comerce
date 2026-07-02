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
      className="flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-xs font-bold uppercase tracking-wider text-brand-primary/70 transition-colors duration-200 hover:bg-brand-primary/5 hover:text-brand-primary"
      aria-label="Changer de langue"
    >
      {locale === 'fr' ? 'EN' : 'FR'}
    </button>
  )
}
