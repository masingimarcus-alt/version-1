import { notFound } from 'next/navigation'
import { getTournament, getJoinState } from '@/app/actions/tournaments'
import { TournamentDetail } from '@/components/tournament/tournament-detail'

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tournament = await getTournament(id)
  if (!tournament || tournament.status === 'draft') notFound()

  const joinState = await getJoinState(id)

  return <TournamentDetail tournament={tournament} joinState={joinState} />
}
