'use server'

import { requireAdmin } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { product } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type ProductRow = typeof product.$inferSelect

// --- Reads -----------------------------------------------------------------

/** Every product (admin dashboard). */
export async function getProducts() {
  await requireAdmin()
  return db.select().from(product).orderBy(desc(product.createdAt))
}

/** Only available products, for the public Home + Marketplace. */
export async function getAvailableProducts() {
  return db
    .select()
    .from(product)
    .where(eq(product.available, true))
    .orderBy(desc(product.createdAt))
}

// --- Writes (Admin only) ---------------------------------------------------

export async function createProduct(data: {
  id?: string
  name: string
  category: string
  price: number
  currency?: string
  condition: string
  description?: string
  image?: string
  contactPhone?: string
  available: boolean
  verified?: boolean
}) {
  await requireAdmin()
  const id = data.id ?? `product-${Date.now()}`
  await db.insert(product).values({
    id,
    name: data.name,
    category: data.category,
    price: data.price,
    currency: data.currency ?? 'TL',
    condition: data.condition,
    description: data.description,
    image: data.image,
    contactPhone: data.contactPhone,
    available: data.available,
    verified: data.verified ?? false,
  })
  revalidatePath('/admin')
  revalidatePath('/marketplace')
  revalidatePath('/')
  return { id }
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string
    category: string
    price: number
    currency: string
    condition: string
    description: string
    image: string
    contactPhone: string
    available: boolean
    verified: boolean
  }>,
) {
  await requireAdmin()
  await db
    .update(product)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(product.id, id))
  revalidatePath('/admin')
  revalidatePath('/marketplace')
  revalidatePath('/')
}

export async function toggleProductAvailability(id: string, available: boolean) {
  await requireAdmin()
  await db
    .update(product)
    .set({ available, updatedAt: new Date() })
    .where(eq(product.id, id))
  revalidatePath('/admin')
  revalidatePath('/marketplace')
  revalidatePath('/')
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  await db.delete(product).where(eq(product.id, id))
  revalidatePath('/admin')
  revalidatePath('/marketplace')
  revalidatePath('/')
}
