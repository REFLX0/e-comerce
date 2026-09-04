'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import {
  Bot,
  X,
  Send,
  HelpCircle,
  MoreVertical,
  RefreshCcw,
  Headset,
  Search,
  Package,
  Headphones,
  FileText,
  Paperclip,
  Mic,
  Zap,
  ShieldCheck,
  User,
  MessageCircle,
  ChevronDown,
} from 'lucide-react'
import { useCartStore } from '@/lib/store/cart.store'
import { useAuthStore } from '@/lib/store/auth.store'

const CHATBOT_LOGO = '/chatbotlogo.png?v=2'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  time: string
}

const now = (locale: string) =>
  new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

const QUICK_ACTIONS = [
  { labelKey: 'findPart', icon: Search },
  { labelKey: 'trackOrder', icon: Package },
  { labelKey: 'contactSupport', icon: Headphones },
  { labelKey: 'helpCenter', icon: FileText },
]

const TRUST_ITEMS = [
  { labelKey: 'secureData', icon: ShieldCheck },
  { labelKey: 'instantReply', icon: Zap },
  { labelKey: 'humanService', icon: User },
]

function FormattedMessage({ text, locale }: { text: string; locale: string }) {
  const lines = text.split('\n')

  return (
    <div className="space-y-1">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) return <div key={lineIdx} className="h-1" />

        const elements: React.ReactNode[] = []
        const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g
        let lastIdx = 0
        let match: RegExpExecArray | null

        while ((match = regex.exec(line)) !== null) {
          if (match.index > lastIdx) {
            elements.push(line.substring(lastIdx, match.index))
          }

          if (match[2] && match[3]) {
            const linkText = match[2]
            let linkUrl = match[3]
            if (linkUrl.startsWith('/') && !linkUrl.startsWith(`/${locale}`)) {
              linkUrl = `/${locale}${linkUrl}`
            }
            elements.push(
              <a
                key={`link-${match.index}`}
                href={linkUrl}
                className="inline-flex items-center font-bold text-[#16254c] bg-amber-50 hover:bg-amber-100 border border-amber-300/60 px-2 py-0.5 rounded-lg text-xs transition-all my-0.5 underline underline-offset-2"
                target={linkUrl.startsWith('http') ? '_blank' : undefined}
                rel={linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {linkText}
              </a>
            )
          } else if (match[4]) {
            elements.push(
              <strong key={`bold-${match.index}`} className="font-semibold text-[#16254c]">
                {match[4]}
              </strong>
            )
          }

          lastIdx = regex.lastIndex
        }

        if (lastIdx < line.length) {
          elements.push(line.substring(lastIdx))
        }

        return (
          <div key={lineIdx} className="leading-relaxed">
            {elements.length > 0 ? elements : line}
          </div>
        )
      })}
    </div>
  )
}

export function ChatWidget() {
  const { data: session } = useSession()
  const authUser = useAuthStore((s) => s.user)
  const userEmail = authUser?.email || session?.user?.email
  const t = useTranslations('Chat')
  const locale = useLocale()
  const welcomeMessage = t('welcomeMessage')
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: welcomeMessage, time: now(locale) },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showActions, setShowActions] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addItem = useCartStore((state) => state.addItem)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('specpart_chat_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.messages?.length) setMessages(parsed.messages)
        if (parsed.showActions !== undefined) setShowActions(parsed.showActions)
      }
    } catch (e) {
      console.error('Failed to parse chat history', e)
    }
  }, [])

  // Save to localStorage when messages change
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('specpart_chat_history', JSON.stringify({ messages, showActions }))
    }
  }, [messages, showActions])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', closeMenu)
    return () => document.removeEventListener('mousedown', closeMenu)
  }, [])

  const handleSend = async (e: React.FormEvent, preset?: string) => {
    e.preventDefault()
    const content = (preset ?? input).trim()
    if (!content || isLoading) return

    const userMessage: ChatMessage = { role: 'user', content, time: now(locale) }
    const history = [...messages, userMessage]
    setMessages(history)
    setInput('')
    setShowActions(false)
    setIsLoading(true)

    try {
      const currentEmail =
        userEmail || useAuthStore.getState().user?.email || session?.user?.email
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          userEmail: currentEmail || undefined,
        }),
      })

      if (!response.ok) throw new Error('Chat request failed')

      const data = await response.json()
      
      // Handle server-side UI actions (like adding to cart)
      if (data.clientActions && data.clientActions.length > 0) {
        data.clientActions.forEach((action: any) => {
          if (action.type === 'ADD_TO_CART' && action.payload?.product && action.payload?.variant) {
            addItem(action.payload.product, action.payload.variant, 1)
          }
        })
      }

      const botMsg: ChatMessage = { role: 'assistant', content: data.reply, time: now(locale) }
      setMessages([...history, botMsg])
      if (!isOpen) setUnread((n) => n + 1)
    } catch {
      setMessages([
        ...history,
        {
          role: 'assistant',
          content: t('errorMessage'),
          time: now(locale),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const resetConversation = () => {
    setMessages([{ role: 'assistant', content: welcomeMessage, time: now(locale) }])
    setShowActions(true)
    setMenuOpen(false)
    localStorage.removeItem('specpart_chat_history')
  }

  return (
    <>
      {/* ── Keyframes injected once ── */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes msgSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.6; }
        }
        .chat-window { animation: chatSlideUp 0.22s cubic-bezier(0.16,1,0.3,1) both; }
        .msg-bubble  { animation: msgSlideIn 0.18s ease both; }
        .dot-1 { animation: pulseDot 1.2s ease-in-out infinite; }
        .dot-2 { animation: pulseDot 1.2s ease-in-out 0.2s infinite; }
        .dot-3 { animation: pulseDot 1.2s ease-in-out 0.4s infinite; }
        .chat-input:focus { outline: none; }
        .quick-action-chip {
          transition: all 0.15s ease;
        }
        .quick-action-chip:hover {
          transform: translateY(-1px);
          border-color: #cbd5e1;
          background: #f8fafc;
        }
        .scroll-area::-webkit-scrollbar { width: 4px; }
        .scroll-area::-webkit-scrollbar-track { background: transparent; }
        .scroll-area::-webkit-scrollbar-thumb { background: rgba(22,37,76,0.15); border-radius: 4px; }
      `}</style>

      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">

        {/* ── Chat Window ───────────────────────────────────── */}
        {isOpen && (
          <div
            className="chat-window flex flex-col overflow-hidden"
            style={{
              width: 'min(410px, calc(100vw - 24px))',
              height: 'min(620px, calc(100vh - 110px))',
              borderRadius: 22,
              background: '#fff',
              boxShadow: '0 32px 80px -12px rgba(13,22,45,0.32), 0 0 0 1px rgba(22,37,76,0.08)',
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0d162d 0%, #16254c 60%, #1f356b 100%)',
                padding: '14px 16px',
                flexShrink: 0,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Logo avatar in header */}
                  <div
                    className="relative flex items-center justify-center overflow-hidden rounded-full"
                    style={{
                      width: 44, height: 44,
                      background: '#ffffff',
                      boxShadow: '0 0 0 2px rgba(212,167,106,0.8)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={CHATBOT_LOGO} alt="Specpart AI" className="h-full w-full object-contain p-1" />
                    <span
                      className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2"
                      style={{ background: '#22c55e', borderColor: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                      {t('headerTitle')}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                      {t('onlineStatus')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setShowActions(true); setMenuOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 10px', borderRadius: 20,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: 11, fontWeight: 500, cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    <HelpCircle size={12} />
                    {t('help')}
                  </button>

                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setMenuOpen((v) => !v)}
                      style={{
                        padding: 7, borderRadius: '50%', border: 'none',
                        background: 'transparent', cursor: 'pointer',
                        color: 'rgba(255,255,255,0.6)', transition: 'background 0.15s',
                      }}
                    >
                      <MoreVertical size={15} />
                    </button>
                    {menuOpen && (
                      <div style={{
                        position: 'absolute', right: 0, top: 36, zIndex: 20,
                        width: 200, borderRadius: 12, overflow: 'hidden',
                        background: '#fff', border: '1px solid rgba(22,37,76,0.08)',
                        boxShadow: '0 12px 32px rgba(22,37,76,0.15)',
                      }}>
                        <button
                          onClick={resetConversation}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: '11px 14px', fontSize: 12, color: '#374151',
                            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                          }}
                        >
                          <RefreshCcw size={13} style={{ color: '#9ca3af' }} />
                          {t('newConversation')}
                        </button>
                        <div style={{ height: 1, background: '#f3f4f6' }} />
                        <button
                          onClick={() => {
                            setMenuOpen(false)
                            handleSend({ preventDefault: () => {} } as React.FormEvent, 'Je souhaite contacter le service client.')
                          }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: '11px 14px', fontSize: 12, color: '#374151',
                            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                          }}
                        >
                          <Headset size={13} style={{ color: '#9ca3af' }} />
                          {t('contactAdvisor')}
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      padding: 7, borderRadius: '50%', border: 'none',
                      background: 'rgba(255,255,255,0.08)', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.7)', transition: 'background 0.15s',
                    }}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Messages Area ── */}
            <div
              ref={scrollRef}
              className="scroll-area"
              style={{
                flex: 1, overflowY: 'auto',
                padding: '16px 14px',
                display: 'flex', flexDirection: 'column', gap: 12,
                background: '#f8f9fc',
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className="msg-bubble"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 8,
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  {/* Bot avatar in messages */}
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      overflow: 'hidden', flexShrink: 0,
                      background: '#ffffff',
                      boxShadow: '0 0 0 2px rgba(212,167,106,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={CHATBOT_LOGO} alt="Specpart AI" style={{ width: '88%', height: '88%', objectFit: 'contain' }} />
                    </div>
                  )}

                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '84%',
                  }}>
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      fontSize: 13, lineHeight: 1.55,
                      ...(msg.role === 'user'
                        ? {
                            background: 'linear-gradient(135deg, #16254c, #1f356b)',
                            color: '#fff',
                            boxShadow: '0 2px 8px rgba(22,37,76,0.2)',
                            whiteSpace: 'pre-wrap',
                          }
                        : {
                            background: '#fff',
                            color: '#1f2937',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            border: '1px solid rgba(22,37,76,0.07)',
                          }),
                    }}>
                      {msg.role === 'assistant' ? (
                        <FormattedMessage text={msg.content} locale={locale} />
                      ) : (
                        msg.content
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: '#9ca3af', marginTop: 3, padding: '0 4px' }}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="msg-bubble" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    overflow: 'hidden', flexShrink: 0,
                    background: '#ffffff',
                    boxShadow: '0 0 0 2px rgba(212,167,106,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={CHATBOT_LOGO} alt="Specpart AI" style={{ width: '88%', height: '88%', objectFit: 'contain' }} />
                  </div>
                  <div style={{
                    padding: '10px 14px', borderRadius: '18px 18px 18px 4px',
                    background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(22,37,76,0.07)',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4A76A', animation: 'bounce 1s infinite' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4A76A', animation: 'bounce 1s infinite 0.2s' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4A76A', animation: 'bounce 1s infinite 0.4s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Bottom Section (Quick Actions + Input Pill + Trust Badges) ── */}
            <div style={{
              background: '#fff',
              borderTop: '1px solid #f1f5f9',
              padding: '10px 12px 10px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
            }}>
              {/* Quick action chips (Screenshot Top Row) */}
              {showActions && !isLoading && (
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                  {QUICK_ACTIONS.map(({ labelKey, icon: Icon }) => (
                    <button
                      key={labelKey}
                      className="quick-action-chip flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap shrink-0"
                      onClick={(e) => handleSend(e, t(labelKey))}
                    >
                      <Icon size={13} className="text-slate-600 shrink-0" strokeWidth={2} />
                      <span>{t(labelKey)}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Hidden file input for attachment */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setInput((prev) => prev + ` [Fichier: ${file.name}]`)
                  }
                }}
              />

              {/* Unified Input Card Container (Screenshot Middle Row) */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white p-1.5 pl-3 shadow-2xs focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all"
              >
                {/* Paperclip button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50 cursor-pointer shrink-0"
                  aria-label="Attach file"
                >
                  <Paperclip size={18} strokeWidth={2} />
                </button>

                {/* Thin vertical separator */}
                <div className="h-5 w-[1px] bg-slate-200 shrink-0" />

                {/* Text input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('inputPlaceholder')}
                  className="chat-input flex-1 min-w-0 bg-transparent py-1 px-1 text-sm text-slate-800 placeholder:text-slate-400 border-0 outline-none"
                  disabled={isLoading}
                />

                {/* Microphone button */}
                <button
                  type="button"
                  onClick={() => {
                    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
                      const recognition = new SpeechRecognition()
                      recognition.lang = locale === 'ar' ? 'ar-TN' : locale === 'en' ? 'en-US' : 'fr-FR'
                      recognition.onresult = (event: any) => {
                        const transcript = event.results[0][0].transcript
                        setInput(transcript)
                      }
                      recognition.start()
                    }
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer shrink-0"
                  aria-label="Voice input"
                >
                  <Mic size={18} strokeWidth={2} />
                </button>

                {/* Solid Send Button (Squircle) */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#0d162d] text-white shadow-xs hover:bg-[#16254c] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  aria-label="Send message"
                >
                  <Send size={15} strokeWidth={2.2} />
                </button>
              </form>

              {/* Trust items footer (Screenshot Bottom Row) */}
              <div className="flex items-center justify-center gap-3 pt-1 text-[11px] font-medium text-slate-500">
                {TRUST_ITEMS.map(({ labelKey, icon: Icon }, idx) => (
                  <div key={labelKey} className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <Icon size={13} className="text-slate-400 shrink-0" strokeWidth={2} />
                      <span>{t(labelKey)}</span>
                    </span>
                    {idx < TRUST_ITEMS.length - 1 && (
                      <span className="h-3 w-[1px] bg-slate-200 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Floating Launcher Button ───────────────────────── */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? t('closeChat') : t('openChat')}
          className="relative flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d162d 0%, #16254c 50%, #1f356b 100%)',
            boxShadow: '0 8px 30px rgba(13,22,45,0.4), 0 0 0 2px rgba(212,167,106,0.7)',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          {/* Logo icon inside launcher */}
          <div
            className="relative h-11 w-11 flex items-center justify-center overflow-hidden rounded-full"
            style={{ background: '#ffffff', boxShadow: '0 0 0 2px rgba(212,167,106,0.8)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CHATBOT_LOGO} alt="Specpart AI" className="h-full w-full object-contain p-1" />
          </div>

          {/* Online green indicator */}
          <span
            className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2"
            style={{ background: '#22c55e', borderColor: '#fff' }}
          />

          {/* Unread badge */}
          {unread > 0 && !isOpen && (
            <span
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: '#ef4444' }}
            >
              {unread}
            </span>
          )}
        </button>
      </div>
    </>
  )
}