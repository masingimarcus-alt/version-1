'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, UserPlus, Zap, Trophy, Trash2, QrCode, CheckCircle2,
  Loader2, Edit2, Clock, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Bracket } from '@/components/tournament/bracket'
import { AddPlayersModal } from '@/components/admin/add-players-modal'
import {
  getTournament,
  generateBracket,
  removeParticipant,
  toggleCheckIn,
  setTournamentStatus,
  type TournamentWithDetails,
  type TournamentStatus,
} from '@/app/actions/tournaments'

const TABS = ['Participants', 'Bracket', 'Schedule'] as const
type Tab = (typeof TABS)[number]

const STATUS_OPTIONS: { value: TournamentStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'registration', label: 'Registration' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusBadge: Record<string, string> = {
  draft: 'bg-[var(--surface-3)] text-muted-foreground',
  registration: 'bg-amber-400/10 text-amber-400',
  in_progress: 'bg-red-400/10 text-red-400',
  completed: 'bg-emerald-400/10 text-emerald-400',
  cancelled: 'bg-[var(--surface-3)] text-muted-foreground',
}

function roundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round
  if (fromEnd === 0) return 'Finals'
  if (fromEnd === 1) return 'Semi-Finals'
  if (fromEnd === 2) return 'Quarter-Finals'
  return `Round ${round}`
}

export function TournamentManage({ initial }: { initial: TournamentWithDetails }) {
  const [data, setData] = useState<TournamentWithDetails>(initial)
  const [tab, setTab] = useState<Tab>('Participants')
  const [addOpen, setAddOpen] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const reload = async () => {
    const fresh = await getTournament(data.id)
    if (fresh) setData(fresh)
  }

  const confirmedCount = data.participants.filter((p) => p.status === 'confirmed').length

  const handleGenerate = () => {
    setError(null)
    setBanner(null)
    startTransition(async () => {
      try {
        await generateBracket(data.id)
        await reload()
        setBanner('Bracket generated successfully. Head to the Bracket tab.')
        setTab('Bracket')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate bracket')
      }
    })
  }

  const handleStatus = (status: TournamentStatus) => {
    startTransition(async () => {
      await setTournamentStatus(data.id, status)
      await reload()
    })
  }

  const handleRemove = (participantId: string) => {
    if (!confirm('Remove this participant?')) return
    startTransition(async () => {
      await removeParticipant(participantId, data.id)
      await reload()
    })
  }

  const handleCheckIn = (participantId: string, current: boolean) => {
    startTransition(async () => {
      await toggleCheckIn(participantId, data.id, !current)
      await reload()
    })
  }

  const winnersRounds = data.matches.length
    ? Math.max(...data.matches.filter((m) => m.bracket === 'winners').map((m) => m.round), 0)
    : 0

  const scheduleRounds = Array.from(
    new Set(
      data.matches
        .filter((m) => m.bracket === 'winners')
        .map((m) => m.round),
    ),
  ).sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-[#050505] grid-pattern pb-24">
      {/* Header */}
      <div className="px-4 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/admin?section=Tournaments">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center"
            >
              <ArrowLeft size={18} className="text-white" />
            </motion.div>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-white truncate">{data.name}</h1>
            <p className="text-[11px] text-muted-foreground">
              {data.participants.length} / {data.maxParticipants} participants
            </p>
          </div>
          <Link href={`/admin/tournaments/${data.id}/edit`}>
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center"
            >
              <Edit2 size={15} className="text-[var(--blue)]" />
            </motion.div>
          </Link>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <select
            value={data.status ?? 'draft'}
            onChange={(e) => handleStatus(e.target.value as TournamentStatus)}
            disabled={isPending}
            className="glass rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none border border-transparent focus:border-[var(--blue)]/50"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#0d0d0f]">
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-xl px-3 py-2.5 text-xs font-bold text-white glass flex items-center justify-center gap-1.5"
          >
            <UserPlus size={14} className="text-[var(--blue)]" />
            Add Players
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          disabled={isPending || confirmedCount < 2}
          className="w-full py-3 rounded-xl bg-[var(--blue)] text-[#050505] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          Generate Bracket
        </motion.button>
        {confirmedCount < 2 && (
          <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
            Add at least 2 confirmed participants to generate a bracket.
          </p>
        )}

        <AnimatePresence>
          {banner && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 rounded-xl bg-emerald-400/10 border border-emerald-400/30 px-3 py-2.5 flex items-center gap-2"
            >
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-400 font-semibold">{banner}</p>
            </motion.div>
          )}
        </AnimatePresence>
        {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="flex gap-1 glass rounded-2xl p-1 mb-5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-semibold transition-all',
                tab === t ? 'bg-[var(--blue)] text-[#050505]' : 'text-muted-foreground',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Participants */}
        {tab === 'Participants' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white">Registered Participants</h3>
              <span className="text-[11px] text-muted-foreground">
                {confirmedCount} confirmed
              </span>
            </div>
            {data.participants.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <Users size={32} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">No participants yet</p>
              </div>
            ) : (
              data.participants.map((p, i) => (
                <div key={p.id} className="glass rounded-xl p-3 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[var(--surface-3)] flex items-center justify-center text-xs font-black text-muted-foreground shrink-0">
                    {p.seed ?? i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {p.platform ?? '—'}
                      {p.email ? ` · ${p.email}` : ''}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-[9px] px-2 py-0.5 rounded-full font-bold capitalize',
                      p.status === 'confirmed'
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'bg-amber-400/10 text-amber-400',
                    )}
                  >
                    {p.status}
                  </span>
                  <button
                    onClick={() => handleCheckIn(p.id, p.checkedIn ?? false)}
                    disabled={isPending}
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      p.checkedIn
                        ? 'bg-[var(--blue)] text-[#050505]'
                        : 'bg-[var(--blue-dim)] text-[var(--blue)]',
                    )}
                    aria-label="Toggle check-in"
                    title={p.checkedIn ? 'Checked in' : 'Check in'}
                  >
                    <QrCode size={13} />
                  </button>
                  <button
                    onClick={() => handleRemove(p.id)}
                    disabled={isPending}
                    className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center shrink-0"
                    aria-label="Remove participant"
                  >
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bracket */}
        {tab === 'Bracket' && (
          <Bracket
            participants={data.participants}
            matches={data.matches}
            editable
            onScored={reload}
          />
        )}

        {/* Schedule */}
        {tab === 'Schedule' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Registration', value: data.registrationDeadline },
                { label: 'Start', value: data.startDate },
                { label: 'End', value: data.endDate },
              ].map((d) => (
                <div key={d.label} className="glass rounded-xl p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">{d.label}</p>
                  <p className="text-xs font-bold text-white mt-1">
                    {d.value
                      ? new Date(d.value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'TBD'}
                  </p>
                </div>
              ))}
            </div>

            {scheduleRounds.length === 0 ? (
              <div className="glass rounded-2xl p-6 text-center">
                <Clock size={28} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-xs text-muted-foreground">
                  Round schedule appears once the bracket is generated.
                </p>
              </div>
            ) : (
              scheduleRounds.map((r, i) => (
                <div key={r} className="glass rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--blue-dim)] flex items-center justify-center shrink-0">
                    <Trophy size={16} className="text-[var(--blue)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">
                      {roundLabel(r, winnersRounds)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.startDate
                        ? new Date(data.startDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Date TBD'}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      i === 0 ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]',
                    )}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {addOpen && (
          <AddPlayersModal
            tournamentId={data.id}
            onClose={() => setAddOpen(false)}
            onAdded={reload}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
