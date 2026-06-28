import { apiPost } from './client'

export const newsletterApi = {
  subscribe: (email: string) =>
    apiPost<void>('/newsletter/subscribe', { email }),
}
