'use client'

import { useState, useEffect, useTransition, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, BarChart2, Trophy, Users, ShoppingBag, Plus, Edit2, Trash2, CheckCircle2, XCircle, Eye, Shield, QrCode, Gamepad2, Loader2, Calendar, Settings2, FileEdit, Zap, Phone, MapPin, Building2, Truck, Store } from 'lucide-react'
import { leaderboard, marketplaceItems } from '@/lib/data'
import { AnimatedCounter } from '@/components/animated-counter'
import { getRentalConsoles, toggleConsoleAvailability, deleteRentalConsole, getRentalBookings, updateBookingStatus } from '@/app/actions/rentals'
import { getAdminTournaments, deleteTournament } from '@/app/actions/tournaments'
import { getViewerRole } from '@/app/actions/users'
import { ConsoleFormModal, type ConsoleFormValues } from '@/components/admin/console-form-modal'
import { ProfileEditModal, type ProfileEditValues } from '@/components/profile/profile-edit-modal'
import { useSession } from '@/lib/auth-client'
import { cn, formatNumber } from '@/lib/utils'

const sections = ['Overview', 'Rentals', 'Tournaments', 'Players', 'Listings']

type RentalConsole = {
  id: string
  name: string
  model: string
  condition: string
  pricePerHour: number
  pricePerDay: number
  deposit: number
  available: boolean | null
  image: string | null
  features: string[] | null
}

type RentalBooking = {
  id: string
  duration: number
  unit: string
  deliveryOption: string
  deliveryAddress: string | null
  customerName: string | null
  phone: string | null
  buildingName: string | null
  aptNumber: string | null
  totalPrice: number
  status: string | null
  createdAt: string | Date | null
  consoleName: string | null
  consoleModel: string | null
  consoleImage: string | null
  accountName: string | null
  accountEmail: string | null
}

type AdminTournament = {
  id: string
  name: string
  status: string | null
  cover: string | null
  logoUrl: string | null
  prizePool: string | null
  startDate: string | null
  maxParticipants: number | null
  participantCount: number
}

type TournamentStats = {
  total: number
  active: number
  openRegistration: number
  drafts: number
}

const tournamentStatusBadge: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-[var(--surface-3)] text-muted-foreground' },
  registration: { label: 'Registration', className: 'bg-amber-400/10 text-amber-400' },
  in_progress: { label: 'In Progress', className: 'bg-red-400/10 text-red-400' },
  completed: { label: 'Completed', className: 'bg-emerald-400/10 text-emerald-400' },
  cancelled: { label: 'Cancelled', className: 'bg-[var(--surface-3)] text-muted-foreground' },
}

function AdminPageInner() {
  const searchParams = useSearchParams()
  const initialSection = searchParams.get('section') ?? 'Overview'
  const [activeSection, setActiveSection] = useState(
    sections.includes(initialSection) ? initialSection : 'Overview',
  )
  const [listingApprovals, setListingApprovals] = useState<Record<string, boolean | null>>({})
  const [consoles, setConsoles] = useState<RentalConsole[]>([])
  const [bookings, setBookings] = useState<RentalBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editingConsole, setEditingConsole] = useState<ConsoleFormValues | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileEdits, setProfileEdits] = useState<ProfileEditValues | null>(null)
  const [adminTournaments, setAdminTournaments] = useState<AdminTournament[]>([])
  const [tournamentStats, setTournamentStats] = useState<TournamentStats>({
    total: 0, active: 0, openRegistration: 0, drafts: 0,
  })
  const [tournamentsLoading, setTournamentsLoading] = useState(true)

  const { data: session } = useSession()
  const sessionUser = session?.user as
    | { name?: string; image?: string; location?: string; bio?: string; role?: string }
    | undefined

  const adminName = profileEdits?.name ?? sessionUser?.name ?? 'Administrator'
  const adminAvatar = profileEdits?.image ?? sessionUser?.image ?? '/images/avatars/avatar-1.png'
  const roleLabel = sessionUser?.role === 'super_admin' ? 'Super Admin' : 'Administrator'

  const loadTournaments = () => {
    getAdminTournaments().then(({ tournaments, stats }) => {
      setAdminTournaments(tournaments as AdminTournament[])
      setTournamentStats(stats)
      setTournamentsLoading(false)
    })
  }

  useEffect(() => {
    getRentalConsoles().then((data) => {
      setConsoles(data as RentalConsole[])
      setLoading(false)
    })
    getRentalBookings()
      .then((data) => setBookings(data as RentalBooking[]))
      .catch(() => setBookings([]))
    getViewerRole().then((role) => setIsSuperAdmin(role === 'super_admin'))
    loadTournaments()
  }, [])

  const handleBookingStatus = (id: string, status: 'confirmed' | 'rejected') => {
    startTransition(async () => {
      await updateBookingStatus(id, status)
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
    })
  }

  const pendingBookings = bookings.filter((b) => (b.status ?? 'pending') === 'pending')

  const handleDeleteTournament = (id: string) => {
    if (!confirm('Delete this tournament? This cannot be undone.')) return
    startTransition(async () => {
      await deleteTournament(id)
      setAdminTournaments((prev) => prev.filter((t) => t.id !== id))
      loadTournaments()
    })
  }

  const approve = (id: string) => setListingApprovals((prev) => ({ ...prev, [id]: true }))
  const reject = (id: string) => setListingApprovals((prev) => ({ ...prev, [id]: false }))
  
  const handleToggleAvailability = (id: string, currentAvailable: boolean | null) => {
    startTransition(async () => {
      const newAvailable = !currentAvailable
      await toggleConsoleAvailability(id, newAvailable)
      setConsoles((prev) => prev.map((c) => c.id === id ? { ...c, available: newAvailable } : c))
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this console?')) return
    startTransition(async () => {
      await deleteRentalConsole(id)
      setConsoles((prev) => prev.filter((c) => c.id !== id))
    })
  }

  const openAdd = () => {
    setEditingConsole(null)
    setFormOpen(true)
  }

  const openEdit = (c: RentalConsole) => {
    setEditingConsole({
      id: c.id,
      name: c.name,
      model: c.model,
      condition: c.condition,
      pricePerHour: c.pricePerHour,
      pricePerDay: c.pricePerDay,
      deposit: c.deposit,
      available: c.available ?? true,
      image: c.image ?? '',
      features: c.features ?? [],
    })
    setFormOpen(true)
  }

  const handleSaved = (values: ConsoleFormValues) => {
    setConsoles((prev) => {
      const exists = prev.some((c) => c.id === values.id)
      if (exists) {
        return prev.map((c) => (c.id === values.id ? { ...c, ...values } : c))
      }
      return [{ ...values }, ...prev]
    })
  }

  return (
    <div className="min-h-screen bg-[#050505] grid-pattern pb-10">
      {/* Header */}
      <div className="px-4 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <Link href="/">
            <motion.div whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </motion.div>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">Admin Panel</h1>
              <Shield size={16} className="text-[var(--blue)]" />
            </div>
            <p className="text-[10px] text-muted-foreground">Role: {roleLabel}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass"
            aria-label="Edit my profile"
          >
            <span className="relative w-8 h-8 rounded-full overflow-hidden border border-[var(--blue)]/40 shrink-0">
              <Image src={adminAvatar} alt={adminName} fill sizes="32px" className="object-cover" />
            </span>
            <Edit2 size={13} className="text-[var(--blue)]" />
          </motion.button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sections.map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.93 }}
              onClick={() => setActiveSection(s)}
              className={cn(
                'shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
                activeSection === s ? 'bg-[var(--blue)] text-[#050505]' : 'glass text-muted-foreground'
              )}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {/* ──────────────────────────── OVERVIEW ──────────────────────────── */}
            {activeSection === 'Overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Players', value: 1248, icon: Users, color: 'text-[var(--blue)]', bg: 'bg-[var(--blue-dim)]' },
                    { label: 'Active Tournaments', value: tournamentStats.active, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Marketplace Listings', value: marketplaceItems.length, icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    { label: 'Monthly Revenue', value: 124500, icon: BarChart2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', prefix: '', suffix: ' TL' },
                  ].map((s) => (
                    <div key={s.label} className="glass rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-muted-foreground">{s.label}</span>
                        <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center`}>
                          <s.icon size={15} className={s.color} />
                        </div>
                      </div>
                      <p className={`text-xl font-black ${s.color}`}>
                        <AnimatedCounter target={s.value} suffix={s.suffix ?? ''} />
                      </p>
                    </div>
                  ))}
                </div>

                {/* QR check-in management */}
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white">QR Check-in</h3>
                    <QrCode size={15} className="text-[var(--blue)]" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Generate check-in QR codes for active tournaments</p>
                  <div className="space-y-2">
                    {adminTournaments.filter((t) => t.status === 'in_progress' || t.status === 'registration').map((t) => (
                      <div key={t.id} className="flex items-center gap-3 p-2 rounded-xl bg-[var(--surface-2)]">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground">{t.participantCount} players registered</p>
                        </div>
                        <Link href={`/qr?type=checkin&tournament=${t.id}`}>
                          <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="w-9 h-9 rounded-xl bg-[var(--blue-dim)] border border-[var(--blue)]/30 flex items-center justify-center shrink-0"
                          >
                            <QrCode size={14} className="text-[var(--blue)]" />
                          </motion.div>
                        </Link>
                      </div>
                    ))}
                    {adminTournaments.filter((t) => t.status === 'in_progress' || t.status === 'registration').length === 0 && (
                      <p className="text-[11px] text-muted-foreground text-center py-2">No active tournaments</p>
                    )}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="glass rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-white mb-3">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { action: 'New player registered', detail: 'GhostPlayer_X joined', time: '2 min ago', dot: 'bg-emerald-400' },
                      { action: 'Marketplace listing submitted', detail: 'PS5 controller by Maestro99', time: '15 min ago', dot: 'bg-amber-400' },
                      { action: 'Tournament registration', detail: '2 new players joined FIFA Cup', time: '1 hour ago', dot: 'bg-[var(--blue)]' },
                      { action: 'Repair request submitted', detail: 'Xbox Series X — Power Issue', time: '3 hours ago', dot: 'bg-purple-400' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.dot}`} />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-white">{item.action}</p>
                          <p className="text-[10px] text-muted-foreground">{item.detail} · {item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────────────────── RENTALS ──────────────────────────── */}
            {activeSection === 'Rentals' && (
              <div className="space-y-4">
                {/* Booking requests — validation messages from customers */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Booking Requests
                    {pendingBookings.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400">
                        {pendingBookings.length} new
                      </span>
                    )}
                  </h3>
                </div>

                {bookings.length === 0 ? (
                  <div className="glass rounded-2xl p-6 text-center">
                    <QrCode size={26} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="text-xs text-muted-foreground">No booking requests yet.</p>
                  </div>
                ) : (
                  bookings.map((b) => {
                    const status = b.status ?? 'pending'
                    const statusStyle =
                      status === 'confirmed' ? 'bg-emerald-400/10 text-emerald-400'
                      : status === 'rejected' ? 'bg-red-400/10 text-red-400'
                      : 'bg-amber-400/10 text-amber-400'
                    return (
                      <div key={b.id} className="glass rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[var(--blue-dim)] flex items-center justify-center shrink-0">
                              <Gamepad2 size={16} className="text-[var(--blue)]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white truncate">{b.consoleName ?? 'Console'}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {b.duration} {b.unit} · {formatNumber(b.totalPrice)} TL
                              </p>
                            </div>
                          </div>
                          <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full capitalize shrink-0', statusStyle)}>
                            {status}
                          </span>
                        </div>

                        {/* Customer validation details */}
                        <div className="rounded-xl bg-[var(--surface-2)] p-3 space-y-2 mb-3">
                          <div className="flex items-center gap-2">
                            <Users size={13} className="text-muted-foreground shrink-0" />
                            <span className="text-xs text-white font-semibold">
                              {b.customerName ?? b.accountName ?? 'Customer'}
                            </span>
                          </div>
                          {b.phone && (
                            <a href={`tel:${b.phone}`} className="flex items-center gap-2">
                              <Phone size={13} className="text-muted-foreground shrink-0" />
                              <span className="text-xs text-[var(--blue)] font-semibold">{b.phone}</span>
                            </a>
                          )}
                          <div className="flex items-center gap-2">
                            {b.deliveryOption === 'delivery'
                              ? <Truck size={13} className="text-muted-foreground shrink-0" />
                              : <Store size={13} className="text-muted-foreground shrink-0" />}
                            <span className="text-xs text-muted-foreground capitalize">
                              {b.deliveryOption === 'delivery' ? 'Home delivery' : 'Store pickup'}
                            </span>
                          </div>
                          {b.deliveryOption === 'delivery' && (
                            <>
                              {b.deliveryAddress && (
                                <div className="flex items-start gap-2">
                                  <MapPin size={13} className="text-muted-foreground shrink-0 mt-0.5" />
                                  <span className="text-xs text-white">{b.deliveryAddress}</span>
                                </div>
                              )}
                              {(b.buildingName || b.aptNumber) && (
                                <div className="flex items-center gap-2">
                                  <Building2 size={13} className="text-muted-foreground shrink-0" />
                                  <span className="text-xs text-white">
                                    {b.buildingName}{b.buildingName && b.aptNumber ? ' · ' : ''}
                                    {b.aptNumber ? `Apt ${b.aptNumber}` : ''}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={() => handleBookingStatus(b.id, 'confirmed')}
                              disabled={isPending}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 size={14} /> Validate
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={() => handleBookingStatus(b.id, 'rejected')}
                              disabled={isPending}
                              className="flex-1 py-2.5 rounded-xl bg-red-400/10 border border-red-400/30 text-red-400 text-xs font-bold flex items-center justify-center gap-1.5"
                            >
                              <XCircle size={14} /> Reject
                            </motion.button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBookingStatus(b.id, 'confirmed')}
                            disabled={isPending || status === 'confirmed'}
                            className="w-full py-2 rounded-xl glass text-[11px] font-semibold text-muted-foreground disabled:opacity-50"
                          >
                            {status === 'confirmed' ? 'Validated' : 'Re-validate'}
                          </button>
                        )}
                      </div>
                    )
                  })
                )}

                <div className="h-px bg-[var(--glass-border)] my-2" />

                <h3 className="text-sm font-bold text-white">Consoles</h3>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={openAdd}
                  className="w-full py-3 rounded-xl bg-[var(--blue)] text-[#050505] font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add Console
                </motion.button>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--blue)]" />
                  </div>
                ) : consoles.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No consoles added yet
                  </div>
                ) : (
                  consoles.map((c) => {
                    const isAvailable = c.available ?? false
                    return (
                      <div key={c.id} className="glass rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[var(--surface-2)]">
                            {c.image && <Image src={c.image} alt={c.name} fill className="object-contain p-1" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.model} · {c.condition}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-bold text-[var(--blue)]">{c.pricePerHour} TL/hr</span>
                              <span className="text-[10px] text-muted-foreground">|</span>
                              <span className="text-xs font-bold text-[var(--blue)]">{c.pricePerDay} TL/day</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Deposit: {c.deposit} TL</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--glass-border)]">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleAvailability(c.id, c.available)}
                            disabled={isPending}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              isAvailable
                                ? 'bg-emerald-400/10 border border-emerald-400/30 text-emerald-400'
                                : 'bg-red-400/10 border border-red-400/30 text-red-400'
                            }`}
                          >
                            {isAvailable ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            {isAvailable ? 'Available' : 'Unavailable'}
                          </motion.button>
                          <button
                            onClick={() => openEdit(c)}
                            className="w-10 py-2.5 rounded-xl bg-[var(--blue-dim)] border border-[var(--blue)]/20 flex items-center justify-center"
                          >
                            <Edit2 size={13} className="text-[var(--blue)]" />
                          </button>
                          <button 
                            onClick={() => handleDelete(c.id)}
                            disabled={isPending}
                            className="w-10 py-2.5 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center"
                          >
                            <Trash2 size={13} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* ──────────────────────────── TOURNAMENTS ──────────────────────────── */}
            {activeSection === 'Tournaments' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-white">Admin Panel</h2>
                  <p className="text-[11px] text-muted-foreground">Manage tournaments, brackets, and schedules</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total', value: tournamentStats.total, color: 'text-[var(--blue)]', bg: 'bg-[var(--blue-dim)]', icon: Trophy },
                    { label: 'Active', value: tournamentStats.active, color: 'text-red-400', bg: 'bg-red-400/10', icon: Zap },
                    { label: 'Open Registration', value: tournamentStats.openRegistration, color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Users },
                    { label: 'Drafts', value: tournamentStats.drafts, color: 'text-muted-foreground', bg: 'bg-[var(--surface-3)]', icon: FileEdit },
                  ].map((s) => (
                    <div key={s.label} className="glass rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-muted-foreground">{s.label}</span>
                        <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center`}>
                          <s.icon size={15} className={s.color} />
                        </div>
                      </div>
                      <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <Link href="/admin/tournaments/new">
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-xl bg-[var(--blue)] text-[#050505] font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Create Tournament
                  </motion.div>
                </Link>

                <h3 className="text-sm font-bold text-white pt-1">All Tournaments</h3>

                {tournamentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--blue)]" />
                  </div>
                ) : adminTournaments.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center">
                    <Trophy size={32} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">No tournaments yet. Create your first one.</p>
                  </div>
                ) : (
                  adminTournaments.map((t) => {
                    const badge = tournamentStatusBadge[t.status ?? 'draft'] ?? tournamentStatusBadge.draft
                    const image = t.cover || t.logoUrl
                    return (
                      <div key={t.id} className="glass rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[var(--surface-2)] flex items-center justify-center">
                            {image ? (
                              <Image src={image} alt={t.name} fill className="object-cover" />
                            ) : (
                              <Trophy size={20} className="text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{t.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Users size={11} /> {t.participantCount}/{t.maxParticipants ?? '—'}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Calendar size={11} />
                                {t.startDate
                                  ? new Date(t.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                  : 'TBD'}
                              </span>
                            </div>
                            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 inline-block', badge.className)}>
                              {badge.label}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[var(--glass-border)]">
                          <Link href={`/tournaments/${t.id}`}>
                            <button className="w-full py-2 rounded-xl glass text-[11px] font-semibold text-muted-foreground flex items-center justify-center gap-1">
                              <Eye size={12} /> View
                            </button>
                          </Link>
                          <Link href={`/admin/tournaments/${t.id}/edit`}>
                            <button className="w-full py-2 rounded-xl bg-[var(--blue-dim)] border border-[var(--blue)]/20 text-[11px] font-semibold text-[var(--blue)] flex items-center justify-center gap-1">
                              <Edit2 size={12} /> Edit
                            </button>
                          </Link>
                          <Link href={`/admin/tournaments/${t.id}`}>
                            <button className="w-full py-2 rounded-xl bg-[var(--blue-dim)] border border-[var(--blue)]/20 text-[11px] font-semibold text-[var(--blue)] flex items-center justify-center gap-1">
                              <Settings2 size={12} /> Manage
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteTournament(t.id)}
                            disabled={isPending}
                            className="w-full py-2 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center"
                          >
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* ──────────────────────────── PLAYERS ──────────────────────────── */}
            {activeSection === 'Players' && (
              <div className="space-y-2">
                {isSuperAdmin && (
                  <Link href="/admin/users">
                    <motion.div
                      whileTap={{ scale: 0.97 }}
                      className="rounded-2xl p-4 mb-2 flex items-center gap-3 bg-gradient-to-r from-amber-400/15 to-[var(--blue)]/10 border border-amber-400/30"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center shrink-0">
                        <Shield size={18} className="text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">Manage Users &amp; Roles</p>
                        <p className="text-[10px] text-muted-foreground">View all registered users and assign admins</p>
                      </div>
                      <ArrowLeft size={16} className="text-amber-400 rotate-180" />
                    </motion.div>
                  </Link>
                )}
                {leaderboard.map((p, i) => (
                  <motion.div
                    key={p.userId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--glass-border)]">
                      <Image src={p.avatar} alt={p.username} width={40} height={40} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.username}</p>
                      <p className="text-[10px] text-muted-foreground">Lv.{p.level} · {p.wins} wins · {p.country}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className="w-8 h-8 rounded-lg bg-[var(--blue-dim)] flex items-center justify-center">
                        <Eye size={13} className="text-[var(--blue)]" />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center">
                        <XCircle size={13} className="text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ──────────────────────────── LISTINGS ──────────────────────────── */}
            {activeSection === 'Listings' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-2">Pending marketplace approval</p>
                {marketplaceItems.map((item) => {
                  const status = listingApprovals[item.id]
                  return (
                    <div key={item.id} className="glass rounded-2xl p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[var(--surface-2)]">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.condition} · { formatNumber(item.price) } {item.currency}</p>
                          <p className="text-[10px] text-muted-foreground">Seller: {item.seller.username}</p>
                        </div>
                      </div>

                      {status === undefined ? (
                        <div className="flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => approve(item.id)}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 size={13} /> Approve
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => reject(item.id)}
                            className="flex-1 py-2.5 rounded-xl bg-red-400/10 border border-red-400/30 text-xs font-bold text-red-400 flex items-center justify-center gap-1.5"
                          >
                            <XCircle size={13} /> Reject
                          </motion.button>
                        </div>
                      ) : (
                        <div className={cn(
                          'py-2 rounded-xl text-xs font-bold text-center',
                          status ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                        )}>
                          {status ? 'Approved' : 'Rejected'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {formOpen && (
          <ConsoleFormModal
            initial={editingConsole}
            onClose={() => setFormOpen(false)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOpen && (
          <ProfileEditModal
            initial={{
              name: adminName,
              location: profileEdits?.location ?? sessionUser?.location ?? '',
              bio: profileEdits?.bio ?? sessionUser?.bio ?? '',
              image: adminAvatar,
            }}
            onClose={() => setProfileOpen(false)}
            onSaved={(values) => setProfileEdits(values)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--blue)]" />
        </div>
      }
    >
      <AdminPageInner />
    </Suspense>
  )
}
