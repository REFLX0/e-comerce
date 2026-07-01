interface Props {
  title: string
  subtitle?: string
  centered?: boolean
  kicker?: string          /* Small label above the heading (mono caps) */
  className?: string
}

/**
 * SectionTitle — Standardized section heading using the 8px baseline grid.
 *
 * - H2: 36px / 44px leading (baseline-locked)
 * - Optional kicker label in mono caps above H2
 * - Optional subtitle at body-lg scale
 * - Spacing: bottom margin = 2 × --lh (48px = 6 × 8px)
 */
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
        <p className="font-mono mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          {kicker}
        </p>
      )}
      <h2
        className="font-display text-brand-primary"
        data-optical
      >
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
