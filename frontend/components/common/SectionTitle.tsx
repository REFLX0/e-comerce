interface Props {
  title: string
  subtitle?: string
  centered?: boolean
  kicker?: string
  className?: string
}

export function SectionTitle({
  title,
  subtitle,
  kicker,
  centered = false,
  className = '',
}: Props) {
  return (
    <div
      className={`section-header ${centered ? 'text-center' : ''} ${className}`}
    >
      {kicker && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-normal text-brand-muted">
          {kicker}
        </p>
      )}
      <h2 className="font-display text-brand-primary">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-brand-primary/60 ${centered ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}
          style={{
            fontSize: 'var(--text-body-lg)',
            lineHeight: 'var(--leading-body-lg)',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
