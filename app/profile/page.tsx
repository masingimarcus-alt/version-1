'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, QrCode, Edit2, Trophy, Swords, TrendingUp, Star, Shield, Flame, Diamond, CheckCircle2 } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { currentUser, matchHistory, achievements } from '@/lib/data'
import { AnimatedCounter } from '@/components/animated-counter'
import { useSession } from '@/lib/auth-client'
import { ProfileEditModal, type ProfileEditValues } from '@/components/profile/profile-edit-modal'
import { cn, formatNumber } from '@/lib/utils'

const tabs = ['Stats', 'History', 'Trophies']

const achievementIcons: Record<string, typeof Trophy> = {
  trophy: Trophy,
  sword: Swords,
  flame: Flame,
  diamond: Diamond,
  star: Star,
  shield: Shield,
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Stats')
  const xpPercent = (currentUser.xp / currentUser.xpNext) * 100

  const { data: session } = useSession()
  const sessionUser = session?.user as
    | { name?: string; image?: string; location?: string; bio?: string; role?: string }
    | undefined

  const [edits, setEdits] = useState<ProfileEditValues | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  // Display values: prefer locally saved edits, then session, then mock fallback
  const displayName = edits?.name ?? sessionUser?.name ?? currentUser.username
  const displayAvatar = edits?.image ?? sessionUser?.image ?? currentUser.avatar
  const displayLocation =
    edits?.location ?? sessionUser?.location ?? `${currentUser.city}, ${currentUser.country}`
  const displayBio = edits?.bio ?? sessionUser?.bio ?? currentUser.bio
  const isAdmin = sessionUser?.role === 'admin' || sessionUser?.role === 'super_admin'

  return (
    <PageShell>
      {/* Header bg */}
      <div className="relative">
        <div className="h-36 bg-gradient-to-br from-[var(--blue)]/20 via-[var(--purple)]/10 to-transparent" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* QR button */}
        <Link href={`/profile/qr`} className="absolute top-12 right-4">
          <motion.div whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <QrCode size={18} className="text-[var(--blue)]" />
          </motion.div>
        </Link>
      </div>

      <div className="px-4 -mt-12 pb-6">
        {/* Avatar + info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-[var(--blue)]/40 glow-blue">
              <Image src={displayAvatar} alt={displayName} width={80} height={80} className="object-cover w-full h-full" />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[var(--blue)] border-2 border-[#050505] flex items-center justify-center">
              <span className="text-[9px] font-black text-[#050505]">{currentUser.level}</span>
            </div>
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-xl font-black text-white">{displayName}</h2>
              {isAdmin && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--blue-dim)] text-[var(--blue)] font-bold">
                  {sessionUser?.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={11} />
              <span>{displayLocation}</span>
            </div>
            <div className="text-xs text-[var(--blue)] font-semibold mt-0.5">{currentUser.rank} · #{leaderboardRank()}</div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setEditOpen(true)}
            className="w-9 h-9 rounded-xl glass flex items-center justify-center mb-1"
            aria-label="Edit profile"
          >
            <Edit2 size={15} className="text-muted-foreground" />
          </motion.button>
        </motion.div>

        {/* Bio */}
        <div className="glass rounded-xl px-4 py-3 mb-4">
          <p className="text-xs text-muted-foreground leading-relaxed">{displayBio}</p>
        </div>

        {/* XP Progress */}
        <div className="glass rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">Level {currentUser.level}</span>
            <span className="text-xs text-muted-foreground">{ formatNumber(currentUser.xp) } / { formatNumber(currentUser.xpNext) } XP</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
            <motion.div
              className="h-full rounded-full xp-bar"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-2xl p-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-semibold transition-all',
                activeTab === tab ? 'bg-[var(--blue)] text-[#050505]' : 'text-muted-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === 'Stats' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Matches Played', value: currentUser.stats.matchesPlayed, color: 'text-[var(--blue)]' },
                { label: 'Win Rate', value: currentUser.stats.winRate, suffix: '%', decimals: 1, color: 'text-emerald-400' },
                { label: 'Wins', value: currentUser.stats.wins, color: 'text-emerald-400' },
                { label: 'Losses', value: currentUser.stats.losses, color: 'text-red-400' },
                { label: 'Tournaments', value: currentUser.stats.tournamentsPlayed, color: 'text-amber-400' },
                { label: 'Trophies', value: currentUser.stats.trophiesWon, color: 'text-amber-400' },
                { label: 'Goals', value: currentUser.stats.goals, color: 'text-purple-400' },
                { label: 'Assists', value: currentUser.stats.assists, color: 'text-purple-400' },
              ].map((s) => (
                <div key={s.label} className="glass rounded-xl p-4">
                  <p className="text-[10px] text-muted-foreground mb-1">{s.label}</p>
                  <p className={`text-xl font-black ${s.color}`}>
                    <AnimatedCounter target={s.value} suffix={s.suffix} decimals={s.decimals} />
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'History' && (
            <div className="space-y-2">
              {matchHistory.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass rounded-xl p-3 flex items-center gap-3"
                >
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs',
                    m.result === 'win' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                  )}>
                    {m.result === 'win' ? 'W' : 'L'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">vs {m.opponent}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{m.tournament}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">{m.score}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'Trophies' && (
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((ach, i) => {
                const Icon = achievementIcons[ach.icon] ?? Trophy
                return (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className={cn(
                      'glass rounded-2xl p-4 text-center',
                      !ach.unlocked && 'opacity-40 grayscale'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2',
                      ach.unlocked ? 'bg-[var(--blue-dim)]' : 'bg-[var(--surface-3)]'
                    )}>
                      <Icon size={22} className={ach.unlocked ? 'text-[var(--blue)]' : 'text-muted-foreground'} />
                    </div>
                    <p className="text-xs font-bold text-white mb-0.5">{ach.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{ach.description}</p>
                    {ach.unlocked && ach.date && (
                      <p className="text-[9px] text-[var(--blue)] mt-1">{new Date(ach.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {editOpen && (
          <ProfileEditModal
            initial={{
              name: displayName,
              location: displayLocation,
              bio: displayBio,
              image: displayAvatar,
            }}
            onClose={() => setEditOpen(false)}
            onSaved={(values) => setEdits(values)}
          />
        )}
      </AnimatePresence>
    </PageShell>
  )
}

function leaderboardRank() {
  return 4
}
