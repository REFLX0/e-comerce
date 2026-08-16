"use client";

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'

/**
 * 3-locale cycler: fr → en → ar → fr.
 *
 * `ar` renders right-to-left — `dir="rtl"` is applied at the root layout
 * based on the active locale, so the switcher itself only needs to swap
 * the locale segment in the URL.
 */
const LOCALE_CYCLE: Array<'fr' | 'en' | 'ar'> = ['fr', 'en', 'ar']

// What to show on the button for the *current* locale (the next locale is
// what the user will switch to — shown as the label so the affordance is
// "click to switch to this").
const NEXT_LABEL: Record<'fr' | 'en' | 'ar', string> = {
  fr: 'EN', // currently fr → click to go to en
  en: 'AR', // currently en → click to go to ar
  ar: 'FR', // currently ar → click to go to fr
}

export function LanguageSwitcher() {
  const localeRaw = useLocale()
  const locale: 'fr' | 'en' | 'ar' = (localeRaw === 'ar' || localeRaw === 'en' || localeRaw === 'fr')
    ? localeRaw
    : 'fr'
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('Layout')

  const currentIndex = LOCALE_CYCLE.indexOf(locale)
  const nextLocale: 'fr' | 'en' | 'ar' = LOCALE_CYCLE[(currentIndex + 1) % LOCALE_CYCLE.length] ?? 'fr'

  const toggleLanguage = () => {
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-xs font-bold uppercase tracking-wider text-brand-primary/70 transition-colors duration-200 hover:bg-brand-primary/5 hover:text-brand-primary"
      aria-label={t('changeLanguage')}
      title={`${t('changeLanguage')} → ${nextLabelLong(nextLocale)}`}
    >
      {NEXT_LABEL[locale]}
    </button>
  )
}

function nextLabelLong(locale: 'fr' | 'en' | 'ar'): string {
  switch (locale) {
    case 'fr': return 'Français'
    case 'en': return 'English'
    case 'ar': return 'العربية'
  }
}
