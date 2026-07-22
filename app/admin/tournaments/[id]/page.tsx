import { notFound } from 'next/navigation'
import { getTournament } from '@/app/actions/tournaments'
import { TournamentManage } from '@/components/admin/tournament-manage'

export default async function ManageTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getTournament(id)
  if (!t) notFound()

  return <TournamentManage initial={t} />
}
