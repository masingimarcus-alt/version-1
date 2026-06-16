'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { leaderboard } from '@/lib/data'
import { cn, formatNumber } from '@/lib/utils'

const trophyColors = [
  { text: 'text-[var(--gold)]',   bg: 'bg-amber-400/15',  border: 'border-amber-400/30',  glow: 'shadow-amber-400/20' },
  { text: 'text-[var(--silver)]', bg: 'bg-slate-400/10',  border: 'border-slate-400/20',  glow: 'shadow-slate-400/10' },
  { text: 'text-[var(--bronze)]', bg: 'bg-orange-600/10', border: 'border-orange-600/20', glow: 'shadow-orange-600/10' },
]

export default function LeaderboardPage() {
  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <PageShell>
      {/* Header */}
      <div className="px-4 pt-14 pb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-black text-white">Leaderboard</h1>
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Crown size={18} className="text-amber-400" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Global rankings — Season 1</p>
      </div>

      {/* Podium — top 3 */}
      <div className="px-4 mb-8">
        <div className="flex items-end justify-center gap-3">
          {/* 2nd */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`flex-1 glass rounded-3xl p-4 border ${trophyColors[1].border} text-center shadow-lg ${trophyColors[1].glow}`}
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

          {/* 1st — taller */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`flex-1 glass rounded-3xl p-4 border ${trophyColors[0].border} text-center shadow-xl ${trophyColors[0].glow} -mb-3 pb-7`}
          >
            <Crown size={16} className="text-amber-400 mx-auto mb-1" />
            <div className="relative mx-auto w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400/40 mb-2" style={{ boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}>
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`flex-1 glass rounded-3xl p-4 border ${trophyColors[2].border} text-center shadow-lg ${trophyColors[2].glow}`}
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

      {/* Rest of leaderboard */}
      <div className="px-4 space-y-2">
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
                  {isCurrentUser && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--blue)] text-[#050505] font-bold">YOU</span>}
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
    </PageShell>
  )
}
