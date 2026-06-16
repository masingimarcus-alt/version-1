'use server'

import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { rentalConsole, rentalBooking } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// --- Rental Console Actions (Admin only) ---

export async function getRentalConsoles() {
  return db.select().from(rentalConsole).orderBy(desc(rentalConsole.createdAt))
}

export async function createRentalConsole(data: {
  id: string
  name: string
  model: string
  condition: string
  pricePerHour: number
  pricePerDay: number
  deposit: number
  available: boolean
  image: string
  features: string[]
}) {
  await requireAdmin() // Admin or super_admin only
  await db.insert(rentalConsole).values(data)
  revalidatePath('/admin')
  revalidatePath('/rental')
  revalidatePath('/')
}

export async function updateRentalConsole(
  id: string,
  data: Partial<{
    name: string
    model: string
    condition: string
    pricePerHour: number
    pricePerDay: number
    deposit: number
    available: boolean
    image: string
    features: string[]
  }>
) {
  await requireAdmin()
  await db
    .update(rentalConsole)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(rentalConsole.id, id))
  revalidatePath('/admin')
  revalidatePath('/rental')
  revalidatePath('/')
}

export async function toggleConsoleAvailability(id: string, available: boolean) {
  await requireAdmin()
  await db
    .update(rentalConsole)
    .set({ available, updatedAt: new Date() })
    .where(eq(rentalConsole.id, id))
  revalidatePath('/admin')
  revalidatePath('/rental')
  revalidatePath('/')
}

export async function deleteRentalConsole(id: string) {
  await requireAdmin()
  await db.delete(rentalConsole).where(eq(rentalConsole.id, id))
  revalidatePath('/admin')
  revalidatePath('/rental')
  revalidatePath('/')
}

// --- Rental Booking Actions ---

export async function createRentalBooking(data: {
  consoleId: string
  duration: number
  unit: string
  deliveryOption: string
  deliveryAddress?: string
  totalPrice: number
}) {
  const userId = await getUserId()
  const id = `booking-${Date.now()}`
  await db.insert(rentalBooking).values({
    id,
    userId,
    ...data,
  })
  revalidatePath('/profile')
}

export async function getUserBookings() {
  const userId = await getUserId()
  return db
    .select()
    .from(rentalBooking)
    .where(eq(rentalBooking.userId, userId))
    .orderBy(desc(rentalBooking.createdAt))
}
