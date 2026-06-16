import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

const EMAIL = 'masingimarcus@gmail.com'
const PASSWORD = 'SuperAdmin@2026!'

async function main() {
  // Use Better Auth's own password hasher so the format matches verification.
  const ctx = await auth.$context
  const hash = await ctx.password.hash(PASSWORD)

  const userRes = await pool.query('SELECT id FROM public."user" WHERE email = $1', [EMAIL])
  if (userRes.rowCount === 0) {
    throw new Error(`User ${EMAIL} not found`)
  }
  const userId = userRes.rows[0].id as string

  // Ensure a credential (email/password) account exists and has the new hash.
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

  // Make sure role is super_admin.
  await pool.query(`UPDATE public."user" SET role = 'super_admin' WHERE id = $1`, [userId])

  console.log('[v0] Done. Super admin password reset for', EMAIL)
  await pool.end()
}

main().catch((err) => {
  console.error('[v0] ERROR:', err)
  process.exit(1)
})
