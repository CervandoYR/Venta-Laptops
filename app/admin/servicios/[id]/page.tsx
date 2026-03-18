import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import TicketViewClient from './TicketViewClient'

export const dynamic = 'force-dynamic'

export default async function ViewTicketPage({
  params
}: {
  params: { id: string }
}) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      technician: true
    }
  })

  if (!ticket) {
    notFound()
  }

  // Obtenemos los técnicos para poder re-asignar en el lado cliente
  const technicians = await prisma.technician.findMany({
    orderBy: { name: 'asc' }
  })

  return <TicketViewClient ticket={ticket} technicians={technicians} />
}
