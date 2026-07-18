export interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  read: boolean
  createdAt: string
}

const BASE = '/api/admin/notifications'

export const notificationsApi = {
  async findAll(page = 1, limit = 20): Promise<{ data: Notification[]; total: number }> {
    const res = await fetch(`${BASE}?page=${page}&limit=${limit}`, { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to fetch notifications')
    return res.json()
  },

  async unreadCount(): Promise<number> {
    const res = await fetch(`${BASE}/unread-count`, { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to fetch unread count')
    return res.json()
  },

  async markRead(id: string): Promise<void> {
    await fetch(`${BASE}/${id}/read`, { method: 'PATCH', credentials: 'include' })
  },

  async markAllRead(): Promise<void> {
    await fetch(`${BASE}/mark-all-read`, { method: 'PATCH', credentials: 'include' })
  },
}
