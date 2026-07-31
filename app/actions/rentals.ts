'use server'

import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { rentalConsole, rentalBooking, user } from '@/lib/db/schema'
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
  customerName?: string
  phone?: string
  buildingName?: string
  aptNumber?: string
  totalPrice: number
}) {
  const userId = await getUserId()
  const id = `booking-${Date.now()}`
  await db.insert(rentalBooking).values({
    id,
    userId,
    status: 'pending',
    ...data,
  })
  // Surface the new booking request in the admin dashboard.
  revalidatePath('/profile')
  revalidatePath('/admin')
  return { id }
}

export async function getUserBookings() {
  const userId = await getUserId()
  return db
    .select()
    .from(rentalBooking)
    .where(eq(rentalBooking.userId, userId))
    .orderBy(desc(rentalBooking.createdAt))
}

// --- Admin Booking Review Actions ---

/**
 * Returns every rental booking joined with the console and the customer who
 * placed it, so the admin dashboard can validate incoming requests.
 */
export async function getRentalBookings() {
  await requireAdmin()
  return db
    .select({
      id: rentalBooking.id,
      duration: rentalBooking.duration,
      unit: rentalBooking.unit,
      deliveryOption: rentalBooking.deliveryOption,
      deliveryAddress: rentalBooking.deliveryAddress,
      customerName: rentalBooking.customerName,
      phone: rentalBooking.phone,
      buildingName: rentalBooking.buildingName,
      aptNumber: rentalBooking.aptNumber,
      totalPrice: rentalBooking.totalPrice,
      status: rentalBooking.status,
      createdAt: rentalBooking.createdAt,
      consoleName: rentalConsole.name,
      consoleModel: rentalConsole.model,
      consoleImage: rentalConsole.image,
      accountName: user.name,
      accountEmail: user.email,
    })
    .from(rentalBooking)
    .leftJoin(rentalConsole, eq(rentalBooking.consoleId, rentalConsole.id))
    .leftJoin(user, eq(rentalBooking.userId, user.id))
    .orderBy(desc(rentalBooking.createdAt))
}

export async function updateBookingStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'rejected',
) {
  await requireAdmin()
  await db
    .update(rentalBooking)
    .set({ status, updatedAt: new Date() })
    .where(eq(rentalBooking.id, id))

  // When a booking is validated, the console is rented out, so hide it from
  // the rental catalog and Home by marking it unavailable.
  if (status === 'confirmed') {
    const [booking] = await db
      .select({ consoleId: rentalBooking.consoleId })
      .from(rentalBooking)
      .where(eq(rentalBooking.id, id))
    if (booking?.consoleId) {
      await db
        .update(rentalConsole)
        .set({ available: false, updatedAt: new Date() })
        .where(eq(rentalConsole.id, booking.consoleId))
    }
  }

  revalidatePath('/admin')
  revalidatePath('/profile')
  revalidatePath('/rental')
  revalidatePath('/')
}
