'use server'

import { db } from '@/lib/db'
import { rentalConsole } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { tournaments, marketplaceItems } from '@/lib/data'

export type NotificationType = 'competition' | 'rental' | 'marketplace'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  image: string | null
  link: string
  createdAt: string // ISO string
}

/**
 * Builds the notification feed. Every notification is tied to one of three
 * events the platform cares about:
 *   1. A new competition (tournament) was created
 *   2. A new console was added and is available to rent
 *   3. A new console was listed for sale on the marketplace
 *
 * Rental consoles are read live from the database; competitions and
 * marketplace listings are sourced from the catalog data.
 */
export async function getNotifications(): Promise<AppNotification[]> {
  const notifications: AppNotification[] = []

  // 1. New rental consoles available (live from DB) -------------------------
  const consoles = await db
    .select()
    .from(rentalConsole)
    .orderBy(desc(rentalConsole.createdAt))

  for (const c of consoles) {
    if (!c.available) continue
    notifications.push({
      id: `rental-${c.id}`,
      type: 'rental',
      title: 'New console available to rent',
      message: `${c.name} (${c.model}) is now available from ${c.pricePerDay.toLocaleString()} TL/day.`,
      image: c.image,
      link: '/rental',
      createdAt: (c.createdAt ?? new Date()).toString(),
    })
  }

  // 2. New competitions created --------------------------------------------
  for (const t of tournaments) {
    notifications.push({
      id: `competition-${t.id}`,
      type: 'competition',
      title: 'New competition created',
      message: `${t.name} — ${t.prize} prize pool on ${t.platform}. Registration is open.`,
      image: t.cover,
      link: `/tournaments/${t.id}`,
      createdAt: new Date(t.startDate).toISOString(),
    })
  }

  // 3. New consoles listed for sale ----------------------------------------
  for (const item of marketplaceItems) {
    if (item.category !== 'Consoles') continue
    notifications.push({
      id: `marketplace-${item.id}`,
      type: 'marketplace',
      title: 'New console for sale',
      message: `${item.name} listed for ${item.price.toLocaleString()} ${item.currency} (${item.condition}).`,
      image: item.image,
      link: '/marketplace',
      createdAt: new Date().toISOString(),
    })
  }

  // Newest first
  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return notifications
}
