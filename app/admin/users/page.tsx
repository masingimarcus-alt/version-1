import { redirect } from 'next/navigation'
import { getCurrentUser, isSuperAdmin } from '@/lib/auth-server'
import { getAllUsers } from '@/app/actions/users'
import { UserManagement } from '@/components/admin/user-management'

export default async function AdminUsersPage() {
  const viewer = await getCurrentUser()

  if (!viewer) redirect('/sign-in')
  // Only super admins may manage roles — admins are sent back to the panel.
  if (!isSuperAdmin(viewer.role)) redirect('/admin')

  const users = await getAllUsers()

  return <UserManagement initialUsers={users} viewerId={viewer.id} />
}
