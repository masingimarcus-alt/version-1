'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { upcomingMatches } from '@/lib/data'

export function UpcomingMatches() {
  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Upcoming Matches</h3>
        <button className="text-xs text-[var(--blue)]">See all</button>
      </div>

      <div className="space-y-3">
        {upcomingMatches.map((match, i) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.08 }}
            className="glass rounded-2xl p-4 card-hover"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[var(--glass-border)]">
                <Image
                  src={match.opponent.avatar}
                  alt={match.opponent.username}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-white truncate">{match.opponent.username}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--blue-dim)] text-[var(--blue)] font-medium">Lv.{match.opponent.level}</span>
                </div>
                <span className="text-xs text-muted-foreground truncate block">{match.tournament} · {match.round}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-xl bg-[var(--blue)] flex items-center justify-center shrink-0"
              >
                <ChevronRight size={16} className="text-[#050505]" />
              </motion.button>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--glass-border)]">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{match.time}</span>
              </div>
              <div className="ml-auto">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-3)] text-muted-foreground font-medium">{match.platform}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
