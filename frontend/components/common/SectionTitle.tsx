interface Props {
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
}

export function SectionTitle({ title, subtitle, centered = false, className = '' }: Props) {
  return (
    <div className={`mb-8 ${centered ? 'text-center' : ''} ${className}`}>
      <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-primary mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-500 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}
