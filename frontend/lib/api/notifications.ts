import { backendClient as api } from './client'

export interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  read: boolean
  createdAt: string
}

export interface NotificationsResponse {
  data: Notification[]
  total: number
}

export const notificationsApi = {
  findAll: (page = 1, limit = 20) =>
    api.get<NotificationsResponse>('/admin/notifications', { params: { page, limit } }),

  unreadCount: () =>
    api.get<number>('/admin/notifications/unread-count'),

  markRead: (id: string) =>
    api.patch<void>(`/admin/notifications/${id}/read`, {}),

  markAllRead: () =>
    api.patch<void>('/admin/notifications/mark-all-read', {}),
}
