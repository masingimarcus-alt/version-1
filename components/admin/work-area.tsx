'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  CalendarDays,
  Wallet,
  MessageSquare,
  BellRing,
  Plus,
  Trash2,
  Send,
  TrendingUp,
  Clock,
  CheckCircle2,
  Gamepad2,
  Trophy,
  ShoppingBag,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  getWorkEvents,
  createWorkEvent,
  deleteWorkEvent,
  getWorkMessages,
  sendWorkMessage,
  getFinanceSummary,
} from '@/app/actions/work'
import { getNotifications, type AppNotification } from '@/app/actions/notifications'
import { cn, formatNumber } from '@/lib/utils'

type Tab = 'calendar' | 'finance' | 'messages' | 'updates'

const TABS: { key: Tab; label: string; icon: typeof CalendarDays }[] = [
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'finance', label: 'Finance', icon: Wallet },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'updates', label: 'Updates', icon: BellRing },
]

export function WorkArea() {
  const [tab, setTab] = useState<Tab>('calendar')

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link href="/admin">
            <motion.div whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </motion.div>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">Work Area</h1>
              <Briefcase size={16} className="text-[var(--blue)]" />
            </div>
            <p className="text-[10px] text-muted-foreground">Admin operations workspace</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.key
            return (
              <motion.button
                key={t.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-colors',
                  active
                    ? 'bg-[var(--blue-dim)] border-[var(--blue)]/40'
                    : 'glass border-transparent',
                )}
              >
                <Icon size={18} className={active ? 'text-[var(--blue)]' : 'text-muted-foreground'} />
                <span className={cn('text-[10px] font-semibold', active ? 'text-white' : 'text-muted-foreground')}>
                  {t.label}
                </span>
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'calendar' && <CalendarTab />}
            {tab === 'finance' && <FinanceTab />}
            {tab === 'messages' && <MessagesTab />}
            {tab === 'updates' && <UpdatesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ------------------------------- Calendar ------------------------------- */

interface WorkEventRow {
  id: string
  title: string
  eventDate: string
  eventTime: string | null
  category: string | null
  notes: string | null
}

const CATEGORY_COLORS: Record<string, string> = {
  general: 'var(--blue)',
  tournament: '#f59e0b',
  delivery: '#22c55e',
  maintenance: '#ef4444',
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Local YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
function toDateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function CalendarTab() {
  const [events, setEvents] = useState<WorkEventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(toDateKey(today))
  const [form, setForm] = useState({ title: '', eventTime: '', category: 'general', notes: '' })

  useEffect(() => {
    getWorkEvents().then((data) => {
      setEvents(data as WorkEventRow[])
      setLoading(false)
    })
  }, [])

  // Map of dateKey -> events on that day
  const eventsByDate = events.reduce<Record<string, WorkEventRow[]>>((acc, e) => {
    ;(acc[e.eventDate] ??= []).push(e)
    return acc
  }, {})

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  // Days from Monday (getDay(): 0=Sun). Convert to Mon-first index.
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const todayKey = toDateKey(today)

  const changeMonth = (delta: number) => {
    setViewDate(new Date(year, month + delta, 1))
  }

  const selectedEvents = (eventsByDate[selectedDate] ?? []).sort((a, b) =>
    (a.eventTime ?? '').localeCompare(b.eventTime ?? ''),
  )

  const submit = () => {
    if (!form.title.trim() || !selectedDate) return
    startTransition(async () => {
      const row = await createWorkEvent({ ...form, eventDate: selectedDate })
      setEvents((prev) => [...prev, row as WorkEventRow])
      setForm({ title: '', eventTime: '', category: 'general', notes: '' })
      setShowForm(false)
    })
  }

  const remove = (id: string) => {
    startTransition(async () => {
      await deleteWorkEvent(id)
      setEvents((prev) => prev.filter((e) => e.id !== id))
    })
  }

  const selectedLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="space-y-4">
      {/* Month grid */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="w-8 h-8 rounded-lg glass flex items-center justify-center"
          >
            <ChevronLeft size={16} className="text-white" />
          </button>
          <p className="text-sm font-bold text-white">{MONTH_NAMES[month]} {year}</p>
          <button
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="w-8 h-8 rounded-lg glass flex items-center justify-center"
          >
            <ChevronRight size={16} className="text-white" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`b-${idx}`} />
            const key = toDateKey(new Date(year, month, day))
            const dayEvents = eventsByDate[key] ?? []
            const isSelected = key === selectedDate
            const isToday = key === todayKey
            return (
              <button
                key={key}
                onClick={() => setSelectedDate(key)}
                className={cn(
                  'aspect-square rounded-lg flex flex-col items-center justify-center gap-1 text-[13px] font-semibold transition-colors relative',
                  isSelected
                    ? 'bg-[var(--blue)] text-[#050505]'
                    : isToday
                      ? 'bg-[var(--blue-dim)] text-white'
                      : 'text-muted-foreground hover:bg-white/5',
                )}
              >
                <span>{day}</span>
                {dayEvents.length > 0 && (
                  <span className="flex items-center gap-0.5 absolute bottom-1">
                    {dayEvents.slice(0, 3).map((e, i) => (
                      <span
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{
                          background: isSelected
                            ? '#050505'
                            : CATEGORY_COLORS[e.category ?? 'general'] ?? 'var(--blue)',
                        }}
                      />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white">{selectedLabel}</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 bg-[var(--blue)] text-[#050505] px-3 py-2 rounded-xl font-bold text-xs"
        >
          <Plus size={14} />
          New Event
        </motion.button>
      </div>

      {/* Add-event form (pre-bound to selected date) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-4 space-y-3 overflow-hidden"
          >
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Event title"
              className="w-full bg-[var(--surface)] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground outline-none"
            />
            <input
              type="time"
              value={form.eventTime}
              onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
              className="w-full bg-[var(--surface)] rounded-xl px-3 py-2.5 text-sm text-white outline-none"
            />
            <div className="flex gap-2 flex-wrap">
              {Object.keys(CATEGORY_COLORS).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize border',
                    form.category === cat ? 'text-white' : 'text-muted-foreground border-transparent glass',
                  )}
                  style={form.category === cat ? { borderColor: CATEGORY_COLORS[cat], background: `${CATEGORY_COLORS[cat]}22` } : undefined}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes (optional)"
              className="w-full bg-[var(--surface)] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={submit}
              disabled={isPending}
              className="w-full py-2.5 rounded-xl bg-[var(--blue)] text-[#050505] font-bold text-sm disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Add to calendar'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events for selected day */}
      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
      ) : selectedEvents.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">No events on this day.</p>
      ) : (
        <div className="space-y-2">
          {selectedEvents.map((e) => {
            const color = CATEGORY_COLORS[e.category ?? 'general'] ?? 'var(--blue)'
            return (
              <div key={e.id} className="glass rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-1 self-stretch rounded-full" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{e.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {e.eventTime ? `${e.eventTime} · ` : ''}
                    <span className="capitalize" style={{ color }}>{e.category}</span>
                  </p>
                  {e.notes && <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">{e.notes}</p>}
                </div>
                <button onClick={() => remove(e.id)} className="w-9 h-9 rounded-xl glass flex items-center justify-center shrink-0">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* -------------------------------- Finance ------------------------------- */

interface FinanceData {
  revenue: number
  bookingCount: number
  pendingRevenue: number
  pendingCount: number
  completedRevenue: number
  completedCount: number
  consoleTotal: number
  consoleAvailable: number
  recent: { id: string; totalPrice: number; status: string | null; unit: string; duration: number; createdAt: string | Date | null }[]
}

function FinanceTab() {
  const [data, setData] = useState<FinanceData | null>(null)

  useEffect(() => {
    getFinanceSummary().then((d) => setData(d as FinanceData))
  }, [])

  if (!data) return <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>

  const cards = [
    { label: 'Total Revenue', value: `${formatNumber(data.revenue)} TL`, sub: `${data.bookingCount} bookings`, icon: TrendingUp, color: 'var(--blue)' },
    { label: 'Pending', value: `${formatNumber(data.pendingRevenue)} TL`, sub: `${data.pendingCount} pending`, icon: Clock, color: '#f59e0b' },
    { label: 'Completed', value: `${formatNumber(data.completedRevenue)} TL`, sub: `${data.completedCount} done`, icon: CheckCircle2, color: '#22c55e' },
    { label: 'Consoles', value: `${data.consoleAvailable}/${data.consoleTotal}`, sub: 'available', icon: Gamepad2, color: 'var(--blue)' },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="glass rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: `${c.color}22` }}>
                <Icon size={16} style={{ color: c.color }} />
              </div>
              <p className="text-lg font-black text-white leading-tight">{c.value}</p>
              <p className="text-[10px] text-muted-foreground">{c.label} · {c.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-3">Recent Bookings</p>
        {data.recent.length === 0 ? (
          <p className="text-[12px] text-muted-foreground py-4 text-center">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {data.recent.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-[12px] text-white font-semibold">{b.duration} {b.unit}(s) rental</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{b.status ?? 'pending'}</p>
                </div>
                <p className="text-[12px] font-bold text-[var(--blue)]">{formatNumber(b.totalPrice)} TL</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------- Messages ------------------------------- */

interface MessageRow {
  id: string
  authorName: string | null
  authorImage: string | null
  body: string
  createdAt: string | Date | null
}

function MessagesTab() {
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getWorkMessages().then((data) => {
      setMessages(data as MessageRow[])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!text.trim()) return
    const body = text
    setText('')
    startTransition(async () => {
      const row = await sendWorkMessage(body)
      setMessages((prev) => [...prev, row as MessageRow])
    })
  }

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Start the team conversation.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--blue-dim)] flex items-center justify-center shrink-0 text-[11px] font-bold text-[var(--blue)]">
                {(m.authorName ?? 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-bold text-white">{m.authorName ?? 'Admin'}</p>
                  {m.createdAt && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(m.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-muted-foreground/90 break-words">{m.body}</p>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 pt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Message the team…"
          className="flex-1 bg-[var(--surface)] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground outline-none"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={send}
          disabled={isPending}
          className="w-11 h-11 rounded-xl bg-[var(--blue)] flex items-center justify-center disabled:opacity-50 shrink-0"
        >
          <Send size={16} className="text-[#050505]" />
        </motion.button>
      </div>
    </div>
  )
}

/* -------------------------------- Updates ------------------------------- */

const UPDATE_ICONS = {
  competition: Trophy,
  rental: Gamepad2,
  marketplace: ShoppingBag,
} as const

const UPDATE_COLORS = {
  competition: '#f59e0b',
  rental: 'var(--blue)',
  marketplace: '#22c55e',
} as const

function UpdatesTab() {
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications().then((data) => {
      setItems(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
  if (items.length === 0) return <p className="text-center text-sm text-muted-foreground py-8">No updates yet.</p>

  return (
    <div className="space-y-2">
      {items.map((n) => {
        const Icon = UPDATE_ICONS[n.type]
        const color = UPDATE_COLORS[n.type]
        return (
          <Link key={n.id} href={n.link}>
            <motion.div whileTap={{ scale: 0.98 }} className="glass rounded-2xl p-3.5 flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white">{n.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
              </div>
            </motion.div>
          </Link>
        )
      })}
    </div>
  )
}
