'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Trophy, ShoppingBag, ChevronRight, Zap, Users } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { LogoHeader } from '@/components/logo-header'
import { currentUser } from '@/lib/data'
import { getRentalConsoles } from '@/app/actions/rentals'
import { getPublicTournaments } from '@/app/actions/tournaments'
import { getAvailableProducts, type ProductRow } from '@/app/actions/products'
import { cn, formatNumber } from '@/lib/utils'

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

type Competition = {
  id: string
  name: string
  game: string | null
  platform: string | null
  status: string | null
  format: string | null
  maxParticipants: number | null
  prizePool: string | null
  cover: string | null
  participantCount: number
}

// Map DB tournament status to the home badge. Only open + live are shown.
const compBadge = (status: string | null) =>
  status === 'in_progress'
    ? { label: 'LIVE', text: 'text-green-400', border: 'border-green-500/40', bg: 'bg-green-500/20' }
    : { label: 'OPEN', text: 'text-[var(--blue)]', border: 'border-[var(--blue)]/40', bg: 'bg-[var(--blue)]/20' }

const formatLabel = (f: string | null) =>
  f === 'double_elimination' ? 'Double Elim' : 'Single Elim'

export default function HomePage() {
  const [consoles, setConsoles] = useState<RentalConsole[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRentalConsoles().then((data) => {
      setConsoles(data as RentalConsole[])
      setLoading(false)
    })
    getPublicTournaments()
      .then((data) => setCompetitions(data as Competition[]))
      .catch(() => setCompetitions([]))
    getAvailableProducts()
      .then((data) => setProducts(data as ProductRow[]))
      .catch(() => setProducts([]))
  }, [])

  const availableConsoles  = consoles.filter((c) => c.available)
  // Only admin-posted competitions that are open for registration or currently live.
  const activeCompetitions = competitions
    .filter((t) => t.status === 'registration' || t.status === 'in_progress')
    .slice(0, 3)
  const featuredProducts   = products.slice(0, 4)

  return (
    <PageShell>
      <LogoHeader />

      <div className="px-4 space-y-6 pb-6">

        {/* Welcome hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl overflow-hidden relative"
        >
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--blue)]/10 via-transparent to-transparent" />
          <div className="relative px-5 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[var(--blue)]/30 shrink-0">
                <Image src={currentUser.avatar} alt={currentUser.username} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Welcome back,</p>
                <h1 className="text-lg font-black text-white truncate">{currentUser.username}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--blue-dim)]">
                    <Zap size={10} className="text-[var(--blue)]" />
                    <span className="text-[10px] font-bold text-[var(--blue)]">Lv {currentUser.level}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{currentUser.rank}</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-muted-foreground">{formatNumber(currentUser.xp)} XP</span>
                <span className="text-[10px] text-muted-foreground">Next: {formatNumber(currentUser.xpNext)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentUser.xp / currentUser.xpNext) * 100}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full bg-[var(--blue)]"
                  style={{ boxShadow: '0 0 8px var(--blue)' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Available Consoles Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gamepad2 size={16} className="text-[var(--blue)]" />
              <h2 className="text-sm font-bold text-white">Available Consoles</h2>
            </div>
            <Link href="/rental" className="flex items-center gap-1 text-xs text-[var(--blue)] font-semibold">
              View All <ChevronRight size={12} />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {availableConsoles.map((console, idx) => (
              <motion.div
                key={console.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="shrink-0 w-40"
              >
                <Link href="/rental">
                  <div className="glass rounded-2xl p-3 border border-[var(--glass-border)] hover:border-[var(--blue)]/30 transition-colors">
                    <div className="relative h-24 mb-2 rounded-xl overflow-hidden bg-[var(--surface-2)]">
                      {console.image && (
                        <Image
                          src={console.image}
                          alt={console.name}
                          fill
                          className="object-contain p-2"
                        />
                      )}
                      <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-green-500/20 border border-green-500/40">
                        <span className="text-[9px] font-bold text-green-400">AVAILABLE</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-white truncate">{console.name}</p>
                    <p className="text-[10px] text-muted-foreground">{console.model}</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-sm font-bold text-[var(--blue)]">{console.pricePerHour}</span>
                      <span className="text-[10px] text-muted-foreground">TL/hr</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Active Competitions Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-[var(--blue)]" />
              <h2 className="text-sm font-bold text-white">Active Competitions</h2>
            </div>
            <Link href="/tournaments" className="flex items-center gap-1 text-xs text-[var(--blue)] font-semibold">
              View All <ChevronRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {activeCompetitions.length === 0 ? (
              <div className="glass rounded-2xl p-6 text-center border border-[var(--glass-border)]">
                <Trophy size={24} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-xs text-muted-foreground">No competitions available right now.</p>
              </div>
            ) : (
              activeCompetitions.map((tournament, idx) => {
                const badge = compBadge(tournament.status)
                return (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link href={`/tournaments/${tournament.id}`}>
                      <div className="glass rounded-2xl overflow-hidden border border-[var(--glass-border)] hover:border-[var(--blue)]/30 transition-colors">
                        <div className="flex gap-3 p-3">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[var(--surface-2)] shrink-0">
                            <Image
                              src={tournament.cover || '/placeholder.svg'}
                              alt={tournament.name}
                              fill
                              className="object-cover"
                            />
                            <div className={cn('absolute top-1 left-1 px-1.5 py-0.5 rounded-md border', badge.bg, badge.border)}>
                              <span className={cn('text-[8px] font-bold', badge.text)}>{badge.label}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{tournament.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{tournament.game}</p>
                            <div className="flex items-center gap-3 mt-2">
                              {tournament.prizePool && (
                                <div className="flex items-center gap-1">
                                  <Zap size={10} className="text-[var(--blue)]" />
                                  <span className="text-[10px] font-semibold text-[var(--blue)]">{tournament.prizePool}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users size={10} className="text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">{tournament.participantCount}/{tournament.maxParticipants ?? '—'}</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">{tournament.platform ?? 'PS5'} - {formatLabel(tournament.format)}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })
            )}
          </div>
        </section>

        {/* Gaming Products Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-[var(--blue)]" />
              <h2 className="text-sm font-bold text-white">Gaming Products</h2>
            </div>
            <Link href="/marketplace" className="flex items-center gap-1 text-xs text-[var(--blue)] font-semibold">
              View All <ChevronRight size={12} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center border border-[var(--glass-border)]">
              <ShoppingBag size={24} className="text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-xs text-muted-foreground">No products available right now.</p>
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href="/marketplace">
                  <div className="glass rounded-2xl p-3 border border-[var(--glass-border)] hover:border-[var(--blue)]/30 transition-colors">
                    <div className="relative h-24 mb-2 rounded-xl overflow-hidden bg-[var(--surface-2)]">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                      {item.verified && (
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-[var(--blue)]/20 border border-[var(--blue)]/40">
                          <span className="text-[8px] font-bold text-[var(--blue)]">VERIFIED</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.condition}</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-sm font-bold text-[var(--blue)]">{formatNumber(item.price)}</span>
                      <span className="text-[10px] text-muted-foreground">TL</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          )}
        </section>
      </div>
    </PageShell>
  )
}
