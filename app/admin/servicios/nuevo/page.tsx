import Link from 'next/link'
import { Wrench, ArrowLeft } from 'lucide-react'
import TicketEditForm from './TicketEditForm'

export const dynamic = 'force-dynamic'

export default async function NewServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
        <Link href="/admin/servicios"
          className="p-3 bg-white hover:bg-gray-100 rounded-2xl border border-gray-200 shadow-sm transition-colors text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </Link>
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
