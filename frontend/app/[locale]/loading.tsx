import { useTranslations } from 'next-intl'

export default function Loading() {
  const t = useTranslations('Common')

  return (
    <div
      className="flex min-h-[60vh] flex-1 items-center justify-center"
      role="status"
      aria-label={t('loadingAria')}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated oil drop */}
        <div className="relative">
          <div className="bg-brand-primary/20 h-16 w-16 animate-ping rounded-full absolute inset-0 m-auto" />
          <div className="relative flex h-16 w-16 items-center justify-center">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-brand-primary h-9 w-9 animate-bounce"
              aria-hidden="true"
            >
              <path
                d="M24 6C24 6 10 20 10 30C10 37.7 16.3 44 24 44C31.7 44 38 37.7 38 30C38 20 24 6 24 6Z"
                fill="currentColor"
                opacity="0.3"
              />
              <path
                d="M24 6C24 6 10 20 10 30C10 37.7 16.3 44 24 44C31.7 44 38 37.7 38 30C38 20 24 6 24 6Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 33C17.5 36 20 38.5 23 39"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>
          </div>
        </div>

        {/* Skeleton bars suggesting content */}
        <div className="w-48 space-y-2 text-center">
          <div className="bg-brand-primary/10 mx-auto h-2.5 w-32 animate-pulse rounded-full" />
          <div className="bg-brand-primary/7 mx-auto h-2 w-24 animate-pulse rounded-full" />
        </div>

        <p className="text-xs font-medium tracking-widest text-gray-400 uppercase animate-pulse">
          {t('loading')}
        </p>
      </div>
    </div>
  )
}
