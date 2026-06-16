'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Clock, Zap, ChevronRight } from 'lucide-react'
import { tournaments } from '@/lib/data'

function useCountdown(target: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [target])

  return timeLeft
}

export function HeroBanner() {
  const featured = tournaments[0]
  const slotsLeft = featured.maxPlayers - featured.registeredPlayers
  const timeLeft = useCountdown(featured.startDate)

  return (
    <div className="px-4 mb-6">
      <Link href={`/tournaments/${featured.id}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          whileTap={{ scale: 0.98 }}
          className="relative rounded-3xl overflow-hidden card-hover"
          style={{ height: 320 }}
        >
          {/* Background image */}
          <Image
            src={featured.cover}
            alt={featured.name}
            fill
            className="object-cover"
            priority
          />

          {/* Cinematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent" />

          {/* Live badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-red-400 pulse-dot" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
          </div>

          {/* Game badge */}
          <div className="absolute top-4 right-4 glass rounded-full px-3 py-1">
            <span className="text-xs font-medium text-white">{featured.game}</span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-xl font-black text-white text-balance mb-2 leading-tight">
              {featured.name}
            </h2>

            {/* Stats row */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-[var(--blue-dim)] flex items-center justify-center">
                  <Zap size={11} className="text-[var(--blue)]" />
                </div>
                <span className="text-xs font-bold text-[var(--blue)]">{featured.prize}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{featured.registeredPlayers}/{featured.maxPlayers} players</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-amber-400">{slotsLeft} slots left</span>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-2 mb-4">
              <Clock size={12} className="text-muted-foreground" />
              <div className="flex items-center gap-1">
                {[
                  { val: timeLeft.days, label: 'd' },
                  { val: timeLeft.hours, label: 'h' },
                  { val: timeLeft.minutes, label: 'm' },
                  { val: timeLeft.seconds, label: 's' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-8 text-center py-1 rounded-lg bg-white/10 text-xs font-mono font-bold text-white">
                      {String(t.val).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{t.label}</span>
                    {i < 3 && <span className="text-muted-foreground text-xs mr-0.5">:</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2">
              <div className="flex-1 py-2.5 rounded-xl bg-[var(--blue)] text-center">
                <span className="text-xs font-bold text-[#050505]">Join Tournament</span>
              </div>
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                <ChevronRight size={16} className="text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  )
}
