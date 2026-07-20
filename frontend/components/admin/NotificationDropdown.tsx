"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { notificationsApi, type Notification } from '@/lib/api/notifications'

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetch = useCallback(async () => {
    try {
      const count = await notificationsApi.unreadCount()
      setUnread(count)
      if (open) {
        setLoading(true)
        const res = await notificationsApi.findAll()
        setNotifs(res.data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [open])

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 30000)
    return () => clearInterval(interval)
  }, [fetch])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead()
    setUnread(0)
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id)
    setUnread((u) => Math.max(0, u - 1))
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-gray-100 bg-white shadow-xl z-50 animate-fade-in-up origin-top-right">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-bold text-brand-primary">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:underline"
              >
                <CheckCheck size={14} /> Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-gray-300" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Aucune notification
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 border-b border-gray-50 px-4 py-3 transition-colors ${
                    n.read ? '' : 'bg-blue-500/5'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => handleMarkRead(n.id)}
                        className="block"
                      >
                        <p className="text-sm font-semibold text-brand-primary">{n.title}</p>
                        {n.message && (
                          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.message}</p>
                        )}
                        <p className="mt-1 text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </Link>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-brand-primary">{n.title}</p>
                        {n.message && (
                          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.message}</p>
                        )}
                        <p className="mt-1 text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="mt-0.5 shrink-0 rounded-full bg-blue-500/20 p-1 text-blue-500 hover:bg-blue-500/30 transition-colors"
                      title="Marquer comme lu"
                    >
                      <CheckCheck size={12} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
