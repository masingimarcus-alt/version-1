'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Trophy, Gamepad2, ShoppingBag, X } from 'lucide-react'
import { getNotifications, type AppNotification, type NotificationType } from '@/app/actions/notifications'

const LAST_SEEN_KEY = 'ecomp:notifications:lastSeen'

const typeMeta: Record<
  NotificationType,
  { icon: typeof Trophy; tint: string; bg: string; label: string }
> = {
  competition: { icon: Trophy, tint: 'text-amber-400', bg: 'bg-amber-400/15', label: 'Competition' },
  rental: { icon: Gamepad2, tint: 'text-[var(--blue)]', bg: 'bg-[var(--blue-dim)]', label: 'Rental' },
  marketplace: { icon: ShoppingBag, tint: 'text-emerald-400', bg: 'bg-emerald-400/15', label: 'Market' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const refresh = useCallback(async () => {
    const data = await getNotifications()
    setItems(data)
    setLoading(false)
    const lastSeen = Number(
      (typeof window !== 'undefined' && window.localStorage.getItem(LAST_SEEN_KEY)) || 0,
    )
    const unread = data.filter((n) => new Date(n.createdAt).getTime() > lastSeen).length
    setUnreadCount(unread)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleOpen = () => {
    setOpen(true)
    // Mark everything as seen using the newest notification timestamp.
    if (items.length > 0) {
      const newest = Math.max(...items.map((n) => new Date(n.createdAt).getTime()))
      window.localStorage.setItem(LAST_SEEN_KEY, String(newest))
    }
    setUnreadCount(0)
  }

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        className="w-9 h-9 rounded-xl glass flex items-center justify-center relative"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={18} className="text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--blue)] text-[#050505] text-[9px] font-black flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-x-3 top-20 z-50 mx-auto max-w-md rounded-3xl border border-white/10 bg-[#0b0b0f] shadow-2xl overflow-hidden"
              role="dialog"
              aria-label="Notifications"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[var(--blue)]" />
                  <h2 className="text-sm font-black text-white">Notifications</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center"
                  aria-label="Close notifications"
                >
                  <X size={15} className="text-muted-foreground" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="px-5 py-10 text-center text-xs text-muted-foreground">Loading…</div>
                ) : items.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <Bell size={28} className="mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-sm font-bold text-white">No notifications yet</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      You&apos;ll be notified about new competitions, rentals, and consoles for sale.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {items.map((n) => {
                      const meta = typeMeta[n.type]
                      const Icon = meta.icon
                      return (
                        <li key={n.id}>
                          <Link
                            href={n.link}
                            onClick={() => setOpen(false)}
                            className="flex items-start gap-3 px-5 py-4 hover:bg-white/5 transition-colors"
                          >
                            <span className={`relative w-11 h-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center ${meta.bg}`}>
                              {n.image ? (
                                <Image src={n.image} alt="" fill sizes="44px" className="object-cover" />
                              ) : (
                                <Icon size={18} className={meta.tint} />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Icon size={12} className={meta.tint} />
                                <span className={`text-[10px] font-bold uppercase tracking-wide ${meta.tint}`}>
                                  {meta.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground">· {timeAgo(n.createdAt)}</span>
                              </div>
                              <p className="text-[13px] font-bold text-white mt-0.5 truncate">{n.title}</p>
                              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{n.message}</p>
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
