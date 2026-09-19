import { useTranslations } from 'next-intl'
import { Camera, IdCard, MessageCircle, Wrench } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

/**
 * "Not sure which part fits your car?" strip for customers who don't know the
 * exact part reference: they send a photo of the carte grise or of the old
 * part on WhatsApp and the technical team identifies it for them.
 */
export function WhatsAppHelpBanner({ className = '' }: { className?: string }) {
  const t = useTranslations('Home')
  const href = buildWhatsAppUrl(t('whatsappHelpMessage'))

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-brand-primary px-6 py-8 text-white shadow-lg md:px-10 md:py-10 ${className}`}
    >
      <div aria-hidden="true" className="absolute -end-16 -top-16 h-56 w-56 rounded-full bg-brand-accent/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-[#25D366]/15 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <Wrench size={24} strokeWidth={1.75} className="text-brand-accent" />
          </div>
          <div className="max-w-2xl">
            <h2 className="text-xl font-black tracking-tight md:text-2xl">{t('whatsappHelpTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-white/75 md:text-base">{t('whatsappHelpDesc')}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/80">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                <IdCard size={14} aria-hidden="true" /> Carte Grise
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                <Camera size={14} aria-hidden="true" /> Photo
              </span>
            </div>
          </div>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#1fb85a] hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 md:text-base"
        >
          <MessageCircle size={20} aria-hidden="true" />
          {t('whatsappHelpCta')}
        </a>
      </div>
    </div>
  )
}
