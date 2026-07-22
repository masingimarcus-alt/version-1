'use client'

import { useState, useTransition } from 'react'
import { Trophy, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Participant, Match } from '@/app/actions/tournaments'
import { updateMatchScore } from '@/app/actions/tournaments'

type BracketProps = {
  participants: Participant[]
  matches: Match[]
  editable?: boolean
  onScored?: () => void
}

function roundName(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round
  if (fromEnd === 0) return 'Finals'
  if (fromEnd === 1) return 'Semi-Finals'
  if (fromEnd === 2) return 'Quarter-Finals'
  return `Round ${round}`
}

export function Bracket({ participants, matches, editable = false, onScored }: BracketProps) {
  const nameOf = (id: string | null) => {
    if (!id) return null
    return participants.find((p) => p.id === id)?.name ?? 'Unknown'
  }

  if (matches.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <Trophy size={40} className="text-[var(--blue)] mx-auto mb-3 opacity-60" />
        <p className="text-sm font-bold text-white mb-1">No bracket yet</p>
        <p className="text-xs text-muted-foreground">
          {editable
            ? 'Add confirmed participants and click Generate Bracket.'
            : 'The bracket will appear once the organizer generates it.'}
        </p>
      </div>
    )
  }

  const winners = matches.filter((m) => m.bracket === 'winners')
  const losers = matches.filter((m) => m.bracket === 'losers')
  const grandFinal = matches.filter((m) => m.bracket === 'grand_final')

  const winnersRounds = Math.max(...winners.map((m) => m.round), 0)
  const losersRounds = losers.length ? Math.max(...losers.map((m) => m.round)) : 0

  const renderColumns = (
    group: Match[],
    totalRounds: number,
    labelFn: (r: number) => string,
  ) => {
    const rounds = Array.from(new Set(group.map((m) => m.round))).sort((a, b) => a - b)
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        {rounds.map((r) => {
          const roundMatches = group
            .filter((m) => m.round === r)
            .sort((a, b) => a.matchNumber - b.matchNumber)
          return (
            <div key={r} className="shrink-0 w-56 space-y-3">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                {labelFn(r)}
              </p>
              {roundMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  p1Name={nameOf(m.participant1Id)}
                  p2Name={nameOf(m.participant2Id)}
                  editable={editable}
                  onScored={onScored}
                />
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        {(losers.length > 0 || grandFinal.length > 0) && (
          <p className="text-xs font-black text-[var(--blue)] mb-3">Winners Bracket</p>
        )}
        {renderColumns(winners, winnersRounds, (r) => roundName(r, winnersRounds))}
      </div>

      {losers.length > 0 && (
        <div>
          <p className="text-xs font-black text-amber-400 mb-3">Losers Bracket</p>
          {renderColumns(losers, losersRounds, (r) => `LB Round ${r}`)}
        </div>
      )}

      {grandFinal.length > 0 && (
        <div>
          <p className="text-xs font-black text-emerald-400 mb-3">Grand Final</p>
          {renderColumns(grandFinal, 1, () => 'Grand Final')}
        </div>
      )}
    </div>
  )
}

function MatchCard({
  match,
  p1Name,
  p2Name,
  editable,
  onScored,
}: {
  match: Match
  p1Name: string | null
  p2Name: string | null
  editable: boolean
  onScored?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [s1, setS1] = useState(match.score1 ?? 0)
  const [s2, setS2] = useState(match.score2 ?? 0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const completed = match.status === 'completed'
  const bothSet = !!match.participant1Id && !!match.participant2Id
  const canScore = editable && bothSet

  const save = () => {
    setError(null)
    if (s1 === s2) {
      setError('No draws')
      return
    }
    startTransition(async () => {
      try {
        await updateMatchScore(match.id, Number(s1), Number(s2))
        setOpen(false)
        onScored?.()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed')
      }
    })
  }

  const Row = ({
    name,
    score,
    isWinner,
    isBye,
  }: {
    name: string | null
    score: number | null
    isWinner: boolean
    isBye: boolean
  }) => (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2',
        isWinner && 'bg-[var(--blue-dim)]',
      )}
    >
      <span
        className={cn(
          'text-xs truncate',
          isWinner ? 'text-[var(--blue)] font-bold' : 'text-white',
          !name && 'text-muted-foreground italic',
        )}
      >
        {name ?? (isBye ? 'BYE' : 'TBD')}
      </span>
      <span className="flex items-center gap-1.5 shrink-0">
        {isWinner && <Check size={12} className="text-[var(--blue)]" />}
        <span
          className={cn(
            'text-xs font-black w-4 text-right',
            isWinner ? 'text-[var(--blue)]' : 'text-muted-foreground',
          )}
        >
          {score ?? '-'}
        </span>
      </span>
    </div>
  )

  return (
    <div>
      <button
        type="button"
        disabled={!canScore}
        onClick={() => canScore && setOpen((v) => !v)}
        className={cn(
          'w-full glass rounded-xl overflow-hidden border border-transparent text-left',
          canScore && 'hover:border-[var(--blue)]/40 transition-colors cursor-pointer',
        )}
      >
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-[10px] font-bold text-muted-foreground">
            M{match.matchNumber}
          </span>
          {completed && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 font-bold">
              Final
            </span>
          )}
        </div>
        <div className="divide-y divide-[var(--glass-border)] mt-1">
          <Row
            name={p1Name}
            score={match.score1}
            isWinner={completed && match.winnerId === match.participant1Id}
            isBye={!match.participant1Id && match.round === 1}
          />
          <Row
            name={p2Name}
            score={match.score2}
            isWinner={completed && match.winnerId === match.participant2Id}
            isBye={!match.participant2Id && match.round === 1}
          />
        </div>
      </button>

      {open && canScore && (
        <div className="glass rounded-xl p-3 mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white flex-1 truncate">{p1Name}</span>
            <input
              type="number"
              min={0}
              value={s1}
              onChange={(e) => setS1(Number(e.target.value))}
              className="w-12 glass rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none border border-transparent focus:border-[var(--blue)]/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white flex-1 truncate">{p2Name}</span>
            <input
              type="number"
              min={0}
              value={s2}
              onChange={(e) => setS2(Number(e.target.value))}
              className="w-12 glass rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none border border-transparent focus:border-[var(--blue)]/50"
            />
          </div>
          {error && <p className="text-[10px] text-red-400">{error}</p>}
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="w-full py-2 rounded-lg bg-[var(--blue)] text-[#050505] text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            Save Result
          </button>
        </div>
      )}
    </div>
  )
}
