import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export type Role = 'player' | 'admin' | 'super_admin'

export type SessionUser = {
  id: string
  name?: string | null
  email: string
  image?: string | null
  role: Role
}

/** Returns the current session user (with role) or null if not signed in. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const u = session.user as unknown as SessionUser
  return { ...u, role: (u.role ?? 'player') as Role }
}

/** Throws if not signed in. Returns the session user id. */
export async function requireUserId(): Promise<string> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

/** True for admin and super_admin. */
export function isAdmin(role?: Role | null): boolean {
  return role === 'admin' || role === 'super_admin'
}

/** True only for super_admin. */
export function isSuperAdmin(role?: Role | null): boolean {
  return role === 'super_admin'
}

/** Throws unless the current user is an admin or super_admin. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user || !isAdmin(user.role)) throw new Error('Forbidden: admin access required')
  return user
}

/** Throws unless the current user is a super_admin. */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user || !isSuperAdmin(user.role)) throw new Error('Forbidden: super admin access required')
  return user
}
