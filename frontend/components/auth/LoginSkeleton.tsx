export function LoginSkeleton() {
  return (
    <div className="section-padding bg-brand-surface flex min-h-[80vh] items-center justify-center py-16">
      <div className="border-brand-surface-dark w-full max-w-md animate-pulse rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="bg-brand-surface-dark h-8 w-36 rounded-lg" />
          <div className="bg-brand-surface-dark h-4 w-56 rounded" />
        </div>
        <div className="bg-brand-surface-dark mb-6 h-14 w-full rounded-xl" />
        <div className="mb-6 flex items-center gap-4">
          <div className="bg-brand-surface-dark h-px flex-1" />
          <div className="bg-brand-surface-dark h-3 w-20 rounded" />
          <div className="bg-brand-surface-dark h-px flex-1" />
        </div>
        <div className="space-y-6">
          <div className="bg-brand-surface-dark h-14 w-full rounded-xl" />
          <div className="bg-brand-surface-dark h-14 w-full rounded-xl" />
          <div className="bg-brand-primary/20 h-14 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
