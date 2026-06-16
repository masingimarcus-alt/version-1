'use server'

import { db } from '@/lib/db'
import { workMessage, workEvent, rentalBooking, rentalConsole } from '@/lib/db/schema'
import { requireAdmin, getCurrentUser } from '@/lib/auth-server'
import { desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function id() {
  return crypto.randomUUID()
}

/* ----------------------------- Calendar ----------------------------- */

export async function getWorkEvents() {
  await requireAdmin()
  return db.select().from(workEvent).orderBy(workEvent.eventDate)
}

export async function createWorkEvent(data: {
  title: string
  eventDate: string
  eventTime?: string
  category?: string
  notes?: string
}) {
  const admin = await requireAdmin()
  const row = {
    id: id(),
    userId: admin.id,
    title: data.title,
    eventDate: data.eventDate,
    eventTime: data.eventTime || null,
    category: data.category || 'general',
    notes: data.notes || null,
  }
  await db.insert(workEvent).values(row)
  revalidatePath('/admin/work')
  return row
}

export async function deleteWorkEvent(eventId: string) {
  await requireAdmin()
  await db.delete(workEvent).where(eq(workEvent.id, eventId))
  revalidatePath('/admin/work')
}

/* ----------------------------- Messages ----------------------------- */

export async function getWorkMessages() {
  await requireAdmin()
  return db.select().from(workMessage).orderBy(workMessage.createdAt)
}

export async function sendWorkMessage(body: string) {
  const admin = await requireAdmin()
  const trimmed = body.trim()
  if (!trimmed) throw new Error('Message cannot be empty')
  const row = {
    id: id(),
    userId: admin.id,
    authorName: admin.name ?? 'Admin',
    authorImage: admin.image ?? null,
    body: trimmed,
  }
  await db.insert(workMessage).values(row)
  revalidatePath('/admin/work')
  return { ...row, createdAt: new Date() }
}

/* ----------------------------- Finance ------------------------------ */

export async function getFinanceSummary() {
  await requireAdmin()

  const bookings = await db
    .select({
      total: sql<number>`coalesce(sum(${rentalBooking.totalPrice}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(rentalBooking)

  const pending = await db
    .select({
      total: sql<number>`coalesce(sum(${rentalBooking.totalPrice}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(rentalBooking)
    .where(eq(rentalBooking.status, 'pending'))

  const completed = await db
    .select({
      total: sql<number>`coalesce(sum(${rentalBooking.totalPrice}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(rentalBooking)
    .where(eq(rentalBooking.status, 'completed'))

  const consoleStats = await db
    .select({
      total: sql<number>`count(*)`,
      available: sql<number>`count(*) filter (where ${rentalConsole.available} = true)`,
    })
    .from(rentalConsole)

  const recent = await db
    .select()
    .from(rentalBooking)
    .orderBy(desc(rentalBooking.createdAt))
    .limit(8)

  return {
    revenue: Number(bookings[0]?.total ?? 0),
    bookingCount: Number(bookings[0]?.count ?? 0),
    pendingRevenue: Number(pending[0]?.total ?? 0),
    pendingCount: Number(pending[0]?.count ?? 0),
    completedRevenue: Number(completed[0]?.total ?? 0),
    completedCount: Number(completed[0]?.count ?? 0),
    consoleTotal: Number(consoleStats[0]?.total ?? 0),
    consoleAvailable: Number(consoleStats[0]?.available ?? 0),
    recent,
  }
}

/* ----------------------------- Access ------------------------------- */

export async function getWorkAccess() {
  const user = await getCurrentUser()
  return {
    role: user?.role ?? null,
    name: user?.name ?? null,
    image: user?.image ?? null,
  }
}
