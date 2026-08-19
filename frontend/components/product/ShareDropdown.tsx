"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Share2, Link2, Mail, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const Facebook = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
)

const Twitter = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
)

interface ShareDropdownProps {
  productName: string
  productDescription: string
  className?: string
}

export function ShareDropdown({ productName, productDescription, className }: ShareDropdownProps) {
  const t = useTranslations('Product')
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success(t('linkCopied'))
    setTimeout(() => setCopied(false), 2000)
    setIsOpen(false)
  }

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(t('shareText', { name: productName }))
    
    let shareUrl = ''
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${text}&body=${url}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank')
    }
    setIsOpen(false)
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 text-sm font-medium transition-colors hover:text-brand-primary",
          isOpen ? "text-brand-primary" : "text-gray-500"
        )}
      >
        <Share2 size={20} />
        {t('share')}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 bottom-full z-50 mb-2 flex w-48 flex-col overflow-hidden rounded-xl border border-brand-border bg-white shadow-card animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <Facebook size={16} />
              Facebook
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-sky-500 transition-colors"
            >
              <Twitter size={16} />
              Twitter
            </button>
            <button
              onClick={() => handleShare('email')}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Mail size={16} />
              Email
            </button>
            <div className="h-px bg-gray-100" />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-3 px-4 py-3 text-sm text-brand-primary font-medium hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Link2 size={16} />}
              {copied ? t('copied') : t('copyLink')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
