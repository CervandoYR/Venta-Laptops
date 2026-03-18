import Link from 'next/link'
import { Wrench } from 'lucide-react'
import TicketEditForm from './TicketEditForm'
import BackButton from '@/components/ui/BackButton'

export const dynamic = 'force-dynamic'

export default async function NewServicePage() {
  return (
    <div className="min-h-screen bg-gray-50/50 bg-admin-dots">
      <div className="container-admin py-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-9">
          <TicketEditForm />
        </div>
        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Acciones rápidas</p>
            <div className="flex flex-col gap-2">
              <Link href="/admin/servicios" className="px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-colors text-center">
                Ver listado de tickets
              </Link>
              <Link href="/admin/clientes" className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors text-center">
                Clientes ST
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Para trabajar más rápido</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2"><span className="text-gray-400">-</span>Completa primero: <span className="font-semibold text-gray-800">Marca + Modelo + Falla</span>.</li>
              <li className="flex gap-2"><span className="text-gray-400">-</span>En “Falla”, usa los botones de problemas comunes para evitar teclear.</li>
              <li className="flex gap-2"><span className="text-gray-400">-</span>Si el cliente existe, búscalo arriba y ahorras tiempo.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>
)
}
