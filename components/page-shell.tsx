'use client'

import { motion } from 'framer-motion'
import { BottomNav } from '@/components/bottom-nav'

interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className="min-h-screen bg-[#050505] grid-pattern">
      <motion.main
        className={`pb-24 ${className ?? ''}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {children}
      </motion.main>
      <BottomNav />
    </div>
  )
}
