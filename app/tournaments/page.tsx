'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Users, Zap, Clock, ChevronRight, Search, Crown,
  TrendingUp, TrendingDown, Minus, Wrench, CheckCircle2,
  Gamepad2, Gamepad, Cpu, Headphones,
} from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { tournaments, leaderboard, repairCategories, repairRequests } from '@/lib/data'
import { cn, formatNumber } from '@/lib/utils'

/* ─── shared tournament status config ─── */
const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  live:     { label: 'Live',     color: 'text-red-400',   bg: 'bg-red-400/10',   dot: 'bg-red-400' },
  upcoming: { label: 'Soon',     color: 'text-amber-400', bg: 'bg-amber-400/10', dot: 'bg-amber-400' },
  full:     { label: 'Full',     color: 'text-muted-foreground', bg: 'bg-[var(--surface-3)]', dot: 'bg-gray-500' },
  finished: { label: 'Finished', color: 'text-muted-foreground', bg: 'bg-[var(--surface-3)]', dot: 'bg-gray-500' },
}

/* ─── leaderboard trophy ─── */
const trophyColors = [
  { text: 'text-amber-400',  bg: 'bg-amber-400/15',  border: 'border-amber-400/30' },
  { text: 'text-slate-300',  bg: 'bg-slate-400/10',  border: 'border-slate-400/20' },
  { text: 'text-orange-400', bg: 'bg-orange-600/10', border: 'border-orange-600/20' },
]

/* ─── repair icons ─── */
const deviceIcons: Record<string, typeof Wrench> = {
  'gamepad-2': Gamepad2,
  gamepad: Gamepad,
  cpu: Cpu,
  headphones: Headphones,
}
const repairStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  'in-progress': { label: 'In Progress', color: 'text-amber-400',   bg: 'bg-amber-400/10' },
  completed:     { label: 'Completed',   color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  pending:       { label: 'Pending',     color: 'text-[var(--blue)]', bg: 'bg-[var(--blue-dim)]' },
}
const timelineSteps = ['Received', 'Diagnosing', 'Repairing', 'Quality Check', 'Ready']

const topLevelTabs = ['Tournaments', 'Leaderboard', 'Repair']
const tournamentFilters = ['All', 'Live', 'Upcoming', 'Free Entry']

/* ═══════════════════════════════════════════════════════════════════════ */

function TournamentsTab() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = tournaments.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.game.toLowerCase().includes(search.toLowerCase())
    if (activeFilter === 'All') return matchSearch
    if (activeFilter === 'Live') return matchSearch && t.status === 'live'
    if (activeFilter === 'Upcoming') return matchSearch && t.status === 'upcoming'
    if (activeFilter === 'Free Entry') return matchSearch && t.entryFee === 'Free'
    return matchSearch
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tournaments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full glass rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-[var(--blue)]/50 border border-transparent transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tournamentFilters.map((f) => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.93 }}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === f ? 'bg-[var(--blue)] text-[#050505]' : 'glass text-muted-foreground'
            }`}
          >
            {f}
          </motion.button>
        ))}
      </div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        {filtered.map((t, i) => {
          const status = statusConfig[t.status]
          const slotsLeft = t.maxPlayers - t.registeredPlayers
          const fillPercent = (t.registeredPlayers / t.maxPlayers) * 100
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link href={`/tournaments/${t.id}`}>
                <motion.div whileTap={{ scale: 0.98 }} className="glass rounded-3xl overflow-hidden card-hover">
                  <div className="relative h-44">
                    <Image src={t.cover} alt={t.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/40 to-transparent" />
                    <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${t.status === 'live' ? 'pulse-dot' : ''}`} />
                      <span className={`text-[11px] font-bold ${status.color}`}>{status.label}</span>
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full glass">
                      <span className="text-[11px] font-semibold text-white">{t.entryFee}</span>
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      <Zap size={13} className="text-[var(--blue)]" />
                      <span className="text-lg font-black text-white">{t.prize}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-base font-bold text-white text-balance leading-tight">{t.name}</h3>
                        <span className="text-xs text-muted-foreground">{t.game} · {t.platform}</span>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-[var(--blue-dim)] flex items-center justify-center shrink-0 mt-0.5">
                        <ChevronRight size={15} className="text-[var(--blue)]" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Users size={12} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{t.registeredPlayers} / {t.maxPlayers} players</span>
                        </div>
                        {slotsLeft > 0
                          ? <span className="text-xs font-semibold text-amber-400">{slotsLeft} slots left</span>
                          : <span className="text-xs font-semibold text-muted-foreground">Full</span>
                        }
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-[var(--blue)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${fillPercent}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.07 }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} className="text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(t.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-[11px]">·</span>
                      <span className="text-[11px] text-muted-foreground">{t.format}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Trophy size={40} className="text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm">No tournaments found</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════ */

function LeaderboardTab() {
  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div>
      {/* Podium */}
      <div className="mb-6">
        <div className="flex items-end justify-center gap-3">
          {/* 2nd */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className={`flex-1 glass rounded-3xl p-4 border ${trophyColors[1].border} text-center`}
          >
            <div className="relative mx-auto w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-400/30 mb-2">
              <Image src={top3[1].avatar} alt={top3[1].username} fill className="object-cover" />
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-400/20 border border-slate-400/40 flex items-center justify-center mx-auto mb-2">
              <span className="text-xs font-black text-slate-300">2</span>
            </div>
            <p className="text-xs font-bold text-white truncate">{top3[1].username}</p>
            <p className={`text-sm font-black mt-1 ${trophyColors[1].text}`}>{top3[1].points}</p>
            <p className="text-[10px] text-muted-foreground">{top3[1].wins} wins</p>
          </motion.div>

          {/* 1st */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className={`flex-1 glass rounded-3xl p-4 border ${trophyColors[0].border} text-center -mb-3 pb-7`}
          >
            <Crown size={16} className="text-amber-400 mx-auto mb-1" />
            <div className="relative mx-auto w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400/40 mb-2"
              style={{ boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}>
              <Image src={top3[0].avatar} alt={top3[0].username} fill className="object-cover" />
            </div>
            <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center mx-auto mb-2">
              <span className="text-xs font-black text-amber-300">1</span>
            </div>
            <p className="text-xs font-bold text-white truncate">{top3[0].username}</p>
            <p className={`text-base font-black mt-1 ${trophyColors[0].text}`}>{top3[0].points}</p>
            <p className="text-[10px] text-muted-foreground">{top3[0].wins} wins</p>
          </motion.div>

          {/* 3rd */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={`flex-1 glass rounded-3xl p-4 border ${trophyColors[2].border} text-center`}
          >
            <div className="relative mx-auto w-14 h-14 rounded-2xl overflow-hidden border-2 border-orange-600/30 mb-2">
              <Image src={top3[2].avatar} alt={top3[2].username} fill className="object-cover" />
            </div>
            <div className="w-7 h-7 rounded-full bg-orange-600/20 border border-orange-600/40 flex items-center justify-center mx-auto mb-2">
              <span className="text-xs font-black text-orange-400">3</span>
            </div>
            <p className="text-xs font-bold text-white truncate">{top3[2].username}</p>
            <p className={`text-sm font-black mt-1 ${trophyColors[2].text}`}>{top3[2].points}</p>
            <p className="text-[10px] text-muted-foreground">{top3[2].wins} wins</p>
          </motion.div>
        </div>
      </div>

      {/* Rest */}
      <div className="space-y-2">
        {rest.map((player, i) => {
          const isCurrentUser = player.userId === 'u1'
          const TrendIcon = player.trend === 'up' ? TrendingUp : player.trend === 'down' ? TrendingDown : Minus
          const trendColor = player.trend === 'up' ? 'text-emerald-400' : player.trend === 'down' ? 'text-red-400' : 'text-muted-foreground'
          return (
            <motion.div
              key={player.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className={cn(
                'glass rounded-2xl p-3 flex items-center gap-3 card-hover',
                isCurrentUser && 'border border-[var(--blue)]/30 bg-[var(--blue-dim)]'
              )}
            >
              <span className="text-sm font-black text-muted-foreground w-6 text-center">{player.rank}</span>
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-[var(--glass-border)] shrink-0">
                <Image src={player.avatar} alt={player.username} width={44} height={44} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn('text-sm font-bold truncate', isCurrentUser ? 'text-[var(--blue)]' : 'text-white')}>
                    {player.username}
                  </span>
                  {isCurrentUser && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--blue)] text-[#050505] font-bold">YOU</span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">Lv.{player.level} · {player.wins} wins</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendIcon size={13} className={trendColor} />
                <div className="text-right">
                  <p className="text-sm font-black text-white">{ formatNumber(player.points) }</p>
                  <p className="text-[10px] text-muted-foreground">pts</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════ */

function RepairTab() {
  const [step, setStep] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const category = repairCategories.find((c) => c.id === selectedCategory)

  const handleSubmit = () => {
    if (!selectedCategory || !selectedService) return
    setSubmitted(true)
  }

  return (
    <div>
      {/* Active requests */}
      {repairRequests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-white mb-3">Active Requests</h3>
          <div className="space-y-3">
            {repairRequests.map((req) => {
              const status = repairStatusConfig[req.status]
              const stepIdx = req.status === 'completed' ? 4 : req.status === 'in-progress' ? 2 : 0
              return (
                <div key={req.id} className="glass rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-sm font-bold text-white">{req.device}</p>
                      <p className="text-xs text-muted-foreground">{req.issue}</p>
                    </div>
                    <span className={cn('text-[11px] px-2.5 py-1 rounded-full font-semibold', status.bg, status.color)}>
                      {status.label}
                    </span>
                  </div>
                  {/* Timeline */}
                  <div className="flex items-center gap-1 mb-3">
                    {timelineSteps.map((s, i) => (
                      <div key={s} className="flex items-center flex-1">
                        <div className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                          i <= stepIdx ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]'
                        )}>
                          {i <= stepIdx
                            ? <CheckCircle2 size={11} className="text-[#050505]" />
                            : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />}
                        </div>
                        {i < timelineSteps.length - 1 && (
                          <div className={cn('flex-1 h-0.5 mx-0.5', i < stepIdx ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]')} />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {timelineSteps[stepIdx]} — Est. {req.estimated} · Tech: {req.technician}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* New request form */}
      <h3 className="text-sm font-bold text-white mb-3">New Repair Request</h3>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 text-center"
          >
            <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-black text-white mb-2">Request Submitted!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Your repair request for <strong className="text-white">{category?.name}</strong> — {selectedService} has been received. A technician will contact you within 24 hours.
            </p>
            <div className="glass rounded-xl p-3 text-left space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Device</span>
                <span className="text-xs font-bold text-white">{category?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Service</span>
                <span className="text-xs font-bold text-white">{selectedService}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Est. Time</span>
                <span className="text-xs font-bold text-amber-400">2-5 business days</span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSubmitted(false); setSelectedCategory(''); setSelectedService(''); setDescription('') }}
              className="w-full py-3 rounded-xl bg-[var(--surface-3)] text-white text-sm font-bold"
            >
              Submit Another Request
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Device categories */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">1. Select Device</p>
              <div className="grid grid-cols-2 gap-2">
                {repairCategories.map((cat) => {
                  const Icon = deviceIcons[cat.icon] ?? Wrench
                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedCategory(cat.id); setSelectedService('') }}
                      className={cn(
                        'glass rounded-xl p-4 flex items-center gap-3 transition-all text-left',
                        selectedCategory === cat.id && 'border border-[var(--blue)]/50 bg-[var(--blue-dim)]'
                      )}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                        selectedCategory === cat.id ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]'
                      )}>
                        <Icon size={16} className={selectedCategory === cat.id ? 'text-[#050505]' : 'text-muted-foreground'} />
                      </div>
                      <span className={cn('text-xs font-bold', selectedCategory === cat.id ? 'text-white' : 'text-muted-foreground')}>
                        {cat.name}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Services */}
            <AnimatePresence>
              {category && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className="text-xs font-semibold text-muted-foreground mb-2">2. Select Service</p>
                  <div className="space-y-2">
                    {category.services.map((service) => (
                      <motion.button
                        key={service}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedService(service)}
                        className={cn(
                          'w-full glass rounded-xl p-3 flex items-center justify-between transition-all',
                          selectedService === service && 'border border-[var(--blue)]/50'
                        )}
                      >
                        <span className="text-xs text-white font-medium">{service}</span>
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          selectedService === service ? 'border-[var(--blue)] bg-[var(--blue)]' : 'border-[var(--glass-border)]'
                        )}>
                          {selectedService === service && <CheckCircle2 size={11} className="text-[#050505]" />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description */}
            {selectedService && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">3. Describe the issue (optional)</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details about the problem..."
                  rows={3}
                  className="w-full glass rounded-xl p-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors resize-none"
                />
              </motion.div>
            )}

            {/* Guarantees */}
            <div className="glass rounded-xl p-4 space-y-2">
              {[
                'Certified technicians with 2+ years experience',
                '30-day warranty on all repairs',
                'Free diagnostic assessment',
              ].map((g) => (
                <div key={g} className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span className="text-xs text-muted-foreground">{g}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!selectedCategory || !selectedService}
              onClick={handleSubmit}
              className={cn(
                'w-full py-4 rounded-2xl font-bold text-sm transition-all',
                selectedCategory && selectedService
                  ? 'bg-[var(--blue)] text-[#050505] glow-blue'
                  : 'bg-[var(--surface-3)] text-muted-foreground cursor-not-allowed'
              )}
            >
              Submit Repair Request
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════ */

export default function CompetePage() {
  const [activeTab, setActiveTab] = useState('Tournaments')

  const tabIcons: Record<string, typeof Trophy> = {
    Tournaments: Trophy,
    Leaderboard: Crown,
    Repair: Wrench,
  }

  return (
    <PageShell>
      {/* Header */}
      <div className="px-4 pt-14 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black text-white">Compete</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Tournaments · Rankings · Support</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--blue-dim)] border border-[var(--blue)]/30 flex items-center justify-center">
            <Trophy size={18} className="text-[var(--blue)]" />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 glass rounded-2xl p-1">
          {topLevelTabs.map((tab) => {
            const Icon = tabIcons[tab]
            return (
              <motion.button
                key={tab}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                  activeTab === tab ? 'bg-[var(--blue)] text-[#050505]' : 'text-muted-foreground'
                )}
              >
                <Icon size={13} />
                {tab}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Tournaments' && <TournamentsTab />}
            {activeTab === 'Leaderboard' && <LeaderboardTab />}
            {activeTab === 'Repair' && <RepairTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageShell>
  )
}
