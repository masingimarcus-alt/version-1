'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Users, Zap, Calendar, Shield, Trophy, Clock,
  CheckCircle2, QrCode, Loader2, Swords,
} from 'lucide-react'
import { Bracket } from '@/components/tournament/bracket'
import { joinTournament, leaveTournament, type TournamentWithDetails } from '@/app/actions/tournaments'
import { cn } from '@/lib/utils'

const tabs = ['Overview', 'Bracket', 'Players', 'Schedule']

const statusLabel: Record<string, string> = {
  registration: 'Open',
  in_progress: 'Live',
  completed: 'Finished',
  cancelled: 'Cancelled',
}

const formatLabel: Record<string, string> = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
}

const FALLBACK_COVER = '/images/hero-tournament.png'

export function TournamentDetail({
  tournament,
  joinState,
}: {
  tournament: TournamentWithDetails
  joinState: { signedIn: boolean; joined: boolean }
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Overview')
  const [joined, setJoined] = useState(joinState.joined)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const max = tournament.maxParticipants ?? 0
  const count = tournament.participants.length
  const slotsLeft = Math.max(max - count, 0)
  const fillPercent = max > 0 ? Math.min((count / max) * 100, 100) : 0
  const cover = tournament.cover || tournament.logoUrl || FALLBACK_COVER
  const rules = (tournament.rules ?? '')
    .split('\n')
    .map((r) => r.trim())
    .filter(Boolean)
  const isOpen = tournament.status === 'registration'

  const handleJoin = () => {
    setError(null)
    if (!joinState.signedIn) {
      router.push('/sign-in')
      return
    }
    startTransition(async () => {
      const res = joined ? await leaveTournament(tournament.id) : await joinTournament(tournament.id)
      if (!res.ok) {
        setError(res.error ?? 'Something went wrong')
        return
      }
      setJoined(!joined)
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero cover */}
      <div className="relative h-72">
        <Image src={cover} alt={tournament.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />

        <Link href="/tournaments" className="absolute top-12 left-4">
          <motion.div whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </motion.div>
        </Link>

        <div className="absolute top-12 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass">
          {tournament.status === 'in_progress' && <span className="w-2 h-2 rounded-full bg-red-400 pulse-dot" />}
          <span className="text-xs font-bold text-white">{statusLabel[tournament.status ?? 'registration'] ?? tournament.status}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 pb-32">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white text-balance leading-tight mb-1">{tournament.name}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {tournament.game}{tournament.platform ? ` · ${tournament.platform}` : ''}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: Zap, label: 'Prize', value: tournament.prizePool || '—', color: 'text-[var(--blue)]', bg: 'bg-[var(--blue-dim)]' },
              { icon: Users, label: 'Players', value: `${count}/${max}`, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              {
                icon: Calendar, label: 'Starts',
                value: tournament.startDate
                  ? new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'TBD',
                color: 'text-amber-400', bg: 'bg-amber-400/10',
              },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-3 text-center">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-1.5`}>
                  <s.icon size={15} className={s.color} />
                </div>
                <div className={`text-sm font-black ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {isOpen && (
            <div className="glass rounded-xl p-3 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Registration</span>
                <span className="text-xs text-amber-400 font-semibold">{slotsLeft} slots remaining</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[var(--blue)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPercent}%` }}
                  transition={{ duration: 0.9, delay: 0.2 }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-2xl p-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-semibold transition-all',
                activeTab === tab ? 'bg-[var(--blue)] text-[#050505]' : 'text-muted-foreground',
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === 'Overview' && (
            <div className="space-y-4">
              {tournament.description && (
                <div className="glass rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-white mb-2">About</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{tournament.description}</p>
                </div>
              )}
              {rules.length > 0 && (
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={15} className="text-[var(--blue)]" />
                    <h3 className="text-sm font-bold text-white">Rules</h3>
                  </div>
                  <div className="space-y-2">
                    {rules.map((rule, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 size={13} className="text-[var(--blue)] mt-0.5 shrink-0" />
                        <span className="text-xs text-muted-foreground leading-relaxed">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3">
                  <span className="text-[10px] text-muted-foreground">Format</span>
                  <p className="text-xs font-bold text-white mt-0.5">{formatLabel[tournament.format ?? 'single_elimination']}</p>
                </div>
                <div className="glass rounded-xl p-3">
                  <span className="text-[10px] text-muted-foreground">Max Players</span>
                  <p className="text-xs font-bold text-[var(--blue)] mt-0.5">{max}</p>
                </div>
                {tournament.registrationDeadline && (
                  <div className="glass rounded-xl p-3">
                    <span className="text-[10px] text-muted-foreground">Reg. Deadline</span>
                    <p className="text-xs font-bold text-white mt-0.5">
                      {new Date(tournament.registrationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                )}
                {tournament.endDate && (
                  <div className="glass rounded-xl p-3">
                    <span className="text-[10px] text-muted-foreground">End Date</span>
                    <p className="text-xs font-bold text-white mt-0.5">
                      {new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Bracket' && (
            tournament.matches.length > 0 ? (
              <Bracket matches={tournament.matches} participants={tournament.participants} />
            ) : (
              <div className="glass rounded-2xl p-6 text-center">
                <Trophy size={40} className="text-[var(--blue)] mx-auto mb-3 opacity-60" />
                <p className="text-sm font-bold text-white mb-1">Bracket Not Ready</p>
                <p className="text-xs text-muted-foreground">
                  The bracket will be generated once registration closes.
                  {isOpen ? ` ${slotsLeft} slots remaining.` : ''}
                </p>
              </div>
            )
          )}

          {activeTab === 'Players' && (
            <div className="space-y-2">
              {tournament.participants.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                  <Users size={32} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">No players registered yet</p>
                </div>
              ) : (
                tournament.participants.map((p, i) => (
                  <div key={p.id} className="glass rounded-xl p-3 flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center">{p.seed ?? i + 1}</span>
                    <div className="w-9 h-9 rounded-xl bg-[var(--blue-dim)] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[var(--blue)]">{p.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.name}</p>
                      {p.platform && <p className="text-[10px] text-muted-foreground">{p.platform}</p>}
                    </div>
                    {p.checkedIn ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={10} /> Checked in
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--blue-dim)] text-[var(--blue)] font-semibold capitalize">
                        {p.status}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'Schedule' && (
            <div className="space-y-3">
              {tournament.matches.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                  <Clock size={32} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">Schedule will be available once the bracket is generated</p>
                </div>
              ) : (
                Array.from(new Set(tournament.matches.map((m) => `${m.bracket}-${m.round}`))).map((key, i) => {
                  const [bracket, roundStr] = key.split('-')
                  const round = Number(roundStr)
                  const roundMatches = tournament.matches.filter((m) => m.bracket === bracket && m.round === round)
                  const done = roundMatches.every((m) => m.status === 'completed')
                  const bracketName = bracket === 'grand_final' ? 'Grand Final' : bracket === 'losers' ? 'Losers' : 'Winners'
                  return (
                    <div key={key} className="glass rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--blue-dim)] flex items-center justify-center shrink-0">
                        <Swords size={16} className="text-[var(--blue)]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">
                          {bracket === 'grand_final' ? 'Grand Final' : `${bracketName} · Round ${round}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {roundMatches.length} {roundMatches.length === 1 ? 'match' : 'matches'} · {done ? 'Completed' : 'Pending'}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${done ? 'bg-emerald-400' : i === 0 ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]'}`} />
                    </div>
                  )
                })
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Join CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-[var(--glass-border)]">
        {error && <p className="text-xs text-red-400 text-center mb-2">{error}</p>}
        {joined ? (
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleJoin}
              disabled={isPending || !isOpen}
              className="flex-1 py-4 rounded-2xl bg-[var(--surface-3)] text-muted-foreground font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Withdraw'}
            </motion.button>
            <Link href={`/qr?type=tournament&id=${tournament.id}`} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl bg-[var(--blue-dim)] border border-[var(--blue)]/40 text-[var(--blue)] font-bold text-sm flex items-center justify-center gap-2"
              >
                <QrCode size={16} />
                Share Invite
              </motion.div>
            </Link>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleJoin}
            disabled={isPending || (!isOpen) || slotsLeft === 0}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2',
              !isOpen || slotsLeft === 0
                ? 'bg-[var(--surface-3)] text-muted-foreground cursor-not-allowed'
                : 'bg-[var(--blue)] text-[#050505] glow-blue',
            )}
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : !isOpen ? (
              'Registration Closed'
            ) : slotsLeft === 0 ? (
              'Tournament Full'
            ) : !joinState.signedIn ? (
              'Sign in to Join'
            ) : (
              'Join Tournament'
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}
