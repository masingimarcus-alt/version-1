'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bell, Settings, Shield, ChevronRight } from 'lucide-react'
import { currentUser } from '@/lib/data'
import { AnimatedCounter } from '@/components/animated-counter'
import { formatNumber } from '@/lib/utils'

const rankColors: Record<string, string> = {
  Bronze: 'text-amber-600',
  Silver: 'text-slate-400',
  Gold: 'text-amber-400',
  Platinum: 'text-cyan-400',
  Diamond: 'text-[var(--blue)]',
  Master: 'text-purple-400',
  Legend: 'text-yellow-300',
}

export function UserHeader() {
  const xpPercent = (currentUser.xp / currentUser.xpNext) * 100

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <Link href="/profile">
          <motion.div
            className="flex items-center gap-3"
            whileTap={{ scale: 0.97 }}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[var(--glass-border)] glow-blue">
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--surface-2)] border border-[var(--glass-border)] flex items-center justify-center">
                <span className="text-[8px] font-bold text-[var(--blue)]">{currentUser.level}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">{currentUser.username}</span>
                {currentUser.role === 'admin' && (
                  <Shield size={12} className="text-[var(--blue)]" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">{currentUser.city}, {currentUser.country}</span>
            </div>
          </motion.div>
        </Link>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-xl glass flex items-center justify-center relative"
          >
            <Bell size={18} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--blue)] pulse-dot" />
          </motion.button>
          <Link href="/admin">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center"
            >
              <Settings size={18} className="text-muted-foreground" />
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Rank & XP card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 border-gradient-blue"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${rankColors[currentUser.rank] ?? 'text-white'}`}>
              {currentUser.rank}
            </span>
            <span className="text-xs text-muted-foreground">Tier</span>
          </div>
          <Link href="/profile" className="flex items-center gap-1 text-xs text-muted-foreground">
            View Profile <ChevronRight size={12} />
          </Link>
        </div>

        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-xs text-muted-foreground">Level</span>
            <div className="text-2xl font-black text-white gradient-text">
              <AnimatedCounter target={currentUser.level} />
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">XP</span>
            <div className="text-sm font-bold text-white">
              <AnimatedCounter target={currentUser.xp} /> / {formatNumber(currentUser.xpNext)}
            </div>
          </div>
        </div>

        <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
          <motion.div
            className="h-full rounded-full xp-bar"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">{xpPercent.toFixed(0)}% to next level</span>
          <span className="text-[10px] text-muted-foreground">{formatNumber(currentUser.xpNext - currentUser.xp)} XP needed</span>
        </div>
      </motion.div>
    </div>
  )
}
