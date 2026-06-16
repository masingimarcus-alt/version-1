'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Swords, Trophy, Star, TrendingUp, Zap, Shield } from 'lucide-react'
import { activityFeed } from '@/lib/data'

const typeConfig: Record<string, { icon: typeof Swords; color: string; bg: string }> = {
  win: { icon: Swords, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  tournament: { icon: Trophy, color: 'text-[var(--blue)]', bg: 'bg-[var(--blue-dim)]' },
  level: { icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  xp: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  trophy: { icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  achievement: { icon: Shield, color: 'text-[var(--blue)]', bg: 'bg-[var(--blue-dim)]' },
}

export function ActivityFeed() {
  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Activity</h3>
        <button className="text-xs text-[var(--blue)]">See all</button>
      </div>

      <div className="space-y-2">
        {activityFeed.map((item, i) => {
          const config = typeConfig[item.type] ?? typeConfig.xp
          const Icon = config.icon

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="glass rounded-xl p-3 flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-medium leading-relaxed truncate">{item.message}</p>
                <span className="text-[10px] text-muted-foreground">{item.time}</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Zap size={10} className="text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400">+{item.xp}</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
