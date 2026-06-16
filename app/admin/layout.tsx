import { redirect } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/auth-server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  if (!isAdmin(user.role)) {
    redirect('/')
  }

  return <>{children}</>
}
