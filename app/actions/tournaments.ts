'use server'

import { requireAdmin } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { tournament, tournamentParticipant, tournamentMatch } from '@/lib/db/schema'
import { eq, desc, ne, and, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/* ─────────────────────────── Types ─────────────────────────── */

export type TournamentStatus =
  | 'draft'
  | 'registration'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
export type TournamentFormat = 'single_elimination' | 'double_elimination'

export type Tournament = typeof tournament.$inferSelect
export type Participant = typeof tournamentParticipant.$inferSelect
export type Match = typeof tournamentMatch.$inferSelect

export type TournamentWithDetails = Tournament & {
  participants: Participant[]
  matches: Match[]
}

/* ─────────────────────────── Reads ─────────────────────────── */

/** Public tournaments (everything except drafts). */
export async function getPublicTournaments(): Promise<
  (Tournament & { participantCount: number })[]
> {
  const rows = await db
    .select()
    .from(tournament)
    .where(ne(tournament.status, 'draft'))
    .orderBy(desc(tournament.createdAt))

  const withCounts = await Promise.all(
    rows.map(async (t) => {
      const parts = await db
        .select()
        .from(tournamentParticipant)
        .where(eq(tournamentParticipant.tournamentId, t.id))
      return { ...t, participantCount: parts.length }
    }),
  )
  return withCounts
}

/** A single tournament with participants + matches (any status). */
export async function getTournament(
  id: string,
): Promise<TournamentWithDetails | null> {
  const [t] = await db.select().from(tournament).where(eq(tournament.id, id))
  if (!t) return null

  const participants = await db
    .select()
    .from(tournamentParticipant)
    .where(eq(tournamentParticipant.tournamentId, id))
    .orderBy(asc(tournamentParticipant.seed), asc(tournamentParticipant.createdAt))

  const matches = await db
    .select()
    .from(tournamentMatch)
    .where(eq(tournamentMatch.tournamentId, id))
    .orderBy(asc(tournamentMatch.round), asc(tournamentMatch.matchNumber))

  return { ...t, participants, matches }
}

/** All tournaments for admin, plus summary stats. */
export async function getAdminTournaments(): Promise<{
  tournaments: (Tournament & { participantCount: number })[]
  stats: { total: number; active: number; openRegistration: number; drafts: number }
}> {
  await requireAdmin()
  const rows = await db
    .select()
    .from(tournament)
    .orderBy(desc(tournament.createdAt))

  const tournaments = await Promise.all(
    rows.map(async (t) => {
      const parts = await db
        .select()
        .from(tournamentParticipant)
        .where(eq(tournamentParticipant.tournamentId, t.id))
      return { ...t, participantCount: parts.length }
    }),
  )

  const stats = {
    total: rows.length,
    active: rows.filter((t) => t.status === 'in_progress').length,
    openRegistration: rows.filter((t) => t.status === 'registration').length,
    drafts: rows.filter((t) => t.status === 'draft').length,
  }

  return { tournaments, stats }
}

/* ─────────────────────────── Tournament mutations ─────────────────────────── */

export type TournamentInput = {
  name: string
  description?: string
  game?: string
  platform?: string
  status?: TournamentStatus
  format?: TournamentFormat
  maxParticipants?: number
  prizePool?: string
  logoUrl?: string
  cover?: string
  rules?: string
  registrationDeadline?: string
  startDate?: string
  endDate?: string
}

export async function createTournament(data: TournamentInput): Promise<string> {
  const admin = await requireAdmin()
  const id = `tourn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  await db.insert(tournament).values({
    id,
    name: data.name.trim(),
    description: data.description ?? null,
    game: data.game?.trim() || 'EA Sports FC 26',
    platform: data.platform ?? null,
    status: data.status ?? 'draft',
    format: data.format ?? 'single_elimination',
    maxParticipants: data.maxParticipants ?? 16,
    prizePool: data.prizePool ?? null,
    logoUrl: data.logoUrl ?? null,
    cover: data.cover ?? null,
    rules: data.rules ?? null,
    registrationDeadline: data.registrationDeadline ?? null,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    createdBy: admin.id,
  })
  revalidatePath('/admin')
  revalidatePath('/tournaments')
  return id
}

export async function updateTournament(
  id: string,
  data: Partial<TournamentInput>,
): Promise<void> {
  await requireAdmin()
  await db
    .update(tournament)
    .set({
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.game !== undefined ? { game: data.game } : {}),
      ...(data.platform !== undefined ? { platform: data.platform } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.format !== undefined ? { format: data.format } : {}),
      ...(data.maxParticipants !== undefined
        ? { maxParticipants: data.maxParticipants }
        : {}),
      ...(data.prizePool !== undefined ? { prizePool: data.prizePool } : {}),
      ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
      ...(data.cover !== undefined ? { cover: data.cover } : {}),
      ...(data.rules !== undefined ? { rules: data.rules } : {}),
      ...(data.registrationDeadline !== undefined
        ? { registrationDeadline: data.registrationDeadline }
        : {}),
      ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
      ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
      updatedAt: new Date(),
    })
    .where(eq(tournament.id, id))
  revalidatePath('/admin')
  revalidatePath(`/admin/tournaments/${id}`)
  revalidatePath('/tournaments')
  revalidatePath(`/tournaments/${id}`)
}

export async function deleteTournament(id: string): Promise<void> {
  await requireAdmin()
  await db.delete(tournament).where(eq(tournament.id, id))
  revalidatePath('/admin')
  revalidatePath('/tournaments')
}

export async function setTournamentStatus(
  id: string,
  status: TournamentStatus,
): Promise<void> {
  await requireAdmin()
  await db
    .update(tournament)
    .set({ status, updatedAt: new Date() })
    .where(eq(tournament.id, id))
  revalidatePath('/admin')
  revalidatePath(`/admin/tournaments/${id}`)
  revalidatePath('/tournaments')
  revalidatePath(`/tournaments/${id}`)
}

/* ─────────────────────────── Participant mutations ─────────────────────────── */

export async function addParticipant(
  tournamentId: string,
  data: { name: string; email?: string; platform?: string },
): Promise<void> {
  await requireAdmin()
  const id = `part-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  await db.insert(tournamentParticipant).values({
    id,
    tournamentId,
    name: data.name.trim(),
    email: data.email?.trim() || null,
    platform: data.platform?.trim() || null,
    status: 'confirmed',
    checkedIn: false,
  })
  revalidatePath(`/admin/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}`)
}

export async function removeParticipant(
  participantId: string,
  tournamentId: string,
): Promise<void> {
  await requireAdmin()
  await db
    .delete(tournamentParticipant)
    .where(eq(tournamentParticipant.id, participantId))
  revalidatePath(`/admin/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}`)
}

export async function setParticipantStatus(
  participantId: string,
  tournamentId: string,
  status: 'confirmed' | 'pending',
): Promise<void> {
  await requireAdmin()
  await db
    .update(tournamentParticipant)
    .set({ status })
    .where(eq(tournamentParticipant.id, participantId))
  revalidatePath(`/admin/tournaments/${tournamentId}`)
}

export async function toggleCheckIn(
  participantId: string,
  tournamentId: string,
  checkedIn: boolean,
): Promise<void> {
  await requireAdmin()
  await db
    .update(tournamentParticipant)
    .set({ checkedIn })
    .where(eq(tournamentParticipant.id, participantId))
  revalidatePath(`/admin/tournaments/${tournamentId}`)
}

/* ─────────────────────────── Bracket generation ─────────────────────────── */

function nextPowerOfTwo(n: number): number {
  let p = 1
  while (p < n) p *= 2
  return Math.max(p, 2)
}

/**
 * Standard seeding order for a bracket of `size` slots (1-indexed seeds).
 * e.g. size 8 -> [1,8,4,5,2,7,3,6]
 */
function seedOrder(size: number): number[] {
  let rounds: number[] = [1, 2]
  while (rounds.length < size) {
    const next: number[] = []
    const sum = rounds.length * 2 + 1
    for (const r of rounds) {
      next.push(r)
      next.push(sum - r)
    }
    rounds = next
  }
  return rounds
}

/**
 * Generate a single- or double-elimination bracket for confirmed participants.
 * Seeds participants, pads to a power of two with byes, then links match
 * progression (winner -> nextMatch, loser -> loserNextMatch for double elim).
 */
export async function generateBracket(tournamentId: string): Promise<void> {
  await requireAdmin()

  const [t] = await db.select().from(tournament).where(eq(tournament.id, tournamentId))
  if (!t) throw new Error('Tournament not found')

  const confirmed = await db
    .select()
    .from(tournamentParticipant)
    .where(
      and(
        eq(tournamentParticipant.tournamentId, tournamentId),
        eq(tournamentParticipant.status, 'confirmed'),
      ),
    )
    .orderBy(asc(tournamentParticipant.createdAt))

  if (confirmed.length < 2) {
    throw new Error('Need at least 2 confirmed participants to generate a bracket')
  }

  // Clear any existing matches for a clean regeneration.
  await db.delete(tournamentMatch).where(eq(tournamentMatch.tournamentId, tournamentId))

  const size = nextPowerOfTwo(confirmed.length)

  // Assign seeds (1..N) in registration order and persist.
  for (let i = 0; i < confirmed.length; i++) {
    await db
      .update(tournamentParticipant)
      .set({ seed: i + 1 })
      .where(eq(tournamentParticipant.id, confirmed[i].id))
  }

  // seededSlots[slotIndex] = participantId or null (bye)
  const order = seedOrder(size)
  const seededSlots: (string | null)[] = order.map((seedNum) =>
    seedNum <= confirmed.length ? confirmed[seedNum - 1].id : null,
  )

  const rounds = Math.log2(size) // number of winners rounds

  // Pre-generate deterministic ids so we can link matches before insert.
  const mid = (prefix: string, r: number, m: number) =>
    `m-${tournamentId}-${prefix}-r${r}-${m}`

  type NewMatch = typeof tournamentMatch.$inferInsert
  const toInsert: NewMatch[] = []

  /* ---- Winners bracket ---- */
  // Round 1 built from seeded slots; later rounds are empty shells.
  const winnersRoundMatchIds: string[][] = []

  for (let r = 1; r <= rounds; r++) {
    const matchesInRound = size / Math.pow(2, r)
    const ids: string[] = []
    for (let m = 0; m < matchesInRound; m++) {
      ids.push(mid('w', r, m + 1))
    }
    winnersRoundMatchIds.push(ids)
  }

  for (let r = 1; r <= rounds; r++) {
    const ids = winnersRoundMatchIds[r - 1]
    for (let m = 0; m < ids.length; m++) {
      const matchId = ids[m]
      let p1: string | null = null
      let p2: string | null = null
      if (r === 1) {
        p1 = seededSlots[m * 2] ?? null
        p2 = seededSlots[m * 2 + 1] ?? null
      }
      // Winner advances to next winners round.
      const nextId = r < rounds ? winnersRoundMatchIds[r][Math.floor(m / 2)] : null
      const nextSlot = r < rounds ? (m % 2) + 1 : null

      toInsert.push({
        id: matchId,
        tournamentId,
        bracket: 'winners',
        round: r,
        matchNumber: m + 1,
        participant1Id: p1,
        participant2Id: p2,
        nextMatchId: nextId,
        nextMatchSlot: nextSlot,
        status: 'pending',
      })
    }
  }

  const isDouble = t.format === 'double_elimination'

  if (!isDouble) {
    // Auto-resolve byes in round 1 (opponent is null -> other advances).
    await db.insert(tournamentMatch).values(toInsert)
    await autoAdvanceByes(tournamentId)
    await touchStatus(tournamentId, t.status as TournamentStatus)
    revalidatePaths(tournamentId)
    return
  }

  /* ---- Losers bracket (double elimination) ---- */
  // Losers bracket has 2*(rounds-1) rounds. Standard structure:
  //  - "minor" rounds receive losers dropping from winners bracket
  //  - "major" rounds play the survivors against each other
  const losersRoundMatchIds: string[][] = []
  const losersRoundCount = (rounds - 1) * 2

  // Determine number of matches per losers round.
  // LB round sizes pattern for size N=2^k:
  //   round pairs: [N/4, N/4, N/8, N/8, ..., 1, 1]
  const losersRoundSizes: number[] = []
  {
    let feed = size / 4 // matches fed from winners round 2 losers
    // Special case: size === 2 -> no losers rounds
    for (let r = 0; r < losersRoundCount; r++) {
      if (r % 2 === 0) {
        losersRoundSizes.push(Math.max(1, feed))
      } else {
        losersRoundSizes.push(Math.max(1, feed))
        feed = Math.max(1, feed / 2)
      }
    }
  }

  for (let r = 1; r <= losersRoundCount; r++) {
    const count = losersRoundSizes[r - 1]
    const ids: string[] = []
    for (let m = 0; m < count; m++) ids.push(mid('l', r, m + 1))
    losersRoundMatchIds.push(ids)
  }

  // Grand final
  const grandFinalId = mid('gf', 1, 1)

  // Build losers matches with winner-advances links inside losers bracket.
  for (let r = 1; r <= losersRoundCount; r++) {
    const ids = losersRoundMatchIds[r - 1]
    for (let m = 0; m < ids.length; m++) {
      const matchId = ids[m]
      let nextId: string | null
      let nextSlot: number | null
      if (r < losersRoundCount) {
        const nextRoundIds = losersRoundMatchIds[r]
        // Minor round (odd) feeds 1:1 into the following major round;
        // major round (even) halves.
        const idx = r % 2 === 1 ? m : Math.floor(m / 2)
        nextId = nextRoundIds[Math.min(idx, nextRoundIds.length - 1)]
        nextSlot = r % 2 === 1 ? 2 : (m % 2) + 1
      } else {
        // Last losers round winner goes to grand final slot 2.
        nextId = grandFinalId
        nextSlot = 2
      }
      toInsert.push({
        id: matchId,
        tournamentId,
        bracket: 'losers',
        round: r,
        matchNumber: m + 1,
        nextMatchId: nextId,
        nextMatchSlot: nextSlot,
        status: 'pending',
      })
    }
  }

  // Wire winners-bracket losers into the losers bracket.
  for (let r = 1; r <= rounds; r++) {
    const ids = winnersRoundMatchIds[r - 1]
    // Losers from winners round r drop into a specific losers round.
    // WR1 losers -> LB round 1; WR(r>1) losers -> LB round 2*(r-1).
    const targetLosersRound = r === 1 ? 1 : 2 * (r - 1)
    const targetIds = losersRoundMatchIds[targetLosersRound - 1] ?? []
    for (let m = 0; m < ids.length; m++) {
      const wm = toInsert.find((x) => x.id === ids[m])!
      if (targetIds.length === 0) continue
      if (r === 1) {
        // Two WR1 losers per LB round-1 match.
        wm.loserNextMatchId = targetIds[Math.floor(m / 2)] ?? targetIds[0]
        wm.loserNextMatchSlot = (m % 2) + 1
      } else {
        wm.loserNextMatchId = targetIds[Math.min(m, targetIds.length - 1)]
        wm.loserNextMatchSlot = 1
      }
    }
  }

  // Winners bracket final winner -> grand final slot 1.
  const winnersFinal = toInsert.find(
    (x) => x.bracket === 'winners' && x.round === rounds,
  )
  if (winnersFinal) {
    winnersFinal.nextMatchId = grandFinalId
    winnersFinal.nextMatchSlot = 1
  }

  toInsert.push({
    id: grandFinalId,
    tournamentId,
    bracket: 'grand_final',
    round: 1,
    matchNumber: 1,
    nextMatchId: null,
    nextMatchSlot: null,
    status: 'pending',
  })

  await db.insert(tournamentMatch).values(toInsert)
  await autoAdvanceByes(tournamentId)
  await touchStatus(tournamentId, t.status as TournamentStatus)
  revalidatePaths(tournamentId)
}

/** Advance any round-1 winners matches that have a bye (one empty slot). */
async function autoAdvanceByes(tournamentId: string): Promise<void> {
  const r1 = await db
    .select()
    .from(tournamentMatch)
    .where(
      and(
        eq(tournamentMatch.tournamentId, tournamentId),
        eq(tournamentMatch.bracket, 'winners'),
        eq(tournamentMatch.round, 1),
      ),
    )
  for (const m of r1) {
    const hasP1 = !!m.participant1Id
    const hasP2 = !!m.participant2Id
    if (hasP1 !== hasP2) {
      const winnerId = (m.participant1Id ?? m.participant2Id)!
      await resolveMatch(m, winnerId, hasP1 ? 1 : 0, hasP1 ? 0 : 1)
    }
  }
}

/** If a status is draft/registration when a bracket generates, mark in_progress. */
async function touchStatus(id: string, current: TournamentStatus): Promise<void> {
  if (current === 'draft' || current === 'registration') {
    await db
      .update(tournament)
      .set({ status: 'in_progress', updatedAt: new Date() })
      .where(eq(tournament.id, id))
  }
}

function revalidatePaths(tournamentId: string) {
  revalidatePath('/admin')
  revalidatePath(`/admin/tournaments/${tournamentId}`)
  revalidatePath('/tournaments')
  revalidatePath(`/tournaments/${tournamentId}`)
}

/* ─────────────────────────── Scoring ─────────────────────────── */

/** Propagate a resolved match's winner (and loser) into downstream matches. */
async function resolveMatch(
  match: Match,
  winnerId: string,
  score1: number,
  score2: number,
): Promise<void> {
  await db
    .update(tournamentMatch)
    .set({ score1, score2, winnerId, status: 'completed' })
    .where(eq(tournamentMatch.id, match.id))

  const loserId =
    winnerId === match.participant1Id ? match.participant2Id : match.participant1Id

  // Winner advances.
  if (match.nextMatchId && match.nextMatchSlot) {
    const slotCol = match.nextMatchSlot === 1 ? 'participant1Id' : 'participant2Id'
    await db
      .update(tournamentMatch)
      .set({ [slotCol]: winnerId })
      .where(eq(tournamentMatch.id, match.nextMatchId))
    await autoResolveByeFor(match.nextMatchId)
  }

  // Loser drops (double elim).
  if (loserId && match.loserNextMatchId && match.loserNextMatchSlot) {
    const slotCol =
      match.loserNextMatchSlot === 1 ? 'participant1Id' : 'participant2Id'
    await db
      .update(tournamentMatch)
      .set({ [slotCol]: loserId })
      .where(eq(tournamentMatch.id, match.loserNextMatchId))
    await autoResolveByeFor(match.loserNextMatchId)
  }
}

/** If a downstream match ends up with only one participant and no opponent
 *  is ever coming, it stays pending until the other feeder resolves. We only
 *  auto-resolve genuine byes at round 1 (handled elsewhere). */
async function autoResolveByeFor(_matchId: string): Promise<void> {
  // Intentionally a no-op beyond round 1; kept for clarity/extension.
  return
}

export async function updateMatchScore(
  matchId: string,
  score1: number,
  score2: number,
): Promise<void> {
  await requireAdmin()
  const [match] = await db
    .select()
    .from(tournamentMatch)
    .where(eq(tournamentMatch.id, matchId))
  if (!match) throw new Error('Match not found')
  if (!match.participant1Id || !match.participant2Id) {
    throw new Error('Both participants must be set before scoring')
  }
  if (score1 === score2) {
    throw new Error('Draws are not allowed in elimination brackets')
  }

  const winnerId = score1 > score2 ? match.participant1Id : match.participant2Id
  await resolveMatch(match, winnerId, score1, score2)

  // If the grand final resolved, complete the tournament.
  if (match.bracket === 'grand_final') {
    await db
      .update(tournament)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(tournament.id, match.tournamentId))
  } else {
    // For single elimination, completing the final round completes it.
    const [t] = await db
      .select()
      .from(tournament)
      .where(eq(tournament.id, match.tournamentId))
    if (t && t.format === 'single_elimination' && !match.nextMatchId) {
      await db
        .update(tournament)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(tournament.id, match.tournamentId))
    }
  }

  revalidatePaths(match.tournamentId)
}
