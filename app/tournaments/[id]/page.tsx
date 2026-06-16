'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Zap, Calendar, Shield, List, Trophy, Clock, CheckCircle2, QrCode } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { tournaments, leaderboard } from '@/lib/data'
import { cn } from '@/lib/utils'

const tabs = ['Overview', 'Bracket', 'Players', 'Schedule']

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const tournament = tournaments.find((t) => t.id === id)
  const [activeTab, setActiveTab] = useState('Overview')
  const [joined, setJoined] = useState(false)

  if (!tournament) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Tournament not found</p>
        </div>
      </PageShell>
    )
  }

  const slotsLeft = tournament.maxPlayers - tournament.registeredPlayers
  const fillPercent = (tournament.registeredPlayers / tournament.maxPlayers) * 100

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero cover */}
      <div className="relative h-72">
        <Image src={tournament.cover} alt={tournament.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />

        {/* Back button */}
        <Link href="/tournaments" className="absolute top-12 left-4">
          <motion.div whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </motion.div>
        </Link>

        {/* Status */}
        <div className={`absolute top-12 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass`}>
          {tournament.status === 'live' && <span className="w-2 h-2 rounded-full bg-red-400 pulse-dot" />}
          <span className="text-xs font-bold text-white capitalize">{tournament.status}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 pb-32">
        {/* Title block */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white text-balance leading-tight mb-1">{tournament.name}</h1>
          <p className="text-sm text-muted-foreground mb-4">{tournament.game} · {tournament.platform}</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: Zap, label: 'Prize', value: tournament.prize, color: 'text-[var(--blue)]', bg: 'bg-[var(--blue-dim)]' },
              { icon: Users, label: 'Players', value: `${tournament.registeredPlayers}/${tournament.maxPlayers}`, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { icon: Calendar, label: 'Starts', value: new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'text-amber-400', bg: 'bg-amber-400/10' },
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

          {/* Slots bar */}
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
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-2xl p-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-semibold transition-all',
                activeTab === tab
                  ? 'bg-[var(--blue)] text-[#050505]'
                  : 'text-muted-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'Overview' && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-4">
                <h3 className="text-sm font-bold text-white mb-2">About</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tournament.description}</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={15} className="text-[var(--blue)]" />
                  <h3 className="text-sm font-bold text-white">Rules</h3>
                </div>
                <div className="space-y-2">
                  {tournament.rules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={13} className="text-[var(--blue)] mt-0.5 shrink-0" />
                      <span className="text-xs text-muted-foreground leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3">
                  <span className="text-[10px] text-muted-foreground">Format</span>
                  <p className="text-xs font-bold text-white mt-0.5">{tournament.format}</p>
                </div>
                <div className="glass rounded-xl p-3">
                  <span className="text-[10px] text-muted-foreground">Entry Fee</span>
                  <p className="text-xs font-bold text-[var(--blue)] mt-0.5">{tournament.entryFee}</p>
                </div>
                <div className="glass rounded-xl p-3">
                  <span className="text-[10px] text-muted-foreground">Organizer</span>
                  <p className="text-xs font-bold text-white mt-0.5">{tournament.organizer}</p>
                </div>
                <div className="glass rounded-xl p-3">
                  <span className="text-[10px] text-muted-foreground">End Date</span>
                  <p className="text-xs font-bold text-white mt-0.5">{new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Bracket' && (
            <div className="glass rounded-2xl p-6 text-center">
              <Trophy size={40} className="text-[var(--blue)] mx-auto mb-3 opacity-60" />
              <p className="text-sm font-bold text-white mb-1">Bracket Preview</p>
              <p className="text-xs text-muted-foreground">Bracket will be generated once registration closes. {slotsLeft} slots remaining.</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-[var(--surface-3)] flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">TBD</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Players' && (
            <div className="space-y-2">
              {leaderboard.slice(0, tournament.registeredPlayers > 8 ? 8 : tournament.registeredPlayers).map((p, i) => (
                <div key={p.userId} className="glass rounded-xl p-3 flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-[var(--glass-border)] shrink-0">
                    <Image src={p.avatar} alt={p.username} width={36} height={36} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.username}</p>
                    <p className="text-[10px] text-muted-foreground">Lv.{p.level} · {p.country}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--blue-dim)] text-[var(--blue)] font-semibold">{p.points.toLocaleString('en-US')} pts</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Schedule' && (
            <div className="space-y-3">
              {tournament.schedule.map((s, i) => (
                <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--blue-dim)] flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-[var(--blue)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{s.round}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {s.time}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]'}`} />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Join CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-[var(--glass-border)]">
        {joined ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setJoined(false)}
                className="flex-1 py-4 rounded-2xl bg-[var(--surface-3)] text-muted-foreground font-bold text-sm"
              >
                Withdraw
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
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setJoined(true)}
            disabled={slotsLeft === 0}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-sm transition-all',
              slotsLeft === 0
                ? 'bg-[var(--surface-3)] text-muted-foreground cursor-not-allowed'
                : 'bg-[var(--blue)] text-[#050505] glow-blue'
            )}
          >
            {slotsLeft === 0 ? 'Tournament Full' : `Join Tournament · ${tournament.entryFee}`}
          </motion.button>
        )}
      </div>
    </div>
  )
}
