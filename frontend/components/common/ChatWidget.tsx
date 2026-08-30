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
  ScanSearch,
  Truck,
  RotateCcw,
  Paperclip,
  Mic,
  Zap,
  ShieldCheck,
  MessageCircle,
  ChevronDown,
} from 'lucide-react'
import { useCartStore } from '@/lib/store/cart.store'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  time: string
}

const now = (locale: string) =>
  new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

const QUICK_ACTIONS = [
  { labelKey: 'findPart', icon: Search },
  { labelKey: 'identifyPart', icon: ScanSearch },
  { labelKey: 'trackOrder', icon: Truck },
  { labelKey: 'returnsRefunds', icon: RotateCcw },
]

const TRUST_ITEMS = [
  { labelKey: 'instantReply', icon: Zap },
  { labelKey: 'humanService', icon: Headset },
  { labelKey: 'secureData', icon: ShieldCheck },
]

export function ChatWidget() {
  const { data: session } = useSession()
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
    if (messages.length > 1) { // Don't save if it's just the welcome message
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          userEmail: session?.user?.email,
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
        .quick-btn:hover { transform: translateY(-1px); }
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
              width: 'min(400px, calc(100vw - 24px))',
              height: 'min(600px, calc(100vh - 120px))',
              borderRadius: 20,
              background: '#fff',
              boxShadow: '0 32px 80px -12px rgba(13,22,45,0.32), 0 0 0 1px rgba(22,37,76,0.08)',
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0d162d 0%, #16254c 60%, #1f356b 100%)',
                padding: '14px 16px 14px 16px',
                flexShrink: 0,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Logo avatar in header */}
                  <div
                    className="relative overflow-hidden rounded-full"
                    style={{
                      width: 44, height: 44,
                      background: '#0d162d',
                      boxShadow: '0 0 0 2px rgba(212,167,106,0.6)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/chatbotlogo.png" alt="Specpart AI" className="h-full w-full object-cover" />
                    <span
                      className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2"
                      style={{ background: '#22c55e', borderColor: '#16254c' }}
                    />
                  </div>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                      {t('headerTitle')}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
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
                            handleSend({ preventDefault: () => {} } as React.FormEvent, 'Je souhaite parler à un conseiller humain.')
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

            {/* ── Messages ── */}
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
                      background: '#0d162d',
                      boxShadow: '0 0 0 2px rgba(212,167,106,0.5)',
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/chatbotlogo.png" alt="Specpart AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                  }}>
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      fontSize: 13, lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                      ...(msg.role === 'user'
                        ? {
                            background: 'linear-gradient(135deg, #16254c, #1f356b)',
                            color: '#fff',
                            boxShadow: '0 2px 8px rgba(22,37,76,0.2)',
                          }
                        : {
                            background: '#fff',
                            color: '#1f2937',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            border: '1px solid rgba(22,37,76,0.07)',
                          }),
                    }}>
                      {msg.content}
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
                    background: '#0d162d',
                    boxShadow: '0 0 0 2px rgba(212,167,106,0.5)',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/chatbotlogo.png" alt="Specpart AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

              {/* Quick action chips */}
              {showActions && !isLoading && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, paddingLeft: 36, paddingTop: 4 }}>
                  {QUICK_ACTIONS.map(({ labelKey, icon: Icon }) => (
                    <button
                      key={labelKey}
                      className="quick-btn"
                      onClick={(e) => handleSend(e, t(labelKey))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 12px', borderRadius: 20,
                        border: '1px solid rgba(22,37,76,0.12)',
                        background: '#fff', color: '#16254c',
                        fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Icon size={12} style={{ color: '#D4A76A' }} />
                      {t(labelKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Composer ── */}
            <div style={{
              borderTop: '1px solid rgba(22,37,76,0.07)',
              background: '#fff',
              padding: '10px 12px 8px',
              flexShrink: 0,
            }}>
              <form onSubmit={handleSend}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#f4f5f9',
                  borderRadius: 16, padding: '6px 6px 6px 12px',
                  border: '1.5px solid transparent',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                  onFocusCapture={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#D4A76A'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px rgba(212,167,106,0.12)'
                  }}
                  onBlurCapture={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                  }}
                >
                  <button type="button" style={{ padding: 5, borderRadius: 8, border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                    <Paperclip size={15} />
                  </button>
                  <input
                    ref={inputRef}
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('inputPlaceholder')}
                    style={{
                      flex: 1, background: 'transparent', border: 'none',
                      fontSize: 13, color: '#1f2937', padding: '6px 0',
                      outline: 'none',
                    }}
                  />
                  <button type="button" style={{ padding: 5, borderRadius: 8, border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                    <Mic size={15} />
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    style={{
                      width: 36, height: 36, borderRadius: 12, border: 'none',
                      background: input.trim() ? 'linear-gradient(135deg, #16254c, #1f356b)' : '#e5e7eb',
                      color: input.trim() ? '#fff' : '#9ca3af',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: input.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s', flexShrink: 0,
                      boxShadow: input.trim() ? '0 2px 8px rgba(22,37,76,0.25)' : 'none',
                    }}
                  >
                    <Send size={14} style={{ transform: 'translateX(1px)' }} />
                  </button>
                </div>
              </form>

              {/* Trust bar */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                {TRUST_ITEMS.map(({ labelKey, icon: Icon }) => (
                  <span key={labelKey} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#9ca3af' }}>
                    <Icon size={10} style={{ color: '#D4A76A' }} />
                    {t(labelKey)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Floating Button ───────────────────────────────── */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: 58, height: 58, borderRadius: '50%', border: 'none',
              background: isOpen
                ? '#374151'
                : 'linear-gradient(135deg, #0d162d 0%, #16254c 100%)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isOpen
                ? '0 4px 16px rgba(0,0,0,0.25)'
                : '0 8px 28px rgba(13,22,45,0.45)',
              transform: isOpen ? 'rotate(0deg) scale(0.95)' : 'rotate(0deg) scale(1)',
              transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            aria-label={t('openChat')}
          >
            {isOpen ? (
              <X size={24} />
            ) : (
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full ring-2 ring-[#D4A76A]/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/chatbotlogo.png" alt="Chat AI" className="h-full w-full object-cover" />
              </div>
            )}
          </button>

          {/* Unread badge */}
          {!isOpen && unread > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 20, height: 20, borderRadius: '50%',
              background: '#ef4444', color: '#fff',
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
              boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
            }}>
              {unread}
            </span>
          )}
        </div>
      </div>
    </>
  )
}