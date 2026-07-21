import { notFound } from 'next/navigation'
import { getTournament, type TournamentStatus, type TournamentFormat } from '@/app/actions/tournaments'
import { TournamentForm } from '@/components/admin/tournament-form'

export default async function EditTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getTournament(id)
  if (!t) notFound()

  return (
    <TournamentForm
      initial={{
        id: t.id,
        name: t.name,
        description: t.description ?? '',
        status: (t.status ?? 'draft') as TournamentStatus,
        format: (t.format ?? 'single_elimination') as TournamentFormat,
        maxParticipants: t.maxParticipants ?? 16,
        platform: t.platform ?? '',
        prizePool: t.prizePool ?? '',
        logoUrl: t.logoUrl ?? '',
        cover: t.cover ?? '',
        rules: t.rules ?? '',
        registrationDeadline: t.registrationDeadline ?? '',
        startDate: t.startDate ?? '',
        endDate: t.endDate ?? '',
      }}
    />
  )
}
