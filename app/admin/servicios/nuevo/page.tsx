import Link from 'next/link'
import { Wrench } from 'lucide-react'
import TicketEditForm from './TicketEditForm'
import BackButton from '@/components/ui/BackButton'

export const dynamic = 'force-dynamic'

export default async function NewServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
        <BackButton fallbackHref="/admin/servicios" />
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-600" />
            Nuevo Ticket de Servicio
          </h1>
          <p className="text-gray-500 mt-1 text-base">Completa los datos del equipo y la falla reportada.</p>
        </div>
      </div>

      <TicketEditForm />
    </div>
  )
}
