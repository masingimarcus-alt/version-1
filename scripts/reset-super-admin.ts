import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

const EMAIL = 'masingimarcus@gmail.com'
const PASSWORD = 'SuperAdmin@2026!'
const NAME = 'Super Admin'

async function main() {
  // Use Better Auth's own password hasher so the format matches verification.
  const ctx = await auth.$context
  const hash = await ctx.password.hash(PASSWORD)

  // 1. Demote any existing super admins so there is only ever one.
  await pool.query(
    `UPDATE public."user" SET role = 'admin' WHERE role = 'super_admin' AND email <> $1`,
    [EMAIL],
  )

  // 2. Find or create the target user.
  let userId: string
  const userRes = await pool.query('SELECT id FROM public."user" WHERE email = $1', [EMAIL])

  if (userRes.rowCount && userRes.rowCount > 0) {
    userId = userRes.rows[0].id as string
    await pool.query(
      `UPDATE public."user"
       SET role = 'super_admin', name = COALESCE(NULLIF(name, ''), $2), "emailVerified" = true, "updatedAt" = now()
       WHERE id = $1`,
      [userId, NAME],
    )
    console.log('[v0] Updated existing user to super_admin')
  } else {
    const insertRes = await pool.query(
      `INSERT INTO public."user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, true, 'super_admin', now(), now())
       RETURNING id`,
      [NAME, EMAIL],
    )
    userId = insertRes.rows[0].id as string
    console.log('[v0] Created new super_admin user')
  }

  // 3. Ensure a credential (email/password) account exists with the new hash.
  const accRes = await pool.query(
    `SELECT id FROM public."account" WHERE "userId" = $1 AND "providerId" = 'credential'`,
    [userId],
  )

  if (accRes.rowCount && accRes.rowCount > 0) {
    await pool.query(
      `UPDATE public."account" SET password = $1, "updatedAt" = now() WHERE "userId" = $2 AND "providerId" = 'credential'`,
      [hash, userId],
    )
    console.log('[v0] Updated existing credential account password')
  } else {
    await pool.query(
      `INSERT INTO public."account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, 'credential', $1, $2, now(), now())`,
      [userId, hash],
    )
    console.log('[v0] Created new credential account')
  }

  console.log('[v0] Done. Super admin ready:', EMAIL)
  await pool.end()
}

main().catch((err) => {
  console.error('[v0] ERROR:', err)
  process.exit(1)
})
