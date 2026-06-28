import { PackageSearch } from 'lucide-react'
import Link from 'next/link'

interface Props {
  icon?: React.ReactNode
  title?: string
  message: string
  action?: { label: string; href?: string; onClick?: () => void }
}

export function EmptyState({ icon, title, message, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-brand-primary/20 mb-4">
        {icon || <PackageSearch size={64} />}
      </div>
      {title && (
        <h3 className="font-display font-semibold text-xl text-brand-primary mb-2">
          {title}
        </h3>
      )}
      <p className="text-gray-500 max-w-md mb-6">{message}</p>
      {action &&
        (action.href ? (
          <Link href={action.href} className="btn-primary">
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="btn-primary">
            {action.label}
          </button>
        ))}
    </div>
  )
}
