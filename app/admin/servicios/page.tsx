import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { Wrench, Plus, ArrowLeft } from 'lucide-react'
import ServicesListClient from './ServicesListClient'

export const dynamic = 'force-dynamic'

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const statusFilter = searchParams.status

  const tickets = await prisma.ticket.findMany({
    where: statusFilter ? { status: statusFilter as any } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      client: true,
      technician: true
    }
  })

  const total = await prisma.ticket.count()
  const pending = await prisma.ticket.count({ where: { status: 'PENDING' } })
  const inProgress = await prisma.ticket.count({ where: { status: 'IN_PROGRESS' } })
  const completed = await prisma.ticket.count({ where: { status: 'COMPLETED' } })
  const delivered = await prisma.ticket.count({ where: { status: 'DELIVERED' } })

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 bg-white hover:bg-gray-100 rounded-full border shadow-sm transition-colors text-gray-600" title="Regresar al panel">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wrench className="w-8 h-8 text-blue-600" />
              Servicios Técnicos
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Gestiona el flujo de trabajo de reparaciones y mantenimientos</p>
          </div>
        </div>
        <Link 
          href="/admin/servicios/nuevo" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Servicio
        </Link>
      </div>

      <ServicesListClient 
        initialTickets={tickets} 
        initialStats={{ total, pending, inProgress, completed, delivered }} 
        statusFilter={statusFilter} 
      />
    </div>
  )
}
