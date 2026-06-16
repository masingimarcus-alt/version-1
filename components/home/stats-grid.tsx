'use client'

import { motion } from 'framer-motion'
import { Swords, TrendingUp, Trophy, Star } from 'lucide-react'
import { currentUser } from '@/lib/data'
import { AnimatedCounter } from '@/components/animated-counter'

const stats = [
  {
    label: 'Matches',
    value: currentUser.stats.matchesPlayed,
    icon: Swords,
    color: 'text-[var(--blue)]',
    bg: 'bg-[var(--blue-dim)]',
    suffix: '',
  },
  {
    label: 'Win Rate',
    value: currentUser.stats.winRate,
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    suffix: '%',
    decimals: 1,
  },
  {
    label: 'Tournaments',
    value: currentUser.stats.tournamentsPlayed,
    icon: Trophy,
    color: 'text-[var(--gold)]',
    bg: 'bg-amber-400/10',
    suffix: '',
  },
  {
    label: 'Trophies',
    value: currentUser.stats.trophiesWon,
    icon: Star,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    suffix: '',
  },
]

export function StatsGrid() {
  return (
    <div className="px-4 mb-6">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.07 }}
            className="glass rounded-2xl p-4 card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={16} className={stat.color} />
              </div>
            </div>
            <div className={`text-2xl font-black ${stat.color}`}>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
