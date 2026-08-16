import { Link } from '@/i18n/routing'
import { ChevronRight, Home } from 'lucide-react'
import { useLocale } from 'next-intl'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: Props) {
  const locale = useLocale()
  // Chevron separator points right in LTR; flip horizontally in RTL so it
  // still reads "forward → next crumb".
  const chevronRtlClass = locale === 'ar' ? 'rtl-flip' : ''

  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex items-center gap-x-2 text-sm text-gray-500">
        <li>
          <Link href="/" className="hover:text-brand-primary flex items-center transition-colors">
            <Home size={16} />
            <span className="sr-only">Accueil</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-x-2">
            <ChevronRight size={16} className={`text-gray-400 ${chevronRtlClass}`} />
            {item.href ? (
              <Link href={item.href} className="hover:text-brand-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-brand-primary font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
