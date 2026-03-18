import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'
import { ArrowLeft, Edit } from 'lucide-react'
import TicketEditForm from '../../nuevo/TicketEditForm'

export const dynamic = 'force-dynamic'

export default async function EditTicketPage({ params }: { params: { id: string } }) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: { client: true, technician: true }
  })

  if (!ticket) notFound()

  // Mapea el ticket a la estructura que espera el TicketForm
  const initialData = {
    id: ticket.id,
    clientId: ticket.clientId || '',
    clientName: ticket.client?.name || '',
    clientPhone: ticket.client?.phone || '',
    clientEmail: ticket.client?.email || '',
    clientDocument: ticket.client?.document || '',

    technicianId: ticket.technicianId || '',
    deviceType: ticket.deviceType || 'Laptop',
    deviceBrand: ticket.deviceBrand || '',
    deviceModel: ticket.deviceModel || '',
    deviceProcessor: ticket.deviceProcessor || '',
    deviceRam: ticket.deviceRam || '',
    deviceGpu: ticket.deviceGpu || '',
    deviceDisks: ticket.deviceDisks || '',
    devicePowerSupply: ticket.devicePowerSupply || '',
    deviceHasCharger: ticket.deviceHasCharger || false,

    physicalCondition: ((ticket as any).physicalCondition) || {},
    accessories: ((ticket as any).accessories) || {},

    issueReported: ticket.issueReported || '',
    issueNotes: ticket.issueNotes || '',

    status: ticket.status,
    totalAmount: ticket.totalAmount?.toString() || '',
    paidAmount: ticket.paidAmount?.toString() || '',
    paymentStatus: ticket.paymentStatus || 'PENDING',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-200">
        <BackButton fallbackHref={`/admin/servicios/${params.id}`} />
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Edit className="w-7 h-7 text-blue-600" />
            Editar Ticket ST-{ticket.number.toString().padStart(4, '0')}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Modifica los datos del ticket. Los cambios se guardarán en la base de datos.</p>
        </div>
      </div>

      <TicketEditForm initialData={initialData} ticketId={params.id} />
    </div>
  )
}
