'use server'

import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentUser, requireSuperAdmin, type Role } from '@/lib/auth-server'

export type ManagedUser = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: Role
  emailVerified: boolean | null
  createdAt: Date | null
}

/** Super admin only: list every registered user, newest first. */
export async function getAllUsers(): Promise<ManagedUser[]> {
  await requireSuperAdmin()
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))

  return rows.map((r) => ({ ...r, role: (r.role ?? 'player') as Role }))
}

const VALID_ROLES: Role[] = ['player', 'admin', 'super_admin']

/**
 * Super admin only: set a user's role.
 * Guards against a super admin demoting themselves so the platform always
 * keeps at least one super admin in control.
 */
export async function setUserRole(userId: string, role: Role) {
  const current = await requireSuperAdmin()

  if (!VALID_ROLES.includes(role)) {
    throw new Error('Invalid role')
  }

  if (userId === current.id && role !== 'super_admin') {
    throw new Error('You cannot remove your own super admin access')
  }

  await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId))
  revalidatePath('/admin/users')
}

/** Convenience for UI: is the viewer a super admin? */
export async function getViewerRole(): Promise<Role | null> {
  const u = await getCurrentUser()
  return u?.role ?? null
}
