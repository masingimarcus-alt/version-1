'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createTournament,
  updateTournament,
  type TournamentStatus,
  type TournamentFormat,
} from '@/app/actions/tournaments'

export type TournamentFormInitial = {
  id: string
  name: string
  description: string
  status: TournamentStatus
  format: TournamentFormat
  maxParticipants: number
  platform: string
  prizePool: string
  logoUrl: string
  cover: string
  rules: string
  registrationDeadline: string
  startDate: string
  endDate: string
}

const STATUS_OPTIONS: { value: TournamentStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'registration', label: 'Registration' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const FORMAT_OPTIONS: {
  value: TournamentFormat
  label: string
  helper: string
}[] = [
  {
    value: 'single_elimination',
    label: 'Single Elimination',
    helper: 'One loss and a player is out. Fastest format.',
  },
  {
    value: 'double_elimination',
    label: 'Double Elimination',
    helper: 'Players get a second chance in the losers bracket before elimination.',
  },
]

const fieldClass =
  'w-full glass rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold text-white mb-1.5 block">{children}</label>
}

export function TournamentForm({ initial }: { initial?: TournamentFormInitial | null }) {
  const isEdit = Boolean(initial)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<TournamentStatus>(initial?.status ?? 'draft')
  const [format, setFormat] = useState<TournamentFormat>(
    initial?.format ?? 'single_elimination',
  )
  const [maxParticipants, setMaxParticipants] = useState(initial?.maxParticipants ?? 16)
  const [platform, setPlatform] = useState(initial?.platform ?? 'PS5')
  const [prizePool, setPrizePool] = useState(initial?.prizePool ?? '')
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? '')
  const [rules, setRules] = useState(initial?.rules ?? '')
  const [registrationDeadline, setRegistrationDeadline] = useState(
    initial?.registrationDeadline ?? '',
  )
  const [startDate, setStartDate] = useState(initial?.startDate ?? '')
  const [endDate, setEndDate] = useState(initial?.endDate ?? '')

  const activeFormat = FORMAT_OPTIONS.find((f) => f.value === format)!

  const handleSubmit = () => {
    setError(null)
    if (!name.trim()) {
      setError('Tournament name is required')
      return
    }
    startTransition(async () => {
      try {
        const payload = {
          name,
          description,
          status,
          format,
          maxParticipants: Number(maxParticipants) || 2,
          platform,
          prizePool,
          logoUrl,
          rules,
          registrationDeadline,
          startDate,
          endDate,
        }
        if (isEdit && initial) {
          await updateTournament(initial.id, payload)
          router.push(`/admin/tournaments/${initial.id}`)
        } else {
          const id = await createTournament(payload)
          router.push(`/admin/tournaments/${id}`)
        }
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save tournament')
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#050505] grid-pattern pb-24">
      <div className="px-4 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/admin?section=Tournaments">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center"
            >
              <ArrowLeft size={18} className="text-white" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-xl font-black text-white">
              {isEdit ? 'Edit Tournament' : 'Create Tournament'}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Set up details, format, and schedule
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Basic Information */}
        <Section title="Basic Information">
          <div>
            <Label>Name *</Label>
            <input
              className={fieldClass}
              placeholder="EA Sports FC 26 Champions Cup"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              rows={3}
              className={cn(fieldClass, 'resize-none')}
              placeholder="Tell players what this tournament is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <select
                className={fieldClass}
                value={status}
                onChange={(e) => setStatus(e.target.value as TournamentStatus)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#0d0d0f]">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Max Participants</Label>
              <input
                type="number"
                min={2}
                className={fieldClass}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label>Platform</Label>
            <input
              className={fieldClass}
              placeholder="PS5 / Xbox / PC"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />
          </div>
          <div>
            <Label>Format</Label>
            <div className="grid grid-cols-2 gap-2">
              {FORMAT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setFormat(o.value)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
                    format === o.value
                      ? 'bg-[var(--blue)] text-[#050505]'
                      : 'glass text-muted-foreground',
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex items-start gap-2 mt-2">
              <Info size={13} className="text-[var(--blue)] mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {activeFormat.helper}
              </p>
            </div>
          </div>
        </Section>

        {/* Schedule */}
        <Section title="Schedule">
          <div>
            <Label>Registration Deadline</Label>
            <input
              type="date"
              className={fieldClass}
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date</Label>
              <input
                type="date"
                className={fieldClass}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <input
                type="date"
                className={fieldClass}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </Section>

        {/* Prize & Branding */}
        <Section title="Prize & Branding">
          <div>
            <Label>Prize Pool</Label>
            <input
              className={fieldClass}
              placeholder="$5,000"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
            />
          </div>
          <div>
            <Label>Logo / Cover Image URL</Label>
            <input
              className={fieldClass}
              placeholder="/images/tournament-fifa.png or https://..."
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>
        </Section>

        {/* Rules */}
        <Section title="Rules">
          <textarea
            rows={5}
            className={cn(fieldClass, 'resize-none')}
            placeholder={'One rule per line, e.g.\n4-minute halves\nNo custom tactics exploits\nNo rage quitting'}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">One rule per line.</p>
        </Section>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-2">
          <Link href="/admin?section=Tournaments" className="flex-1">
            <button className="w-full py-3.5 rounded-2xl glass text-sm font-bold text-muted-foreground">
              Cancel
            </button>
          </Link>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 py-3.5 rounded-2xl bg-[var(--blue)] text-[#050505] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Tournament'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
