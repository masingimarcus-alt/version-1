'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, UserPlus } from 'lucide-react'
import { addParticipant } from '@/app/actions/tournaments'

const fieldClass =
  'w-full glass rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors'

export function AddPlayersModal({
  tournamentId,
  onClose,
  onAdded,
}: {
  tournamentId: string
  onClose: () => void
  onAdded: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [platform, setPlatform] = useState('PS5')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const submit = (keepOpen: boolean) => {
    setError(null)
    if (!name.trim()) {
      setError('Player name is required')
      return
    }
    startTransition(async () => {
      try {
        await addParticipant(tournamentId, { name, email, platform })
        onAdded()
        if (keepOpen) {
          setName('')
          setEmail('')
        } else {
          onClose()
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to add player')
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full glass border-t border-[var(--glass-border)] rounded-t-3xl p-5 pb-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white">Add Player</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center"
            aria-label="Close"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-white mb-1.5 block">Name</label>
            <input
              className={fieldClass}
              placeholder="Player name or gamertag"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-bold text-white mb-1.5 block">Email</label>
            <input
              type="email"
              className={fieldClass}
              placeholder="player@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-white mb-1.5 block">Platform</label>
            <input
              className={fieldClass}
              placeholder="PS5 / Xbox / PC"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2 pt-1">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => submit(true)}
              disabled={isPending}
              className="flex-1 py-3.5 rounded-2xl glass text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              Add &amp; Another
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => submit(false)}
              disabled={isPending}
              className="flex-1 py-3.5 rounded-2xl bg-[var(--blue)] text-[#050505] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              Add Player
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
