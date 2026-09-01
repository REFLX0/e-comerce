import { redirect } from '@/i18n/routing'

export default async function UserInvoicesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect({ href: '/compte/commandes', locale })
}
