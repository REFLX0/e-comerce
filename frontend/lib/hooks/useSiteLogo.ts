import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '@/lib/api/admin'

export function useSiteLogo(): string {
  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsApi.getAll() as Promise<Record<string, unknown>>,
    staleTime: 5 * 60 * 1000,
  })
  return (data?.SITE_LOGO as string) || '/logo.png'
}
