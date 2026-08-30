"use client";

import { useState, useRef, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useRouter, usePathname } from '@/i18n/routing'
import { Globe, ChevronDown, Check } from 'lucide-react'

interface LocaleOption {
  code: 'fr' | 'en' | 'ar'
  label: string
  nativeName: string
  dir: 'ltr' | 'rtl'
}

const LOCALES: LocaleOption[] = [
  { code: 'fr', label: 'Français', nativeName: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ar', label: 'عربي', nativeName: 'العربية', dir: 'rtl' },
]

export function LanguageSwitcher() {
  const localeRaw = useLocale()
  const locale: 'fr' | 'en' | 'ar' = (localeRaw === 'ar' || localeRaw === 'en' || localeRaw === 'fr')
    ? localeRaw
    : 'fr'
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('Layout')
  
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const currentLocale: LocaleOption = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]!

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const switchLocale = (targetLocale: 'fr' | 'en' | 'ar') => {
    setIsOpen(false)
    if (targetLocale === locale) return
    const qs = searchParams.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { locale: targetLocale })
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 sm:px-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100/80 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-[#16254c]/10"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('changeLanguage')}
      >
        <Globe size={14} className="text-slate-500" />
        <span className="uppercase tracking-wider">{currentLocale.code}</span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 z-50 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
        >
          {LOCALES.map((item) => {
            const isSelected = item.code === locale
            return (
              <button
                key={item.code}
                onClick={() => switchLocale(item.code)}
                className={`flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#16254c]/8 text-[#16254c] font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 text-center text-[11px] font-bold uppercase text-slate-500 bg-slate-100 rounded px-1 py-0.5">{item.code}</span>
                  <div className="text-start">
                    <p className="leading-tight">{item.nativeName}</p>
                  </div>
                </div>
                {isSelected && (
                  <Check size={14} className="text-[#D4A76A]" strokeWidth={2.5} />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
